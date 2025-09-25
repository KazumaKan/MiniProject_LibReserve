const express = require("express");
const pool = require("../config/db");
const router = express.Router();

// Function to check room availability
async function isRoomAvailable(roomId, startTime, endTime) {
  const [rows] = await pool.query(
    "SELECT * FROM reservations WHERE room_id=? AND (start_time < ? AND end_time > ?)",
    [roomId, endTime, startTime]
  );
  return rows.length === 0;
}

// Room booking
router.post("/room", async (req, res) => {
  const { userId, roomId, startTime, endTime, members } = req.body;

  // Check members >= 3
  if (members.length < 2) {
    return res.status(400).json({ error: "ต้องมีอย่างน้อย 3 คน" });
  }

  // Check time (9:00 - 17:00)
  const startHour = new Date(startTime).getHours();
  const endHour = new Date(endTime).getHours();
  if (startHour < 9 || endHour > 17 || endHour - startHour > 2) {
    return res.status(400).json({ error: "เวลาจองไม่ถูกต้อง" });
  }

  // Check room availability
  const available = await isRoomAvailable(roomId, startTime, endTime);
  if (!available) {
    return res.status(400).json({ error: "ห้องไม่ว่างในช่วงเวลานี้" });
  }

  // Insert reservation
  const [result] = await pool.query(
    "INSERT INTO reservations (user_id, room_id, start_time, end_time, status, created_at) VALUES (?, ?, ?, ?, 'BOOKED', NOW())",
    [userId, roomId, startTime, endTime]
  );

  const reservationId = result.insertId;

  // Insert members
  for (let m of members) {
    await pool.query(
      "INSERT INTO reservation_members (reservation_id, name, email) VALUES (?, ?, ?)",
      [reservationId, m.name, m.email]
    );
  }

  res.json({ message: "จองสำเร็จ", reservationId });
});

// Get my reservations
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

  res.json(rows);
});

module.exports = router;
