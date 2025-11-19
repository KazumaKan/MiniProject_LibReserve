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
       AND (start_time < ? AND end_time > ?)
       AND status != 'Cancelled'`,
    [roomId, endTime, startTime]
  );

  console.log("📌 [ROOM AVAILABLE RESULT] rows:", rows.length);
  return rows.length === 0;
}

// ตรวจสอบผู้ใช้ตาม code_user
async function findUserByCode(code_user) {
  const [rows] = await pool.query(
    "SELECT user_id, code_user, name, email FROM users WHERE code_user = ?",
    [code_user]
  );
  return rows;
}

// ดึงข้อมูลผู้ใช้จาก code_user หลายตัว
async function findUsersByCodes(codeUsers) {
  if (!Array.isArray(codeUsers) || codeUsers.length === 0) return [];

  const [rows] = await pool.query(
    "SELECT code_user, name, email FROM users WHERE code_user IN (?)",
    [codeUsers]
  );
  return rows;
}

// ตรวจสอบเวลา + ห้ามจองย้อนหลัง
function validateBookingTime(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  // ตัดเวลาออก เหลือแค่ YYYY-MM-DD
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // ❌ ห้ามจองย้อนหลัง
  if (start < today) {
    console.log("❌ ห้ามจองย้อนหลัง");
    return false;
  }

  const hours = (end - start) / 3600000; // คำนวณจำนวนชั่วโมง

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

// 🔎 เช็คว่ามี code_user นี้ในระบบไหม
router.get("/my/check/:check_userId", async (req, res) => {
  const { check_userId } = req.params;
  console.log("📩 [CHECK USER]", check_userId);

  try {
    const rows = await findUserByCode(check_userId);

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

// 🟢 จองห้อง → สถานะเริ่มต้น Pending
router.post("/room", async (req, res) => {
  console.log("📩 [ROOM] Request Body:", req.body);
  const { userId, roomId, startTime, endTime, codeUsers } = req.body;

  try {
    // จำนวนสมาชิก
    if (!Array.isArray(codeUsers) || codeUsers.length < 3) {
      return res.status(400).json({ error: "ต้องมีสมาชิกอย่างน้อย 3 คน" });
    }

    // ตรวจสอบเวลาและวันย้อนหลัง
    if (!validateBookingTime(startTime, endTime)) {
      return res
        .status(400)
        .json({ error: "เวลาจองไม่ถูกต้องหรือเป็นวันย้อนหลัง" });
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

    // Insert reservation → Pending
    const [result] = await pool.query(
      `INSERT INTO reservations 
       (user_id, room_id, start_time, end_time, status, created_at) 
       VALUES (?, ?, ?, ?, 'Pending', NOW())`,
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

// ❌ ยกเลิกการจอง → status = Cancelled
router.put("/cancel/:reservationId", async (req, res) => {
  const { reservationId } = req.params;

  try {
    const [result] = await pool.query(
      `UPDATE reservations 
       SET status = 'Cancelled'
       WHERE reservation_id = ?`,
      [reservationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "ไม่พบข้อมูลการจอง" });
    }

    res.json({ message: "ยกเลิกการจองสำเร็จ" });
  } catch (err) {
    console.error("❌ [CANCEL ERROR]:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 ดึงรายการจองของผู้ใช้โดยใช้ code_user
router.get("/my/:code_user", async (req, res) => {
  const { code_user } = req.params;

  try {
    // หา user
    const [userRows] = await pool.query(
      "SELECT user_id, email FROM users WHERE code_user = ?",
      [code_user]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้นี้" });
    }

    const userId = userRows[0].user_id;
    const userEmail = userRows[0].email;

    // ⭐ อัปเดต booking ที่หมดเวลาเป็น Confirmed
    await pool.query(
      `
      UPDATE reservations
      SET status = 'Confirmed'
      WHERE end_time <= NOW()
        AND status = 'Pending'
      `
    );

    // ⭐ ไม่แสดง Cancelled ให้หน้า Front-end
    const [resIds] = await pool.query(
      `
      SELECT DISTINCT r.reservation_id
      FROM reservations r
      LEFT JOIN reservation_members rm
        ON r.reservation_id = rm.reservation_id
      WHERE (r.user_id = ? OR rm.email = ?)
        AND r.status != 'Cancelled'
      `,
      [userId, userEmail]
    );

    if (resIds.length === 0) return res.json([]);

    const idList = resIds.map((r) => r.reservation_id);

    // ดึงข้อมูลจริง
    const [rows] = await pool.query(
      `
      SELECT
        r.reservation_id,
        rooms.room_name,
        rooms.location,
        r.start_time,
        r.end_time,
        r.status,
        COUNT(rm.member_id) AS member_count
      FROM reservations r
      JOIN rooms ON r.room_id = rooms.room_id
      LEFT JOIN reservation_members rm
        ON r.reservation_id = rm.reservation_id
      WHERE r.reservation_id IN (?)
      GROUP BY 
        r.reservation_id, rooms.room_name, rooms.location, 
        r.start_time, r.end_time, r.status
      ORDER BY r.start_time ASC
      `,
      [idList]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ [GET MY ERROR]:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
