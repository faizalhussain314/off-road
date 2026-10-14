import { NextRequest, NextResponse } from "next/server";
import { getSetting, setSetting, checkMysqlConnection, initDb } from "@/lib/db";

export async function GET() {
  try {
    await initDb();
    const isMysql = await checkMysqlConnection();
    const onlineOpen = await getSetting("online_registration_open", "true");
    const maxSlots = await getSetting("max_slots", "50");
    const priceEarlyBird = await getSetting("price_early_bird", "5999");
    const priceRegular = await getSetting("price_regular", "6999");
    const priceOrganiser = await getSetting("price_organiser", "1999");
    const priceExtreme = await getSetting("price_extreme", "999");
    const priceAdditional = await getSetting("price_additional_participant", "699");
    const closedMessage = await getSetting(
      "registration_closed_message",
      "Online registrations for 4X4 Adventure Trail 2026 are currently closed. Please contact event marshals for on-spot inquiry or waitlist."
    );

    return NextResponse.json({
      success: true,
      data: {
        online_registration_open: onlineOpen === "true",
        max_slots: Number(maxSlots) || 50,
        price_early_bird: Number(priceEarlyBird) || 5999,
        price_regular: Number(priceRegular) || 6999,
        price_organiser: Number(priceOrganiser) || 1999,
        price_extreme: Number(priceExtreme) || 999,
        price_additional_participant: Number(priceAdditional) || 699,
        registration_closed_message: closedMessage,
        mysql_connected: isMysql,
        database_host: process.env.MYSQL_HOST || "localhost",
        database_name: process.env.MYSQL_DATABASE || "madprotek_offroad",
      },
    });
  } catch (error: any) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();

    if (typeof body.online_registration_open !== "undefined") {
      await setSetting("online_registration_open", body.online_registration_open ? "true" : "false");
    }

    if (typeof body.max_slots !== "undefined") {
      await setSetting("max_slots", String(body.max_slots));
    }

    if (typeof body.price_early_bird !== "undefined") {
      await setSetting("price_early_bird", String(body.price_early_bird));
    }

    if (typeof body.price_regular !== "undefined") {
      await setSetting("price_regular", String(body.price_regular));
    }

    if (typeof body.price_organiser !== "undefined") {
      await setSetting("price_organiser", String(body.price_organiser));
    }

    if (typeof body.price_extreme !== "undefined") {
      await setSetting("price_extreme", String(body.price_extreme));
    }

    if (typeof body.price_additional_participant !== "undefined") {
      await setSetting("price_additional_participant", String(body.price_additional_participant));
    }

    if (typeof body.registration_closed_message !== "undefined") {
      await setSetting("registration_closed_message", String(body.registration_closed_message));
    }

    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (error: any) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
