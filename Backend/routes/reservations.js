// routes/reservations.js

const express = require("express");
const pool = require("../config/db"); // ดึงการเชื่อมต่อฐานข้อมูล
const router = express.Router();

/**
 * ฟังก์ชันตรวจสอบว่าห้องว่างในช่วงเวลาที่ต้องการหรือไม่
 * โดยดูว่ามีการจองอื่นที่เวลาซ้อนกับที่ผู้ใช้จองหรือไม่
 */
async function isRoomAvailable(roomId, startTime, endTime) {
  const [rows] = await pool.query(
    "SELECT * FROM reservations WHERE room_id=? AND (start_time < ? AND end_time > ?)",
    [roomId, endTime, startTime]
  );
  return rows.length === 0; // ถ้าไม่มีรายการซ้อน แสดงว่าห้องว่าง
}

/**
 * POST /room
 * เส้นทางสำหรับจองห้องประชุม
 * ตรวจสอบจำนวนสมาชิก, ช่วงเวลา, ความซ้อนของเวลา แล้วบันทึกข้อมูลการจอง
 */
router.post("/room", async (req, res) => {
  console.log("📩 [ROOM] Request Body:", req.body);
  const { userId, roomId, startTime, endTime, emails } = req.body;

  try {
    // ตรวจสอบว่ามีสมาชิกอย่างน้อย 3 คน
    if (!emails || !Array.isArray(emails) || emails.length < 3) {
      console.warn("⚠️ [ROOM] สมาชิกน้อยกว่า 3 คน");
      return res.status(400).json({ error: "ต้องมีสมาชิกอย่างน้อย 3 คน" });
    }

    // ตรวจสอบช่วงเวลา: ต้องอยู่ในช่วง 09:00 - 17:00 และไม่เกิน 2 ชั่วโมง
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const startHour = startDate.getHours();
    const endHour = endDate.getHours();
    if (
      startHour < 9 ||
      endHour > 17 ||
      endDate <= startDate ||
      (endDate - startDate) / (1000 * 60 * 60) > 2
    ) {
      console.warn("⚠️ [ROOM] เวลาจองไม่ถูกต้อง");
      return res.status(400).json({ error: "เวลาจองไม่ถูกต้อง" });
    }

    // ตรวจสอบว่าห้องว่างหรือไม่
    const available = await isRoomAvailable(roomId, startTime, endTime);
    if (!available) {
      console.warn("⚠️ [ROOM] ห้องไม่ว่างในช่วงเวลานี้");
      return res.status(400).json({ error: "ห้องไม่ว่างในช่วงเวลานี้" });
    }

    // ตรวจสอบว่าที่อยู่อีเมลของสมาชิกทั้งหมดมีในระบบ
    const [validUsers] = await pool.query(
      "SELECT email, name FROM users WHERE email IN (?)",
      [emails]
    );

    if (validUsers.length !== emails.length) {
      // หาว่าใครไม่เจอ
      const foundEmails = validUsers.map((u) => u.email);
      const missingEmails = emails.filter((e) => !foundEmails.includes(e));

      console.warn("⚠️ [ROOM] พบ email ที่ไม่มีในระบบ:", missingEmails);
      return res.status(400).json({
        error: `ไม่พบอีเมลต่อไปนี้ในระบบ: ${missingEmails.join(", ")}`,
      });
    }

    // บันทึกข้อมูลการจองห้อง
    const [result] = await pool.query(
      "INSERT INTO reservations (user_id, room_id, start_time, end_time, status, created_at) VALUES (?, ?, ?, ?, 'BOOKED', NOW())",
      [userId, roomId, startTime, endTime]
    );

    const reservationId = result.insertId; // ID ของการจองที่เพิ่งสร้าง
    console.log(`✅ [ROOM] Reservation created ID: ${reservationId}`);

    // บันทึกสมาชิกของการจอง (ดึงชื่อจาก users)
    for (let email of emails) {
      const [users] = await pool.query(
        "SELECT name FROM users WHERE email = ?",
        [email]
      );
      let name = users.length > 0 ? users[0].name : "Unknown";

      await pool.query(
        "INSERT INTO reservation_members (reservation_id, name, email) VALUES (?, ?, ?)",
        [reservationId, name, email]
      );
    }

    res.json({ message: "จองสำเร็จ", reservationId });
  } catch (err) {
    console.error("❌ [ROOM] Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /my/:userId
 * ดึงรายการจองทั้งหมดของผู้ใช้
 * รวมทั้งรายการที่เป็นเจ้าของการจอง และที่ถูกเพิ่มเป็นสมาชิก
 */
router.get("/my/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log(`📩 [GET MY] userId=${userId}`);

  try {
    const [rows] = await pool.query(
      `
      SELECT r.reservation_id, r.room_id, r.start_time, r.end_time, rm.name as member_name
      FROM reservations r
      JOIN reservation_members rm ON r.reservation_id = rm.reservation_id
      WHERE r.user_id = ? OR rm.email IN (SELECT email FROM users WHERE user_id = ?)
    `,
      [userId, userId]
    );

    console.log(`✅ [GET MY] Found ${rows.length} reservations`);
    res.json(rows);
  } catch (err) {
    console.error("❌ [GET MY] Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
