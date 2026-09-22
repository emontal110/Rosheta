import { NextRequest, NextResponse } from "next/server";
import { generateSubscriptionSignature } from "@/lib/subscriptionAuth";
import { prisma } from "@/lib/prisma";

export interface ServerSubscriptionRecord {
  id: string;
  planId: string;
  planName: string;
  price: number;
  paymentMethod: "vodafone" | "instapay";
  senderPhone: string;
  transactionRef: string;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "SUSPENDED";
  machineId: string;
  allowedMachineIds?: string[];
  doctorName?: string;
  clinicName?: string;
  createdAt: string;
  activatedAt?: string;
  expiresAt?: string;
  durationDays?: number;
  signatureToken?: string;
  isTrial?: boolean;
}

// Global server-side fallback in-memory subscription store
const globalServerSubscriptions: ServerSubscriptionRecord[] = [];

export async function GET(request: NextRequest) {
  try {
    let dbSubscriptions: ServerSubscriptionRecord[] = [];
    try {
      const records = await prisma.subscription.findMany({
        orderBy: { createdAt: "desc" },
      });
      dbSubscriptions = records.map((r) => ({
        id: r.id,
        planId: r.planId,
        planName: r.planName,
        price: r.price,
        paymentMethod: r.paymentMethod as "vodafone" | "instapay",
        senderPhone: r.senderPhone,
        transactionRef: r.transactionRef,
        status: r.status as any,
        machineId: r.machineId,
        allowedMachineIds: r.allowedMachineIds,
        doctorName: r.doctorName || undefined,
        clinicName: r.clinicName || undefined,
        createdAt: r.createdAt.toISOString(),
        activatedAt: r.activatedAt ? r.activatedAt.toISOString() : undefined,
        expiresAt: r.expiresAt ? r.expiresAt.toISOString() : undefined,
        durationDays: r.durationDays || undefined,
        signatureToken: r.signatureToken || undefined,
        isTrial: r.isTrial || undefined,
      }));
    } catch (dbErr) {
      console.warn("Supabase DB fetch fallback to in-memory:", dbErr);
    }

    // Merge DB records with in-memory fallback
    const mergedMap = new Map<string, ServerSubscriptionRecord>();
    globalServerSubscriptions.forEach((s) => mergedMap.set(s.id, s));
    dbSubscriptions.forEach((s) => mergedMap.set(s.id, s));

    const finalSubs = Array.from(mergedMap.values());

    return NextResponse.json({
      success: true,
      subscriptions: finalSubs,
    });
  } catch (error) {
    return NextResponse.json({ success: false, subscriptions: globalServerSubscriptions }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, subscription, subscriptionId, machineId, daysDelta, durationDays, newMachineId } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: "Action is required" }, { status: 400 });
    }

    // 1. Submit new subscription from Doctor's Mobile or PC
    if (action === "submit" && subscription) {
      const existingIndex = globalServerSubscriptions.findIndex((s) => s.id === subscription.id);
      if (existingIndex >= 0) {
        globalServerSubscriptions[existingIndex] = { ...globalServerSubscriptions[existingIndex], ...subscription };
      } else {
        globalServerSubscriptions.unshift(subscription);
      }

      try {
        await prisma.subscription.upsert({
          where: { id: subscription.id },
          create: {
            id: subscription.id,
            planId: subscription.planId,
            planName: subscription.planName,
            price: subscription.price,
            paymentMethod: subscription.paymentMethod,
            senderPhone: subscription.senderPhone || "",
            transactionRef: subscription.transactionRef || "",
            status: subscription.status || "PENDING",
            machineId: subscription.machineId,
            allowedMachineIds: subscription.allowedMachineIds || [],
            doctorName: subscription.doctorName || null,
            clinicName: subscription.clinicName || null,
            durationDays: subscription.durationDays || 30,
            isTrial: subscription.isTrial || false,
            createdAt: subscription.createdAt ? new Date(subscription.createdAt) : new Date(),
          },
          update: {
            planId: subscription.planId,
            planName: subscription.planName,
            price: subscription.price,
            paymentMethod: subscription.paymentMethod,
            senderPhone: subscription.senderPhone,
            transactionRef: subscription.transactionRef,
            status: subscription.status,
            machineId: subscription.machineId,
            doctorName: subscription.doctorName,
            clinicName: subscription.clinicName,
          },
        });
      } catch (dbErr) {
        console.warn("Supabase DB submit upsert error:", dbErr);
      }

      return NextResponse.json({
        success: true,
        subscriptions: globalServerSubscriptions,
      });
    }

    // 2. Activate subscription by Admin
    if (action === "activate" && subscriptionId) {
      const now = new Date();
      const durDays = durationDays || 30;
      const expires = new Date();
      expires.setDate(now.getDate() + durDays);

      const target = globalServerSubscriptions.find((s) => s.id === subscriptionId);
      let targetMachineId = target?.machineId || machineId || "RSH-UNKNOWN";
      const signatureToken = generateSubscriptionSignature(targetMachineId, "ACTIVE", expires.toISOString());

      if (target) {
        target.status = "ACTIVE";
        target.activatedAt = now.toISOString();
        target.expiresAt = expires.toISOString();
        target.durationDays = durDays;
        target.signatureToken = signatureToken;
      }

      try {
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: "ACTIVE",
            activatedAt: now,
            expiresAt: expires,
            durationDays: durDays,
            signatureToken: signatureToken,
          },
        });
      } catch (dbErr) {
        console.warn("Supabase DB activate update error:", dbErr);
      }

      return NextResponse.json({
        success: true,
        subscriptions: globalServerSubscriptions,
      });
    }

    // 3. Adjust subscription days (+ / -) by Admin
    if (action === "adjust_days" && subscriptionId && daysDelta !== undefined) {
      const target = globalServerSubscriptions.find((s) => s.id === subscriptionId);
      const currentExpire = target?.expiresAt ? new Date(target.expiresAt).getTime() : Date.now();
      const newExpireTime = currentExpire + daysDelta * 24 * 60 * 60 * 1000;
      const now = Date.now();
      const isExpiredNow = newExpireTime <= now;
      const newStatus = isExpiredNow ? "EXPIRED" : "ACTIVE";
      const expiresIso = new Date(newExpireTime).toISOString();
      const targetMachineId = target?.machineId || machineId || "RSH-UNKNOWN";
      const signatureToken = generateSubscriptionSignature(targetMachineId, newStatus, expiresIso);

      if (target) {
        target.status = newStatus;
        target.expiresAt = expiresIso;
        target.durationDays = Math.max(
          0,
          Math.ceil((newExpireTime - (target.activatedAt ? new Date(target.activatedAt).getTime() : now)) / (1000 * 60 * 60 * 24))
        );
        target.signatureToken = signatureToken;
      }

      try {
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: newStatus,
            expiresAt: new Date(newExpireTime),
            durationDays: Math.max(0, Math.ceil((newExpireTime - now) / (1000 * 60 * 60 * 24))),
            signatureToken: signatureToken,
          },
        });
      } catch (dbErr) {
        console.warn("Supabase DB adjust days update error:", dbErr);
      }

      return NextResponse.json({
        success: true,
        subscriptions: globalServerSubscriptions,
      });
    }

    // 4. Update bound primary machine ID
    if (action === "update_machine_id" && subscriptionId && newMachineId) {
      const cleanMachineId = newMachineId.trim().toUpperCase();
      const target = globalServerSubscriptions.find((s) => s.id === subscriptionId);
      if (target) {
        target.machineId = cleanMachineId;
        target.signatureToken = generateSubscriptionSignature(cleanMachineId, target.status, target.expiresAt);
      }

      try {
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: { machineId: cleanMachineId },
        });
      } catch (dbErr) {
        console.warn("Supabase DB update machine ID error:", dbErr);
      }

      return NextResponse.json({ success: true, subscriptions: globalServerSubscriptions });
    }

    // 5. Suspend or Delete subscription
    if (action === "suspend" && subscriptionId) {
      const target = globalServerSubscriptions.find((s) => s.id === subscriptionId);
      if (target) target.status = "SUSPENDED";

      try {
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: { status: "SUSPENDED" },
        });
      } catch (dbErr) {
        console.warn("Supabase DB suspend error:", dbErr);
      }

      return NextResponse.json({ success: true, subscriptions: globalServerSubscriptions });
    }

    if (action === "delete" && subscriptionId) {
      const idx = globalServerSubscriptions.findIndex((s) => s.id === subscriptionId);
      if (idx >= 0) globalServerSubscriptions.splice(idx, 1);

      try {
        await prisma.subscription.delete({
          where: { id: subscriptionId },
        });
      } catch (dbErr) {
        console.warn("Supabase DB delete error:", dbErr);
      }

      return NextResponse.json({ success: true, subscriptions: globalServerSubscriptions });
    }

    // 6. Update Doctor & Clinic Info by Doctor Name Sync
    if (action === "update_doctor_info" && machineId) {
      const { doctorName, clinicName } = body;

      globalServerSubscriptions.forEach((sub) => {
        if (sub.machineId === machineId || (sub.allowedMachineIds && sub.allowedMachineIds.includes(machineId))) {
          if (doctorName !== undefined) sub.doctorName = doctorName;
          if (clinicName !== undefined) sub.clinicName = clinicName;
        }
      });

      try {
        await prisma.subscription.updateMany({
          where: {
            OR: [
              { machineId: machineId },
              { allowedMachineIds: { has: machineId } },
            ],
          },
          data: {
            ...(doctorName !== undefined ? { doctorName } : {}),
            ...(clinicName !== undefined ? { clinicName } : {}),
          },
        });
      } catch (dbErr) {
        console.warn("Supabase DB update doctor info error:", dbErr);
      }

      return NextResponse.json({ success: true, subscriptions: globalServerSubscriptions });
    }

    return NextResponse.json({ success: true, subscriptions: globalServerSubscriptions });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server processing error" }, { status: 500 });
  }
}
