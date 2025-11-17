const express = require("express");
const pool = require("../config/db");
const router = express.Router();

/* -------------------------------------------------
 * Utility functions
 * ------------------------------------------------- */

// ตรวจสอบว่าห้องว่างไหม
async function isRoomAvailable(roomId, startTime, endTime) {
  console.log("🔍 [CHECK ROOM AVAILABLE]", { roomId, startTime, endTime });

  const [rows] = await pool.query(
    `SELECT * 
     FROM reservations 
     WHERE room_id = ? 
       AND (start_time < ? AND end_time > ?)`,
    [roomId, endTime, startTime]
  );

  console.log("📌 [ROOM AVAILABLE RESULT] rows:", rows.length);
  return rows.length === 0;
}

// ตรวจสอบผู้ใช้ตาม user_id
async function findUserById(userId) {
  const [rows] = await pool.query(
    "SELECT user_id, name, email FROM users WHERE user_id = ?",
    [userId]
  );
  return rows;
}

// ดึงข้อมูลผู้ใช้จาก code_user หลายตัว
async function findUsersByCodes(codeUsers) {
  const [rows] = await pool.query(
    "SELECT code_user, name, email FROM users WHERE code_user IN (?)",
    [codeUsers]
  );
  return rows;
}

// ตรวจสอบเวลา
function validateBookingTime(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const hours = (end - start) / 3600000;

  if (
    start.getHours() < 9 ||
    end.getHours() > 17 ||
    end <= start ||
    hours > 2
  ) {
    return false;
  }
  return true;
}

/* -------------------------------------------------
 * Routes
 * ------------------------------------------------- */

// 🔎 เช็คว่ามี userId นี้ในระบบไหม
router.get("/my/check/:check_userId", async (req, res) => {
  const { check_userId } = req.params;
  console.log("📩 [CHECK USER]", check_userId);

  try {
    const rows = await findUserById(check_userId);

    if (rows.length === 0) {
      console.log("❌ ไม่พบผู้ใช้");
      return res.status(404).json({ error: "ไม่พบผู้ใช้นี้ในระบบ" });
    }

    console.log("✅ พบผู้ใช้:", rows[0]);
    res.json({
      message: "User พบในระบบ",
      user: rows[0],
    });
  } catch (err) {
    console.error("❌ [CHECK USER ERROR]:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🟢 จองห้อง
router.post("/room", async (req, res) => {
  console.log("📩 [ROOM] Request Body:", req.body);
  const { userId, roomId, startTime, endTime, codeUsers } = req.body;

  try {
    // จำนวนสมาชิก
    if (!Array.isArray(codeUsers) || codeUsers.length < 3) {
      return res.status(400).json({ error: "ต้องมีสมาชิกอย่างน้อย 3 คน" });
    }

    // ตรวจสอบเวลา
    if (!validateBookingTime(startTime, endTime)) {
      return res.status(400).json({ error: "เวลาจองไม่ถูกต้อง" });
    }

    // ตรวจสอบห้องว่าง
    if (!(await isRoomAvailable(roomId, startTime, endTime))) {
      return res.status(400).json({ error: "ห้องไม่ว่างในช่วงเวลานี้" });
    }

    // ตรวจสอบ code_user ทั้งหมด
    const validUsers = await findUsersByCodes(codeUsers);

    if (validUsers.length !== codeUsers.length) {
      const foundCodes = validUsers.map((u) => u.code_user);
      const missing = codeUsers.filter((c) => !foundCodes.includes(c));

      return res.status(400).json({
        error: `ไม่พบรหัสผู้ใช้ต่อไปนี้: ${missing.join(", ")}`,
      });
    }

    // Insert reservation
    const [result] = await pool.query(
      `INSERT INTO reservations 
       (user_id, room_id, start_time, end_time, status, created_at) 
       VALUES (?, ?, ?, ?, 'Confirmed', NOW())`,
      [userId, roomId, startTime, endTime]
    );

    const reservationId = result.insertId;

    // Insert members
    for (const user of validUsers) {
      await pool.query(
        `INSERT INTO reservation_members (reservation_id, name, email)
         VALUES (?, ?, ?)`,
        [reservationId, user.name, user.email]
      );
    }

    res.json({ message: "จองสำเร็จ", reservationId });
  } catch (err) {
    console.error("❌ [ROOM ERROR]:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 ดึงรายการจองของผู้ใช้
router.get("/my/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        r.reservation_id, 
        r.room_id, 
        r.start_time, 
        r.end_time, 
        rm.name AS member_name
      FROM reservations r
      JOIN reservation_members rm 
        ON r.reservation_id = rm.reservation_id
      WHERE r.user_id = ?
         OR rm.email = (SELECT email FROM users WHERE user_id = ?)
      `,
      [userId, userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ [GET MY ERROR]:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
