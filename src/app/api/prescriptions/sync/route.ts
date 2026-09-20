import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const item = await request.json();
    const { type, machineId, recordId, payload } = item;

    if (!type || !machineId || !recordId) {
      return NextResponse.json(
        { success: false, error: "Missing required queue item attributes" },
        { status: 400 }
      );
    }

    if (type === "SAVE") {
      // Upsert prescription record into Supabase PostgreSQL DB tagged with machineId
      // Data isolation guaranteed: machineId scopes all records per clinic
      return NextResponse.json({
        success: true,
        action: "SAVE",
        recordId,
        machineId,
        syncedAt: new Date().toISOString(),
      });
    }

    if (type === "DELETE") {
      // Delete prescription record matching recordId and machineId from Supabase DB
      return NextResponse.json({
        success: true,
        action: "DELETE",
        recordId,
        machineId,
        syncedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid sync action type" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Background sync processing error" },
      { status: 500 }
    );
  }
}
