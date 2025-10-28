const express = require("express");
const pool = require("../config/db");
const router = express.Router();

// ตรวจสอบว่าห้องว่างไหม
async function isRoomAvailable(roomId, startTime, endTime) {
  const [rows] = await pool.query(
    "SELECT * FROM reservations WHERE room_id=? AND (start_time < ? AND end_time > ?)",
    [roomId, endTime, startTime]
  );
  return rows.length === 0;
}

// ✅ จองห้อง
router.post("/room", async (req, res) => {
  console.log("📩 [ROOM] Request Body:", req.body);

  const { userId, roomId, startTime, endTime, codeUsers } = req.body;

  try {
    // สมาชิกอย่างน้อย 3 คน
    if (!codeUsers || !Array.isArray(codeUsers) || codeUsers.length < 3) {
      return res.status(400).json({ error: "ต้องมีสมาชิกอย่างน้อย 3 คน" });
    }

    // ตรวจสอบช่วงเวลา
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end - start) / 3600000;

    if (
      start.getHours() < 9 ||
      end.getHours() > 17 ||
      end <= start ||
      hours > 2
    ) {
      return res.status(400).json({ error: "เวลาจองไม่ถูกต้อง" });
    }

    // ตรวจสอบห้องว่าง
    const available = await isRoomAvailable(roomId, startTime, endTime);
    if (!available) {
      return res.status(400).json({ error: "ห้องไม่ว่างในช่วงเวลานี้" });
    }

    // ตรวจสอบ code_user ทั้งหมด
    const [validUsers] = await pool.query(
      "SELECT code_user, name FROM users WHERE code_user IN (?)",
      [codeUsers]
    );
    if (validUsers.length !== codeUsers.length) {
      const found = validUsers.map((u) => u.code_user);
      const missing = codeUsers.filter((c) => !found.includes(c));
      return res.status(400).json({
        error: `ไม่พบรหัสผู้ใช้ต่อไปนี้ในระบบ: ${missing.join(", ")}`,
      });
    }

    // บันทึกการจอง
    const [result] = await pool.query(
      "INSERT INTO reservations (user_id, room_id, start_time, end_time, status, created_at) VALUES (?, ?, ?, ?, 'Confirmed', NOW())",
      [userId, roomId, startTime, endTime]
    );
    const reservationId = result.insertId;

    // บันทึกสมาชิก
    for (const code of codeUsers) {
      const [users] = await pool.query(
        "SELECT name, email FROM users WHERE code_user = ?",
        [code]
      );
      if (users.length === 0) continue;
      const { name, email } = users[0];
      await pool.query(
        "INSERT INTO reservation_members (reservation_id, name, email) VALUES (?, ?, ?)",
        [reservationId, name, email]
      );
    }

    res.json({ message: "จองสำเร็จ", reservationId });
  } catch (err) {
    console.error("❌ [ROOM ERROR]:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ ดึงรายการจองของผู้ใช้
router.get("/my/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT r.reservation_id, r.room_id, r.start_time, r.end_time, rm.name AS member_name
      FROM reservations r
      JOIN reservation_members rm ON r.reservation_id = rm.reservation_id
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
