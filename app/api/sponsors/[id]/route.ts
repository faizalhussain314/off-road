import { NextRequest, NextResponse } from "next/server";
import { updateSponsorInquiry, deleteSponsorInquiry, initDb } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initDb();
    const id = Number(params.id);
    if (!id || isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid sponsor ID" }, { status: 400 });
    }

    const updates = await request.json();
    const updated = await updateSponsorInquiry(id, updates);

    if (!updated) {
      return NextResponse.json({ success: false, error: "Sponsor inquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PATCH /api/sponsors/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update sponsor inquiry" },
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
      return NextResponse.json({ success: false, error: "Invalid sponsor ID" }, { status: 400 });
    }

    const ok = await deleteSponsorInquiry(id);
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    console.error("DELETE /api/sponsors/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete sponsor inquiry" },
      { status: 500 }
    );
  }
}
