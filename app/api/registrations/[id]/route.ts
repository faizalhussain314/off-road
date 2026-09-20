import { NextRequest, NextResponse } from "next/server";
import { updateRegistration, deleteRegistration, initDb } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initDb();
    const id = Number(params.id);
    if (!id || isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid registration ID" }, { status: 400 });
    }

    const updates = await request.json();
    const updated = await updateRegistration(id, updates);

    if (!updated) {
      return NextResponse.json({ success: false, error: "Registration not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PATCH /api/registrations/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update registration" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initDb();
    const id = Number(params.id);
    if (!id || isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid registration ID" }, { status: 400 });
    }

    const ok = await deleteRegistration(id);
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    console.error("DELETE /api/registrations/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete registration" },
      { status: 500 }
    );
  }
}
