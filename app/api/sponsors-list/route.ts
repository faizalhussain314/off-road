import { NextRequest, NextResponse } from "next/server";
import {
  getSponsorsList,
  createSponsorItem,
  updateSponsorItem,
  deleteSponsorItem,
  setTitleSponsor,
  initDb,
} from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";

    const sponsors = await getSponsorsList(!showAll);
    const titleSponsor = sponsors.find((s) => s.is_title && s.is_active) || null;

    return NextResponse.json({
      success: true,
      sponsors,
      titleSponsor,
      hasTitleSponsor: Boolean(titleSponsor),
    });
  } catch (error: any) {
    console.error("GET /api/sponsors-list error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch sponsors" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();

    if (!body.name || !body.logo_url) {
      return NextResponse.json(
        { success: false, error: "Sponsor brand name and logo are required." },
        { status: 400 }
      );
    }

    const newSponsor = await createSponsorItem({
      name: body.name,
      logo_url: body.logo_url,
      tier: body.tier || "Official Partner",
      is_title: Boolean(body.is_title),
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      website_url: body.website_url || "",
      display_order: body.display_order !== undefined ? Number(body.display_order) : undefined,
    });

    return NextResponse.json({ success: true, sponsor: newSponsor }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/sponsors-list error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create sponsor" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();

    // Special action: Set or clear Title Sponsor
    if (body.action === "SET_TITLE_SPONSOR") {
      const targetId = body.id !== undefined && body.id !== null ? Number(body.id) : null;
      await setTitleSponsor(targetId);
      const updatedList = await getSponsorsList(false);
      return NextResponse.json({
        success: true,
        message: targetId ? "Title sponsor updated successfully." : "Title sponsor removed.",
        sponsors: updatedList,
      });
    }

    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Sponsor ID is required." }, { status: 400 });
    }

    const updated = await updateSponsorItem(Number(id), updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Sponsor not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, sponsor: updated });
  } catch (error: any) {
    console.error("PATCH /api/sponsors-list error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update sponsor" },
      { status: 500 }
    );
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

    const ok = await deleteSponsorItem(Number(id));
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    console.error("DELETE /api/sponsors-list error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete sponsor" },
      { status: 500 }
    );
  }
}
