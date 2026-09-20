import { NextRequest, NextResponse } from "next/server";
import { getSetting, setSetting, checkMysqlConnection, initDb } from "@/lib/db";

export async function GET() {
  try {
    await initDb();
    const isMysql = await checkMysqlConnection();
    const onlineOpen = await getSetting("online_registration_open", "false");
    const maxSlots = await getSetting("max_slots", "30");

    return NextResponse.json({
      success: true,
      data: {
        online_registration_open: onlineOpen === "true",
        max_slots: Number(maxSlots) || 30,
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

    return NextResponse.json({ success: true, message: "Settings updated" });
  } catch (error: any) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
