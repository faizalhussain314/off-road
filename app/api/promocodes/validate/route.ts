import { NextRequest, NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, total_amount } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, valid: false, message: "Please enter a promo code." },
        { status: 400 }
      );
    }

    const currentTotal = Number(total_amount) || 0;
    const result = await validatePromoCode(code, currentTotal);

    return NextResponse.json({
      success: true,
      valid: result.valid,
      discount: result.discount,
      finalTotal: result.finalTotal,
      message: result.message,
      promo: result.promo,
    });
  } catch (error: any) {
    console.error("POST /api/promocodes/validate error:", error);
    return NextResponse.json(
      { success: false, valid: false, error: error.message || "Failed to validate promo code" },
      { status: 500 }
    );
  }
}
