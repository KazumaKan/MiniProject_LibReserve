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
  console.log("📩 [ROOM] Request Body:", req.body); // เปลี่ยนชื่อตัวแปร emails เป็น codeUsers
  const { userId, roomId, startTime, endTime, codeUsers } = req.body; // <--- แก้ตรงนี้

  try {
    // 1. ตรวจสอบว่ามีสมาชิกอย่างน้อย 3 คน
    if (!codeUsers || !Array.isArray(codeUsers) || codeUsers.length < 3) {
      // <--- ใช้ codeUsers
      console.warn("⚠️ [ROOM] สมาชิกน้อยกว่า 3 คน");
      return res.status(400).json({ error: "ต้องมีสมาชิกอย่างน้อย 3 คน" });
    } // 2. ตรวจสอบช่วงเวลา: (Logic เดิม)

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
    } // 3. ตรวจสอบว่าห้องว่างหรือไม่ (Logic เดิม)

    const available = await isRoomAvailable(roomId, startTime, endTime);
    if (!available) {
      console.warn("⚠️ [ROOM] ห้องไม่ว่างในช่วงเวลานี้");
      return res.status(400).json({ error: "ห้องไม่ว่างในช่วงเวลานี้" });
    } // 4. ตรวจสอบว่ารหัสสมาชิก (code_user) ทั้งหมดมีในระบบ

    const [validUsers] = await pool.query(
      // ใช้คอลัมน์ code_user แทน email
      "SELECT code_user, name FROM users WHERE code_user IN (?)", // <--- แก้ตรงนี้
      [codeUsers] // <--- ใช้ codeUsers
    );

    if (validUsers.length !== codeUsers.length) {
      // หาว่าใครไม่เจอ
      const foundCodes = validUsers.map((u) => u.code_user);
      const missingCodes = codeUsers.filter((c) => !foundCodes.includes(c));

      console.warn("⚠️ [ROOM] พบ code_user ที่ไม่มีในระบบ:", missingCodes);
      return res.status(400).json({
        error: `ไม่พบรหัสผู้ใช้ต่อไปนี้ในระบบ: ${missingCodes.join(", ")}`,
      });
    } // 5. บันทึกข้อมูลการจองห้อง (Logic เดิม)

    const [result] = await pool.query(
      "INSERT INTO reservations (user_id, room_id, start_time, end_time, status, created_at) VALUES (?, ?, ?, ?, 'BOOKED', NOW())",
      [userId, roomId, startTime, endTime]
    );

    const reservationId = result.insertId; // ID ของการจองที่เพิ่งสร้าง
    console.log(`✅ [ROOM] Reservation created ID: ${reservationId}`); // 6. บันทึกสมาชิกของการจอง (ดึงชื่อจาก users)

    for (let code of codeUsers) {
      // <--- ใช้ codeUsers
      const [users] = await pool.query(
        // ใช้คอลัมน์ code_user ในการค้นหา
        "SELECT name, email FROM users WHERE code_user = ?", // <--- แก้ตรงนี้ (ดึง email ด้วย เพราะ reservation_members ยังใช้)
        [code]
      ); // ตรวจสอบว่าพบผู้ใช้
      if (users.length === 0) continue;
      const { name, email } = users[0]; // reservation_members ยังใช้ email ในการบันทึก

      await pool.query(
        "INSERT INTO reservation_members (reservation_id, name, email) VALUES (?, ?, ?)",
        [reservationId, name, email] // <--- บันทึก email เดิม เพื่อให้เข้ากับโครงสร้างตารางเดิม
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
    // ต้องเปลี่ยนการค้นหาจาก rm.email ไปอ้างอิงกับ users.code_user
    // โดยใช้ subquery เพื่อหา email ของผู้ใช้จาก user_id
    const [rows] = await pool.query(
      `
      SELECT r.reservation_id, r.room_id, r.start_time, r.end_time, rm.name as member_name
      FROM reservations r
      JOIN reservation_members rm ON r.reservation_id = rm.reservation_id
      WHERE r.user_id = ? 
        OR rm.email = (SELECT email FROM users WHERE user_id = ?) 
    `,
      [userId, userId] // <--- แก้เงื่อนไข rm.email IN (...) เป็น rm.email = (...) เพราะต้องการหา email ของเจ้าของ user_id ที่ส่งมา
    );

    console.log(`✅ [GET MY] Found ${rows.length} reservations`);
    res.json(rows);
  } catch (err) {
    console.error("❌ [GET MY] Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
