const express = require("express");
const pool = require("../config/db");
const router = express.Router();

// Utility functions
const RoomStatus = {
  PENDING: "Pending",
  CANCELLED: "Cancelled",
  CONFIRMED: "Confirmed",
};

// check room availability
async function isRoomAvailable(roomId, startTime, endTime) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM reservations
     WHERE room_id = ?
       AND (start_time < ? AND end_time > ?)
       AND status != ?`,
    [roomId, endTime, startTime, RoomStatus.CANCELLED]
  );
  return rows.length === 0;
}

// check user by code_user
async function findUserByCode(code_user) {
  const [rows] = await pool.query(
    `SELECT user_id, code_user, name, email
     FROM users
     WHERE code_user = ?`,
    [code_user]
  );
  return rows[0] || null;
}

// fetch users from multiple code_user
async function findUsersByCodes(codeUsers) {
  if (!Array.isArray(codeUsers) || codeUsers.length === 0) return [];
  const [rows] = await pool.query(
    `SELECT code_user, name, email
     FROM users
     WHERE code_user IN (?)`,
    [codeUsers]
  );
  return rows;
}

// check booking time validity + no past booking
function validateBookingTime(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (start < today) return false;

  const durationHours = (end - start) / 3600000;

  if (
    start.getHours() < 9 ||
    end.getHours() > 17 ||
    end <= start ||
    durationHours > 2
  ) {
    return false;
  }
  return true;
}

// Routes
// 🔎 check if code_user exists in system
router.get("/my/check/:check_userId", async (req, res) => {
  try {
    const user = await findUserByCode(req.params.check_userId);

    if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้นี้ในระบบ" });

    res.json({ message: "User พบในระบบ", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🟢 Book a room → Initial status Pending
router.post("/room", async (req, res) => {
  const { userId, roomId, startTime, endTime, codeUsers } = req.body;

  try {
    if (!Array.isArray(codeUsers) || codeUsers.length < 3) {
      return res.status(400).json({ error: "ต้องมีสมาชิกอย่างน้อย 3 คน" });
    }

    if (!validateBookingTime(startTime, endTime)) {
      return res
        .status(400)
        .json({ error: "เวลาจองไม่ถูกต้องหรือเป็นวันย้อนหลัง" });
    }

    if (!(await isRoomAvailable(roomId, startTime, endTime))) {
      return res.status(400).json({ error: "ห้องไม่ว่างในช่วงเวลานี้" });
    }

    const validUsers = await findUsersByCodes(codeUsers);

    if (validUsers.length !== codeUsers.length) {
      const missing = codeUsers.filter(
        (c) => !validUsers.some((u) => u.code_user === c)
      );
      return res
        .status(400)
        .json({ error: `ไม่พบรหัสผู้ใช้ต่อไปนี้: ${missing.join(", ")}` });
    }

    const [result] = await pool.query(
      `INSERT INTO reservations (user_id, room_id, start_time, end_time, status, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId, roomId, startTime, endTime, RoomStatus.PENDING]
    );

    const reservationId = result.insertId;

    const memberPromises = validUsers.map((u) =>
      pool.query(
        `INSERT INTO reservation_members (reservation_id, name, email) VALUES (?, ?, ?)`,
        [reservationId, u.name, u.email]
      )
    );
    await Promise.all(memberPromises);

    res.json({ message: "จองสำเร็จ", reservationId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ❌ Cancel a reservation → status = Cancelled
router.put("/cancel/:reservationId", async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE reservations SET status = ? WHERE reservation_id = ?`,
      [RoomStatus.CANCELLED, req.params.reservationId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "ไม่พบข้อมูลการจอง" });

    res.json({ message: "ยกเลิกการจองสำเร็จ" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 fetch user's reservations by code_user
router.get("/my/:code_user", async (req, res) => {
  try {
    const user = await findUserByCode(req.params.code_user);

    if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้นี้" });

    // อัปเดต booking ที่หมดเวลาเป็น Confirmed
    await pool.query(
      `UPDATE reservations
       SET status = ?
       WHERE end_time <= NOW() AND status = ?`,
      [RoomStatus.CONFIRMED, RoomStatus.PENDING]
    );

    const [resIds] = await pool.query(
      `SELECT DISTINCT r.reservation_id
       FROM reservations r
       LEFT JOIN reservation_members rm ON r.reservation_id = rm.reservation_id
       WHERE (r.user_id = ? OR rm.email = ?) AND r.status != ?`,
      [user.user_id, user.email, RoomStatus.CANCELLED]
    );

    if (resIds.length === 0) return res.json([]);

    const idList = resIds.map((r) => r.reservation_id);

    const [rows] = await pool.query(
      `SELECT r.reservation_id, rooms.room_name, rooms.location,
              r.start_time, r.end_time, r.status,
              COUNT(rm.member_id) AS member_count
       FROM reservations r
       JOIN rooms ON r.room_id = rooms.room_id
       LEFT JOIN reservation_members rm ON r.reservation_id = rm.reservation_id
       WHERE r.reservation_id IN (?)
       GROUP BY r.reservation_id, rooms.room_name, rooms.location,
                r.start_time, r.end_time, r.status
       ORDER BY r.start_time ASC`,
      [idList]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
