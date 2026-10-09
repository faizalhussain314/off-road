import { NextRequest, NextResponse } from "next/server";
import { getSponsorInquiries, createSponsorInquiry, updateSponsorInquiry, deleteSponsorInquiry, initDb } from "@/lib/db";

export async function GET() {
  try {
    await initDb();
    const data = await getSponsorInquiries();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("GET /api/sponsors error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch sponsor inquiries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();

    if (!body.company_name || !body.contact_person || !body.phone || !body.email) {
      return NextResponse.json(
        { success: false, error: "Company Name, Contact Person, Phone, and Email are required." },
        { status: 400 }
      );
    }

    const newRecord = await createSponsorInquiry({
      company_name: body.company_name,
      contact_person: body.contact_person,
      email: body.email,
      phone: body.phone,
      tier_interest: body.tier_interest || "Title Partner (₹3,50,000)",
      request_type: body.request_type || "SPONSORSHIP_INQUIRY",
      brand_category: body.brand_category || "Automotive / 4x4",
      gst_number: body.gst_number || "",
      billing_address: body.billing_address || "",
      message: body.message || "",
    });

    return NextResponse.json({ success: true, data: newRecord }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/sponsors error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit sponsor inquiry" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const updated = await updateSponsorInquiry(Number(id), updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Sponsor inquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PATCH /api/sponsors error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const ok = await deleteSponsorInquiry(Number(id));
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    console.error("DELETE /api/sponsors error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
