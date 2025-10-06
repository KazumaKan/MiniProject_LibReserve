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
  const { userId, roomId, startTime, endTime, emails } = req.body;

  // ตรวจสอบว่ามีสมาชิกอย่างน้อย 3 คน
  if (!emails || emails.length < 3) {
    return res.status(400).json({ error: "ต้องมีสมาชิกอย่างน้อย 3 คน" });
  }

  // ตรวจสอบช่วงเวลา: ต้องอยู่ในช่วง 09:00 - 17:00 และไม่เกิน 2 ชั่วโมง
  const startHour = new Date(startTime).getHours();
  const endHour = new Date(endTime).getHours();
  if (startHour < 9 || endHour > 17 || endHour - startHour > 2) {
    return res.status(400).json({ error: "เวลาจองไม่ถูกต้อง" });
  }

  // ตรวจสอบว่าห้องว่างหรือไม่
  const available = await isRoomAvailable(roomId, startTime, endTime);
  if (!available) {
    return res.status(400).json({ error: "ห้องไม่ว่างในช่วงเวลานี้" });
  }

  // บันทึกข้อมูลการจองห้อง
  const [result] = await pool.query(
    "INSERT INTO reservations (user_id, room_id, start_time, end_time, status, created_at) VALUES (?, ?, ?, ?, 'BOOKED', NOW())",
    [userId, roomId, startTime, endTime]
  );

  const reservationId = result.insertId; // ID ของการจองที่เพิ่งสร้าง

  // บันทึกสมาชิกของการจอง (ดึงชื่อจาก users)
  for (let email of emails) {
    const [users] = await pool.query("SELECT name FROM users WHERE email = ?", [
      email,
    ]);
    let name = users.length > 0 ? users[0].name : "Unknown";

    await pool.query(
      "INSERT INTO reservation_members (reservation_id, name, email) VALUES (?, ?, ?)",
      [reservationId, name, email]
    );
  }

  res.json({ message: "จองสำเร็จ", reservationId });
});

/**
 * GET /my/:userId
 * ดึงรายการจองทั้งหมดของผู้ใช้
 * รวมทั้งรายการที่เป็นเจ้าของการจอง และที่ถูกเพิ่มเป็นสมาชิก
 */
router.get("/my/:userId", async (req, res) => {
  const { userId } = req.params;

  const [rows] = await pool.query(
    `
    SELECT r.reservation_id, r.room_id, r.start_time, r.end_time, rm.name as member_name
    FROM reservations r
    JOIN reservation_members rm ON r.reservation_id = rm.reservation_id
    WHERE r.user_id = ? OR rm.email IN (SELECT email FROM users WHERE user_id = ?)
  `,
    [userId, userId]
  );

  res.json(rows); // ส่งผลลัพธ์รายการจองกลับ
});

module.exports = router;
