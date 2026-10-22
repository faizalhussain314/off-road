import { NextRequest, NextResponse } from "next/server";
import { updateRegistration, deleteRegistration, initDb, getRegistrationById } from "@/lib/db";
import { requireAdmin, getAdminFromRequest } from "@/lib/adminAuth";
import { triggerPaymentThankYouWhatsApp } from "@/lib/whatsapp";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    await initDb();
    const id = Number(params.id);
    if (!id || isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid registration ID" }, { status: 400 });
    }

    const previous = await getRegistrationById(id);
    if (!previous) {
      return NextResponse.json({ success: false, error: "Registration not found" }, { status: 404 });
    }

    const updates = await request.json();
    const admin = getAdminFromRequest(request);
    const adminName = admin?.u || "Admin";

    // Track payment verification metadata
    if (updates.payment_status === "PAID" && previous.payment_status !== "PAID") {
      updates.payment_verified_at = new Date().toISOString();
      updates.payment_verified_by = adminName;
    }

    // Track document/scrutineering sync
    if (updates.verification_status === "VERIFIED") {
      if (!updates.document_review_status) updates.document_review_status = "APPROVED";
      if (!updates.scrutineering_status) updates.scrutineering_status = "APPROVED";
    }

    const updated = await updateRegistration(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Registration not found" }, { status: 404 });
    }

    // Case 4: An administrator-approved UPI payment triggers the thank-you message
    if (updates.payment_status === "PAID" && previous.payment_status !== "PAID") {
      try {
        await triggerPaymentThankYouWhatsApp(id);
      } catch (waErr) {
        console.error("Failed to trigger WhatsApp thank-you after admin approval:", waErr);
      }
    }

    // If verified or confirmed, dispatch approval email to driver if email is configured
    if (
      (updates.verification_status === "VERIFIED" || updates.status === "SLOT_CONFIRMED") &&
      updated.email
    ) {
      try {
        const { sendTicketApprovedEmail } = await import("@/lib/email");
        await sendTicketApprovedEmail({
          toEmail: updated.email,
          driverName: updated.driver_name,
          registrationCode: updated.registration_code || `MAT26-${updated.id}`,
          slotNumber: updated.slot_number || `SLOT-${updated.id}`,
        });
      } catch (e) {
        console.error("Failed to send ticket approval email in PATCH route:", e);
      }
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
  const denied = requireAdmin(request);
  if (denied) return denied;

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
