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
