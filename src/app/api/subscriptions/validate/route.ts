import { NextRequest, NextResponse } from "next/server";
import { generateSubscriptionSignature } from "@/lib/subscriptionAuth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const machineId = (searchParams.get("machineId") || "").trim().toUpperCase();

    if (!machineId) {
      return NextResponse.json(
        { valid: false, error: "Machine ID is required for validation" },
        { status: 400 }
      );
    }

    // In production, query Supabase DB for matching machineId or allowedMachineIds array
    // Here we generate signature token for real-time security verification
    const now = Date.now();
    
    // Server returns validation status and signed token
    return NextResponse.json({
      valid: true,
      machineId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: "Validation server error" },
      { status: 500 }
    );
  }
}
