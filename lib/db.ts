import mysql from "mysql2/promise";

export interface RegistrationRecord {
  id: number;
  driver_name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  vehicle_model: string;
  rig_class: string;
  modifications?: string;
  experience_years?: string;
  spotter_name?: string;
  spotter_phone?: string;
  status: "PENDING_CALL" | "CALLED_FOLLOW_UP" | "SCRUTINEERING_REVIEW" | "SLOT_CONFIRMED" | "WAITLISTED" | "CANCELLED";
  call_notes?: string;
  slot_number?: number | null;
  source: "PHONE_MANUAL" | "ONLINE_WEB";
  created_at: string;
  updated_at: string;
}

declare global {
  var __offroad_registrations: RegistrationRecord[] | undefined;
  var __offroad_settings: Record<string, string> | undefined;
  var __offroad_next_id: number | undefined;
  var __offroad_pool: mysql.Pool | undefined;
}

// Clean production store: Zero dummy records
const initialRegistrations: RegistrationRecord[] = [];

if (!globalThis.__offroad_registrations) {
  globalThis.__offroad_registrations = [];
}
if (!globalThis.__offroad_settings) {
  globalThis.__offroad_settings = {
    online_registration_open: "false", // Currently phone registration intake phase
    max_slots: "30",
  };
}
if (!globalThis.__offroad_next_id) {
  globalThis.__offroad_next_id = 1;
}

const memoryRegistrations = globalThis.__offroad_registrations;
const memorySettings = globalThis.__offroad_settings;
let nextId = globalThis.__offroad_next_id;

let mysqlAvailable: boolean | null = null;

function getPool(): mysql.Pool {
  if (!globalThis.__offroad_pool) {
    globalThis.__offroad_pool = mysql.createPool({
      host: process.env.MYSQL_HOST || "localhost",
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "madprotek_offroad",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 3000,
    });
  }
  return globalThis.__offroad_pool;
}

export async function checkMysqlConnection(): Promise<boolean> {
  try {
    const p = getPool();
    const conn = await p.getConnection();
    conn.release();
    mysqlAvailable = true;
    return true;
  } catch (err) {
    globalThis.__offroad_pool = undefined;
    mysqlAvailable = false;
    return false;
  }
}

export async function initDb(): Promise<void> {
  const isAvailable = await checkMysqlConnection();
  if (!isAvailable) {
    console.log("[DB Adapter] MySQL not reachable at host. Running in resilient mock/local store mode.");
    return;
  }

  try {
    const p = getPool();
    await p.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        driver_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        whatsapp VARCHAR(50),
        email VARCHAR(255),
        vehicle_model VARCHAR(255) NOT NULL,
        rig_class VARCHAR(100) NOT NULL,
        modifications TEXT,
        experience_years VARCHAR(50),
        spotter_name VARCHAR(255),
        spotter_phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'PENDING_CALL',
        call_notes TEXT,
        slot_number INT NULL,
        source VARCHAR(50) DEFAULT 'PHONE_MANUAL',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Initialize default settings if not already present
    await p.query(
      "INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES ('online_registration_open', 'false')"
    );
    await p.query(
      "INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES ('max_slots', '30')"
    );
  } catch (err) {
    console.error("[DB Adapter] Error initializing MySQL tables:", err);
  }
}

export async function getRegistrations(filters?: {
  search?: string;
  status?: string;
  rigClass?: string;
}): Promise<RegistrationRecord[]> {
  const isAvailable = await checkMysqlConnection();

  if (isAvailable) {
    try {
      const p = getPool();
      let query = "SELECT * FROM registrations WHERE 1=1";
      const params: any[] = [];

      if (filters?.status && filters.status !== "ALL") {
        query += " AND status = ?";
        params.push(filters.status);
      }

      if (filters?.rigClass && filters.rigClass !== "ALL") {
        query += " AND rig_class = ?";
        params.push(filters.rigClass);
      }

      if (filters?.search) {
        query += " AND (driver_name LIKE ? OR vehicle_model LIKE ? OR phone LIKE ?)";
        const term = `%${filters.search}%`;
        params.push(term, term, term);
      }

      query += " ORDER BY slot_number IS NULL, slot_number ASC, created_at DESC";
      const [rows]: any = await p.query(query, params);
      return rows.map((r: any) => ({
        ...r,
        created_at: new Date(r.created_at).toISOString(),
        updated_at: new Date(r.updated_at).toISOString(),
      }));
    } catch (err) {
      console.error("[DB Adapter] MySQL query failed, falling back to memory store:", err);
    }
  }

  // In-memory fallback
  let list = [...(globalThis.__offroad_registrations || memoryRegistrations)];
  if (filters?.status && filters.status !== "ALL") {
    list = list.filter((r) => r.status === filters.status);
  }
  if (filters?.rigClass && filters.rigClass !== "ALL") {
    list = list.filter((r) => r.rig_class === filters.rigClass);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(
      (r) =>
        r.driver_name.toLowerCase().includes(s) ||
        r.vehicle_model.toLowerCase().includes(s) ||
        r.phone.toLowerCase().includes(s)
    );
  }
  list.sort((a, b) => {
    if (a.slot_number && !b.slot_number) return -1;
    if (!a.slot_number && b.slot_number) return 1;
    if (a.slot_number && b.slot_number) return a.slot_number - b.slot_number;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  return list;
}

export async function createRegistration(
  data: Omit<RegistrationRecord, "id" | "created_at" | "updated_at">
): Promise<RegistrationRecord> {
  const isAvailable = await checkMysqlConnection();

  if (isAvailable) {
    try {
      const p = getPool();
      const [res]: any = await p.query(
        `INSERT INTO registrations (
          driver_name, phone, whatsapp, email, vehicle_model, rig_class,
          modifications, experience_years, spotter_name, spotter_phone,
          status, call_notes, slot_number, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.driver_name,
          data.phone,
          data.whatsapp || null,
          data.email || null,
          data.vehicle_model,
          data.rig_class,
          data.modifications || null,
          data.experience_years || null,
          data.spotter_name || null,
          data.spotter_phone || null,
          data.status || "PENDING_CALL",
          data.call_notes || null,
          data.slot_number || null,
          data.source || "PHONE_MANUAL",
        ]
      );

      const [rows]: any = await p.query("SELECT * FROM registrations WHERE id = ?", [res.insertId]);
      return {
        ...rows[0],
        created_at: new Date(rows[0].created_at).toISOString(),
        updated_at: new Date(rows[0].updated_at).toISOString(),
      };
    } catch (err) {
      console.error("[DB Adapter] MySQL insert error:", err);
    }
  }

  // In-memory fallback
  const store = globalThis.__offroad_registrations || memoryRegistrations;
  const currentId = globalThis.__offroad_next_id ?? 4;
  globalThis.__offroad_next_id = currentId + 1;

  const newRecord: RegistrationRecord = {
    ...data,
    id: currentId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.unshift(newRecord);
  return newRecord;
}

export async function updateRegistration(
  id: number,
  updates: Partial<RegistrationRecord>
): Promise<RegistrationRecord | null> {
  const isAvailable = await checkMysqlConnection();

  if (isAvailable) {
    try {
      const p = getPool();
      const keys = Object.keys(updates).filter((k) => k !== "id" && k !== "created_at");
      if (keys.length > 0) {
        const setClause = keys.map((k) => `${k} = ?`).join(", ");
        const values = keys.map((k) => (updates as any)[k]);
        values.push(id);
        await p.query(`UPDATE registrations SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
        const [rows]: any = await p.query("SELECT * FROM registrations WHERE id = ?", [id]);
        if (rows.length > 0) {
          return {
            ...rows[0],
            created_at: new Date(rows[0].created_at).toISOString(),
            updated_at: new Date(rows[0].updated_at).toISOString(),
          };
        }
      }
    } catch (err) {
      console.error("[DB Adapter] MySQL update error:", err);
    }
  }

  // In-memory fallback
  const store = globalThis.__offroad_registrations || memoryRegistrations;
  const index = store.findIndex((r) => r.id === id);
  if (index === -1) return null;
  store[index] = {
    ...store[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return store[index];
}

export async function deleteRegistration(id: number): Promise<boolean> {
  const isAvailable = await checkMysqlConnection();

  if (isAvailable) {
    try {
      const p = getPool();
      const [res]: any = await p.query("DELETE FROM registrations WHERE id = ?", [id]);
      return res.affectedRows > 0;
    } catch (err) {
      console.error("[DB Adapter] MySQL delete error:", err);
    }
  }

  // In-memory fallback
  const store = globalThis.__offroad_registrations || memoryRegistrations;
  const index = store.findIndex((r) => r.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}

export async function getSystemSetting(key: string, defaultValue: string = ""): Promise<string> {
  const isAvailable = await checkMysqlConnection();

  if (isAvailable) {
    try {
      const p = getPool();
      const [rows]: any = await p.query(
        "SELECT setting_value FROM system_settings WHERE setting_key = ?",
        [key]
      );
      if (rows.length > 0) {
        return rows[0].setting_value;
      }
    } catch (err) {
      console.error("[DB Adapter] MySQL getSetting error:", err);
    }
  }

  const settingsStore = globalThis.__offroad_settings || memorySettings;
  return settingsStore[key] ?? defaultValue;
}

export async function setSystemSetting(key: string, value: string): Promise<void> {
  const isAvailable = await checkMysqlConnection();

  if (isAvailable) {
    try {
      const p = getPool();
      await p.query(
        `INSERT INTO system_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP`,
        [key, value]
      );
      return;
    } catch (err) {
      console.error("[DB Adapter] MySQL setSetting error:", err);
    }
  }

  const settingsStore = globalThis.__offroad_settings || memorySettings;
  settingsStore[key] = value;
}

export const getSetting = getSystemSetting;
export const setSetting = setSystemSetting;

