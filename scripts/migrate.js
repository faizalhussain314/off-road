const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Parse .env files if present (without requiring dotenv package)
function loadEnv() {
  const envFiles = [
    path.join(__dirname, '..', '.env.production'),
    path.join(__dirname, '..', '.env.local'),
    path.join(__dirname, '..', '.env')
  ];

  for (const envPath of envFiles) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (process.env[key] === undefined) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

async function migrate() {
  loadEnv();

  console.log("==> Starting database migration check...");
  console.log(`Connecting to MySQL host: ${process.env.MYSQL_HOST || 'localhost'}, database: ${process.env.MYSQL_DATABASE || 'madprotek_offroad'}`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'madprotek_offroad',
      connectTimeout: 5000
    });
  } catch (err) {
    console.error("[Migration Error] Could not connect to MySQL:", err.message);
    console.warn("Continuing deployment without database migration (MySQL not reachable or not configured).");
    return;
  }

  try {
    // 1. Ensure registrations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        registration_code VARCHAR(50),
        driver_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        whatsapp VARCHAR(50),
        email VARCHAR(255),
        driver_city VARCHAR(100) NULL,
        driver_age VARCHAR(50) NULL,
        driver_gender VARCHAR(50) NULL,
        driver_id_proof VARCHAR(100) NULL,
        driver_id_proof_url VARCHAR(500) NULL,
        vehicle_owner VARCHAR(255) NULL,
        vehicle_reg_number VARCHAR(100) NULL,
        vehicle_make VARCHAR(100) NULL,
        vehicle_model VARCHAR(255) NOT NULL,
        manufacturing_year VARCHAR(50) NULL,
        vehicle_colour VARCHAR(50) NULL,
        fuel_type VARCHAR(50) NULL,
        transmission VARCHAR(50) NULL,
        drivetrain VARCHAR(50) NULL,
        is_modified TINYINT(1) DEFAULT 0,
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
        promo_code VARCHAR(100) NULL,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        payment_status VARCHAR(50) DEFAULT 'PENDING',
        payment_amount DECIMAL(10,2) NULL,
        payment_id VARCHAR(100) NULL,
        payment_order_id VARCHAR(100) NULL,
        payment_method VARCHAR(100) NULL,
        payment_time VARCHAR(100) NULL,
        payment_gateway VARCHAR(50) DEFAULT 'UPI_DIRECT',
        payment_raw_response LONGTEXT NULL,
        payment_screenshot_url VARCHAR(500) NULL,
        payment_utr VARCHAR(100) NULL,
        ticket_qr_token VARCHAR(100) NULL,
        checkin_status VARCHAR(50) DEFAULT 'NOT_CHECKED_IN',
        checkin_time VARCHAR(100) NULL,
        verification_status VARCHAR(50) DEFAULT 'PENDING_VERIFICATION',
        set_password_token VARCHAR(100) NULL,
        is_password_set TINYINT(1) DEFAULT 0,
        captcha_verified TINYINT(1) DEFAULT 1,
        status VARCHAR(50) DEFAULT 'PENDING_CALL',
        call_notes TEXT,
        slot_number INT NULL,
        source VARCHAR(50) DEFAULT 'ONLINE_WEB',
        payment_rejection_reason TEXT NULL,
        payment_verified_by VARCHAR(100) NULL,
        payment_verified_at VARCHAR(100) NULL,
        document_review_status VARCHAR(50) NULL,
        document_review_reason TEXT NULL,
        scrutineering_status VARCHAR(50) NULL,
        scrutineering_reason TEXT NULL,
        ticket_status VARCHAR(50) NULL,
        ticket_issued_at VARCHAR(100) NULL,
        ticket_issued_by VARCHAR(100) NULL,
        notifications_json LONGTEXT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Alter queries for registrations
    const safeAlterQueries = [
      "ALTER TABLE registrations ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1",
      "ALTER TABLE registrations ADD COLUMN payment_status VARCHAR(50) DEFAULT 'PENDING'",
      "ALTER TABLE registrations ADD COLUMN payment_amount DECIMAL(10,2) NULL",
      "ALTER TABLE registrations ADD COLUMN payment_id VARCHAR(100) NULL",
      "ALTER TABLE registrations ADD COLUMN payment_order_id VARCHAR(100) NULL",
      "ALTER TABLE registrations ADD COLUMN payment_method VARCHAR(100) NULL",
      "ALTER TABLE registrations ADD COLUMN payment_time VARCHAR(100) NULL",
      "ALTER TABLE registrations ADD COLUMN payment_gateway VARCHAR(50) DEFAULT 'UPI_DIRECT'",
      "ALTER TABLE registrations ADD COLUMN payment_raw_response LONGTEXT NULL",
      "ALTER TABLE registrations ADD COLUMN promo_code VARCHAR(100) NULL",
      "ALTER TABLE registrations ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0",
      "ALTER TABLE registrations ADD COLUMN driver_city VARCHAR(100) NULL",
      "ALTER TABLE registrations ADD COLUMN driver_age VARCHAR(50) NULL",
      "ALTER TABLE registrations ADD COLUMN driver_gender VARCHAR(50) NULL",
      "ALTER TABLE registrations ADD COLUMN driver_id_proof VARCHAR(100) NULL",
      "ALTER TABLE registrations ADD COLUMN driver_id_proof_url VARCHAR(500) NULL",
      "ALTER TABLE registrations ADD COLUMN vehicle_owner VARCHAR(255) NULL",
      "ALTER TABLE registrations ADD COLUMN vehicle_reg_number VARCHAR(100) NULL",
      "ALTER TABLE registrations ADD COLUMN vehicle_make VARCHAR(100) NULL",
      "ALTER TABLE registrations ADD COLUMN manufacturing_year VARCHAR(50) NULL",
      "ALTER TABLE registrations ADD COLUMN vehicle_colour VARCHAR(50) NULL",
      "ALTER TABLE registrations ADD COLUMN fuel_type VARCHAR(50) NULL",
      "ALTER TABLE registrations ADD COLUMN transmission VARCHAR(50) NULL",
      "ALTER TABLE registrations ADD COLUMN drivetrain VARCHAR(50) NULL",
      "ALTER TABLE registrations ADD COLUMN is_modified TINYINT(1) DEFAULT 0",
      "ALTER TABLE registrations ADD COLUMN set_password_token VARCHAR(100) NULL",
      "ALTER TABLE registrations ADD COLUMN is_password_set TINYINT(1) DEFAULT 0",
      "ALTER TABLE registrations ADD COLUMN captcha_verified TINYINT(1) DEFAULT 1",
      "ALTER TABLE registrations ADD COLUMN payment_screenshot_url VARCHAR(500) NULL",
      "ALTER TABLE registrations ADD COLUMN payment_utr VARCHAR(100) NULL",
      "ALTER TABLE registrations ADD COLUMN ticket_qr_token VARCHAR(100) NULL",
      "ALTER TABLE registrations ADD COLUMN checkin_status VARCHAR(50) DEFAULT 'NOT_CHECKED_IN'",
      "ALTER TABLE registrations ADD COLUMN checkin_time VARCHAR(100) NULL",
      "ALTER TABLE registrations ADD COLUMN verification_status VARCHAR(50) DEFAULT 'PENDING_VERIFICATION'",
      "ALTER TABLE registrations ADD COLUMN payment_rejection_reason TEXT NULL",
      "ALTER TABLE registrations ADD COLUMN payment_verified_by VARCHAR(100) NULL",
      "ALTER TABLE registrations ADD COLUMN payment_verified_at VARCHAR(100) NULL",
      "ALTER TABLE registrations ADD COLUMN document_review_status VARCHAR(50) NULL",
      "ALTER TABLE registrations ADD COLUMN document_review_reason TEXT NULL",
      "ALTER TABLE registrations ADD COLUMN scrutineering_status VARCHAR(50) NULL",
      "ALTER TABLE registrations ADD COLUMN scrutineering_reason TEXT NULL",
      "ALTER TABLE registrations ADD COLUMN ticket_status VARCHAR(50) NULL",
      "ALTER TABLE registrations ADD COLUMN ticket_issued_at VARCHAR(100) NULL",
      "ALTER TABLE registrations ADD COLUMN ticket_issued_by VARCHAR(100) NULL",
      "ALTER TABLE registrations ADD COLUMN notifications_json LONGTEXT NULL",
    ];

    for (const q of safeAlterQueries) {
      try {
        await connection.query(q);
      } catch (e) {
        // Ignored if column already exists
      }
    }

    // 2. System Settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Sponsor Inquiries table
    await connection.query(`
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
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    try {
      await connection.query("ALTER TABLE sponsor_inquiries ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1");
    } catch (e) {
      // Column may already exist
    }

    // 4. One-time idempotent recovery check for Vishnu Narayanan
    try {
      const [existing] = await connection.query(
        "SELECT id FROM registrations WHERE phone = '7022277001' OR payment_utr = '630379310386' LIMIT 1"
      );
      if (!Array.isArray(existing) || existing.length === 0) {
        const [insertRes] = await connection.query(
          `INSERT INTO registrations (
            driver_name, phone, whatsapp, experience_type, experience_date, pricing_tier,
            total_amount, payment_amount, payment_status, payment_method, payment_gateway,
            payment_utr, verification_status, status, call_notes, is_active, source
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'ONLINE_WEB')`,
          [
            "Vishnu Narayanan",
            "7022277001",
            "+917022277001",
            "OWN 4X4 EXPERIENCE",
            "14 NOV 2026",
            "Regular Entry (₹6,999)",
            6999.00,
            6999.00,
            "PENDING",
            "UPI (Google Pay / PhonePe / Paytm)",
            "UPI_DIRECT",
            "630379310386",
            "PENDING_VERIFICATION",
            "SCRUTINEERING_REVIEW",
            "UPI UTR: 630379310386",
          ]
        );
        const newId = insertRes.insertId;
        const regCode = `MAT26-${String(newId).padStart(4, "0")}`;
        await connection.query("UPDATE registrations SET registration_code = ? WHERE id = ?", [regCode, newId]);
        console.log(`[DB Migration] Recovered Vishnu Narayanan under ID ${newId} (${regCode})`);
      } else {
        console.log("[DB Migration] Vishnu Narayanan record already exists.");
      }
    } catch (e) {
      console.error("[DB Migration] Vishnu recovery check note:", e.message);
    }

    console.log("==> Database migrations applied successfully!");
  } catch (err) {
    console.error("[Migration Error]:", err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
