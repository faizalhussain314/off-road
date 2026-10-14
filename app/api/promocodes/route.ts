import { NextRequest, NextResponse } from "next/server";
import {
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
} from "@/lib/db";

export async function GET() {
  try {
    const codes = await getPromoCodes();
    return NextResponse.json({ success: true, data: codes });
  } catch (error: any) {
    console.error("GET /api/promocodes error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch promo codes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.code || !body.discount_value) {
      return NextResponse.json(
        { success: false, error: "Promo code and discount value are required." },
        { status: 400 }
      );
    }

    const newCode = await createPromoCode({
      code: body.code,
      description: body.description || "",
      discount_type: body.discount_type || "FLAT",
      discount_value: Number(body.discount_value),
      min_order_amount: Number(body.min_order_amount) || 0,
      max_discount_amount: body.max_discount_amount ? Number(body.max_discount_amount) : undefined,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      max_uses: body.max_uses ? Number(body.max_uses) : undefined,
    });

    return NextResponse.json({ success: true, data: newCode }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/promocodes error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create promo code" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Promo code ID is required" },
        { status: 400 }
      );
    }

    const updated = await updatePromoCode(Number(id), updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Promo code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PATCH /api/promocodes error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update promo code" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Promo code ID is required" },
        { status: 400 }
      );
    }

    const success = await deletePromoCode(Number(id));
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Promo code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Promo code deleted" });
  } catch (error: any) {
    console.error("DELETE /api/promocodes error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete promo code" },
      { status: 500 }
    );
  }
}
