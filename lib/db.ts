import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

export interface PassengerInfo {
  name: string;
  age: string | number;
  gender: string;
  mobile: string;
  relationship: string;
  id_uploaded?: string;
}

export interface ModificationDetails {
  suspension?: string;
  tyres_type?: string;
  tyre_size?: string;
  wheel_size?: string;
  differential?: string;
  winch?: string;
  snorkel?: string;
  bull_bar?: string;
  recovery_points?: string;
  other_mods?: string;
  photos?: {
    front?: string;
    rear?: string;
    side?: string;
  };
}

export interface VehicleDocuments {
  rc_uploaded?: boolean | string;
  insurance_company?: string;
  insurance_policy?: string;
  insurance_expiry?: string;
  insurance_uploaded?: boolean | string;
  puc_number?: string;
  puc_expiry?: string;
  puc_uploaded?: boolean | string;
}

export interface SafetyExperience {
  experience_level?: string;
  participated_before?: boolean;
  event_count?: string | number;
  terrains?: string[];
  blood_group?: string;
  allergies?: string;
  medical_conditions?: string;
  medications?: string;
}

export interface RegistrationRecord {
  id: number;
  registration_code?: string; // e.g. MAT26-0012

  // Experience
  experience_type?: string; // DAY 1 - OWN 4X4 EXPERIENCE | DAY 2 - ORGANISER 4X4 EXPERIENCE | DAY 2 - EXTREME 4X4 THRILL EXPERIENCE
  experience_date?: string; // 14 NOV 2026 | 15 NOV 2026
  pricing_tier?: string; // Early Bird (₹5,999) | Regular (₹6,999) | etc.
  total_amount?: number;
  additional_participants_count?: number;

  // Primary Driver Details
  driver_name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  driver_age?: string | number;
  driver_gender?: string;
  driver_city?: string;
  driver_id_proof?: string;

  // Passengers / Crew
  passengers?: PassengerInfo[];

  // Vehicle Details
  vehicle_owner?: string;
  vehicle_reg_number?: string;
  vehicle_make?: string;
  vehicle_model: string;
  manufacturing_year?: string;
  vehicle_colour?: string;
  fuel_type?: string;
  transmission?: string;
  drivetrain?: string;
  is_modified?: boolean;
  rig_class?: string;
  modifications?: string;
  modification_details?: ModificationDetails;

  // Documents
  documents?: VehicleDocuments;

  // Safety & Medical
  safety_experience?: SafetyExperience;
  experience_years?: string;
  spotter_name?: string;
  spotter_phone?: string;

  // Status & Metadata
  status: "PENDING_CALL" | "CALLED_FOLLOW_UP" | "SCRUTINEERING_REVIEW" | "SLOT_CONFIRMED" | "WAITLISTED" | "CANCELLED";
  call_notes?: string;
  slot_number?: number | null;
  source: "PHONE_MANUAL" | "ONLINE_WEB";
  created_at: string;
  updated_at: string;
}

export interface SponsorInquiryRecord {
  id: number;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  tier_interest: string;
  request_type: "SPONSORSHIP_INQUIRY" | "REQUEST_INVOICE" | "DOWNLOAD_DECK";
  brand_category?: string;
  gst_number?: string;
  billing_address?: string;
  message?: string;
  status: "NEW" | "CONTACTED" | "INVOICE_SENT" | "CONFIRMED" | "DECLINED";
  created_at: string;
}

// Persistent JSON file fallback directory
const DATA_DIR = path.join(process.cwd(), "data");
const REG_FILE = path.join(DATA_DIR, "registrations.json");
const SPONSOR_FILE = path.join(DATA_DIR, "sponsors.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      // Ignore
    }
  }
}

function loadFromFile<T>(filePath: string, fallback: T): T {
  try {
    ensureDataDir();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
  }
  return fallback;
}

function saveToFile<T>(filePath: string, data: T) {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error(`Error saving to ${filePath}:`, e);
  }
}

declare global {
  var __offroad_registrations: RegistrationRecord[] | undefined;
  var __offroad_sponsors: SponsorInquiryRecord[] | undefined;
  var __offroad_settings: Record<string, string> | undefined;
  var __offroad_next_id: number | undefined;
  var __offroad_sponsor_next_id: number | undefined;
  var __offroad_pool: mysql.Pool | undefined;
}

if (!globalThis.__offroad_registrations) {
  globalThis.__offroad_registrations = loadFromFile<RegistrationRecord[]>(REG_FILE, []);
}
if (!globalThis.__offroad_sponsors) {
  globalThis.__offroad_sponsors = loadFromFile<SponsorInquiryRecord[]>(SPONSOR_FILE, []);
}
if (!globalThis.__offroad_settings) {
  globalThis.__offroad_settings = loadFromFile<Record<string, string>>(SETTINGS_FILE, {
    online_registration_open: "true",
    max_slots: "50",
  });
}
if (!globalThis.__offroad_next_id) {
  const maxId = (globalThis.__offroad_registrations || []).reduce((max, r) => Math.max(max, r.id || 0), 10);
  globalThis.__offroad_next_id = maxId + 1;
}
if (!globalThis.__offroad_sponsor_next_id) {
  const maxSponsorId = (globalThis.__offroad_sponsors || []).reduce((max, s) => Math.max(max, s.id || 0), 0);
  globalThis.__offroad_sponsor_next_id = maxSponsorId + 1;
}

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
    return;
  }

  try {
    const p = getPool();
    await p.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        registration_code VARCHAR(50),
        driver_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        whatsapp VARCHAR(50),
        email VARCHAR(255),
        vehicle_model VARCHAR(255) NOT NULL,
        rig_class VARCHAR(100) DEFAULT 'General 4x4',
        experience_type VARCHAR(100),
        experience_date VARCHAR(50),
        pricing_tier VARCHAR(100),
        total_amount DECIMAL(10,2),
        passengers_json LONGTEXT,
        vehicle_json LONGTEXT,
        documents_json LONGTEXT,
        safety_json LONGTEXT,
        modifications TEXT,
        experience_years VARCHAR(50),
        spotter_name VARCHAR(255),
        spotter_phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'PENDING_CALL',
        call_notes TEXT,
        slot_number INT NULL,
        source VARCHAR(50) DEFAULT 'ONLINE_WEB',
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

    await p.query(`
      CREATE TABLE IF NOT EXISTS sponsor_inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        tier_interest VARCHAR(100) NOT NULL,
        request_type VARCHAR(50) DEFAULT 'SPONSORSHIP_INQUIRY',
        brand_category VARCHAR(100),
        gst_number VARCHAR(50),
        billing_address TEXT,
        message TEXT,
        status VARCHAR(50) DEFAULT 'NEW',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
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
        query += " AND (rig_class = ? OR experience_type = ?)";
        params.push(filters.rigClass, filters.rigClass);
      }

      if (filters?.search) {
        query += " AND (driver_name LIKE ? OR vehicle_model LIKE ? OR phone LIKE ? OR registration_code LIKE ?)";
        const term = `%${filters.search}%`;
        params.push(term, term, term, term);
      }

      query += " ORDER BY slot_number IS NULL, slot_number ASC, created_at DESC";
      const [rows]: any = await p.query(query, params);
      return rows.map((r: any) => ({
        ...r,
        passengers: r.passengers_json ? JSON.parse(r.passengers_json) : r.passengers,
        modification_details: r.vehicle_json ? JSON.parse(r.vehicle_json) : r.modification_details,
        documents: r.documents_json ? JSON.parse(r.documents_json) : r.documents,
        safety_experience: r.safety_json ? JSON.parse(r.safety_json) : r.safety_experience,
        created_at: new Date(r.created_at).toISOString(),
        updated_at: new Date(r.updated_at).toISOString(),
      }));
    } catch (err) {
      console.error("[DB Adapter] MySQL query failed, falling back to local store:", err);
    }
  }

  // Memory & File fallback
  let list = [...loadFromFile<RegistrationRecord[]>(REG_FILE, globalThis.__offroad_registrations || [])];
  if (filters?.status && filters.status !== "ALL") {
    list = list.filter((r) => r.status === filters.status);
  }
  if (filters?.rigClass && filters.rigClass !== "ALL") {
    list = list.filter((r) => r.rig_class === filters.rigClass || r.experience_type === filters.rigClass);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(
      (r) =>
        r.driver_name?.toLowerCase().includes(s) ||
        r.vehicle_model?.toLowerCase().includes(s) ||
        r.phone?.toLowerCase().includes(s) ||
        r.registration_code?.toLowerCase().includes(s)
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
  const store = globalThis.__offroad_registrations || [];
  const currentId = globalThis.__offroad_next_id ?? 12;
  globalThis.__offroad_next_id = currentId + 1;

  // Auto generate registration code MAT26-XXXX if not provided
  const regCode = data.registration_code || `MAT26-${String(currentId).padStart(4, "0")}`;

  const newRecord: RegistrationRecord = {
    ...data,
    id: currentId,
    registration_code: regCode,
    rig_class: data.rig_class || data.experience_type || "General 4x4",
    status: data.status || "PENDING_CALL",
    source: data.source || "ONLINE_WEB",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.unshift(newRecord);
  globalThis.__offroad_registrations = store;
  saveToFile(REG_FILE, store);

  // Try MySQL if available
  const isAvailable = await checkMysqlConnection();
  if (isAvailable) {
    try {
      const p = getPool();
      await p.query(
        `INSERT INTO registrations (
          id, registration_code, driver_name, phone, whatsapp, email, vehicle_model, rig_class,
          experience_type, experience_date, pricing_tier, total_amount,
          passengers_json, vehicle_json, documents_json, safety_json,
          modifications, experience_years, spotter_name, spotter_phone,
          status, call_notes, slot_number, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`,
        [
          newRecord.id,
          newRecord.registration_code,
          newRecord.driver_name,
          newRecord.phone,
          newRecord.whatsapp || null,
          newRecord.email || null,
          newRecord.vehicle_model,
          newRecord.rig_class || null,
          newRecord.experience_type || null,
          newRecord.experience_date || null,
          newRecord.pricing_tier || null,
          newRecord.total_amount || 0,
          JSON.stringify(newRecord.passengers || []),
          JSON.stringify(newRecord.modification_details || {}),
          JSON.stringify(newRecord.documents || {}),
          JSON.stringify(newRecord.safety_experience || {}),
          newRecord.modifications || null,
          newRecord.experience_years || null,
          newRecord.spotter_name || null,
          newRecord.spotter_phone || null,
          newRecord.status,
          newRecord.call_notes || null,
          newRecord.slot_number || null,
          newRecord.source,
        ]
      );
    } catch (err) {
      console.error("[DB Adapter] MySQL insert error:", err);
    }
  }

  return newRecord;
}

export async function updateRegistration(
  id: number,
  updates: Partial<RegistrationRecord>
): Promise<RegistrationRecord | null> {
  const store = globalThis.__offroad_registrations || [];
  const index = store.findIndex((r) => r.id === id);
  if (index === -1) return null;

  store[index] = {
    ...store[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  globalThis.__offroad_registrations = store;
  saveToFile(REG_FILE, store);

  // Try MySQL
  const isAvailable = await checkMysqlConnection();
  if (isAvailable) {
    try {
      const p = getPool();
      if (updates.status) {
        await p.query("UPDATE registrations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [updates.status, id]);
      }
      if (updates.call_notes !== undefined) {
        await p.query("UPDATE registrations SET call_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [updates.call_notes, id]);
      }
      if (updates.slot_number !== undefined) {
        await p.query("UPDATE registrations SET slot_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [updates.slot_number, id]);
      }
    } catch (err) {
      console.error("[DB Adapter] MySQL update error:", err);
    }
  }

  return store[index];
}

export async function deleteRegistration(id: number): Promise<boolean> {
  const store = globalThis.__offroad_registrations || [];
  const index = store.findIndex((r) => r.id === id);
  if (index === -1) return false;

  store.splice(index, 1);
  globalThis.__offroad_registrations = store;
  saveToFile(REG_FILE, store);

  const isAvailable = await checkMysqlConnection();
  if (isAvailable) {
    try {
      const p = getPool();
      await p.query("DELETE FROM registrations WHERE id = ?", [id]);
    } catch (err) {
      console.error("[DB Adapter] MySQL delete error:", err);
    }
  }

  return true;
}

export async function getSystemSetting(key: string, defaultValue: string = ""): Promise<string> {
  const settingsStore = globalThis.__offroad_settings || {};
  return settingsStore[key] ?? defaultValue;
}

export async function setSystemSetting(key: string, value: string): Promise<void> {
  const settingsStore = globalThis.__offroad_settings || {};
  settingsStore[key] = value;
  globalThis.__offroad_settings = settingsStore;
  saveToFile(SETTINGS_FILE, settingsStore);
}

export const getSetting = getSystemSetting;
export const setSetting = setSystemSetting;

export async function createSponsorInquiry(data: {
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  tier_interest: string;
  request_type?: "SPONSORSHIP_INQUIRY" | "REQUEST_INVOICE" | "DOWNLOAD_DECK";
  brand_category?: string;
  gst_number?: string;
  billing_address?: string;
  message?: string;
}): Promise<SponsorInquiryRecord> {
  const store = globalThis.__offroad_sponsors || [];
  const nextSponsorId = (globalThis.__offroad_sponsor_next_id || 1);
  globalThis.__offroad_sponsor_next_id = nextSponsorId + 1;
  const now = new Date().toISOString();

  const record: SponsorInquiryRecord = {
    id: nextSponsorId,
    company_name: data.company_name,
    contact_person: data.contact_person,
    email: data.email,
    phone: data.phone,
    tier_interest: data.tier_interest,
    request_type: data.request_type || "SPONSORSHIP_INQUIRY",
    brand_category: data.brand_category || "Automotive / 4x4",
    gst_number: data.gst_number || "",
    billing_address: data.billing_address || "",
    message: data.message || "",
    status: "NEW",
    created_at: now,
  };

  store.unshift(record);
  globalThis.__offroad_sponsors = store;
  saveToFile(SPONSOR_FILE, store);

  const isAvailable = await checkMysqlConnection();
  if (isAvailable) {
    try {
      const p = getPool();
      await p.query(
        `INSERT INTO sponsor_inquiries (
          id, company_name, contact_person, email, phone, tier_interest,
          request_type, brand_category, gst_number, billing_address, message, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.id,
          record.company_name,
          record.contact_person,
          record.email,
          record.phone,
          record.tier_interest,
          record.request_type,
          record.brand_category,
          record.gst_number,
          record.billing_address,
          record.message,
          record.status,
        ]
      );
    } catch (err) {
      console.error("[DB Adapter] MySQL createSponsorInquiry error:", err);
    }
  }

  return record;
}

export async function getSponsorInquiries(): Promise<SponsorInquiryRecord[]> {
  return loadFromFile<SponsorInquiryRecord[]>(SPONSOR_FILE, globalThis.__offroad_sponsors || []);
}

export async function updateSponsorInquiry(
  id: number,
  updates: Partial<SponsorInquiryRecord>
): Promise<SponsorInquiryRecord | null> {
  const store = globalThis.__offroad_sponsors || [];
  const index = store.findIndex((s) => s.id === id);
  if (index === -1) return null;

  store[index] = {
    ...store[index],
    ...updates,
  };
  globalThis.__offroad_sponsors = store;
  saveToFile(SPONSOR_FILE, store);

  const isAvailable = await checkMysqlConnection();
  if (isAvailable) {
    try {
      const p = getPool();
      if (updates.status) {
        await p.query("UPDATE sponsor_inquiries SET status = ? WHERE id = ?", [updates.status, id]);
      }
    } catch (e) {
      console.error("MySQL update sponsor error:", e);
    }
  }

  return store[index];
}

export async function deleteSponsorInquiry(id: number): Promise<boolean> {
  const store = globalThis.__offroad_sponsors || [];
  const index = store.findIndex((s) => s.id === id);
  if (index === -1) return false;

  store.splice(index, 1);
  globalThis.__offroad_sponsors = store;
  saveToFile(SPONSOR_FILE, store);

  const isAvailable = await checkMysqlConnection();
  if (isAvailable) {
    try {
      const p = getPool();
      await p.query("DELETE FROM sponsor_inquiries WHERE id = ?", [id]);
    } catch (e) {
      console.error("MySQL delete sponsor error:", e);
    }
  }

  return true;
}
