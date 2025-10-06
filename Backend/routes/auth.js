// routes/auth.js

const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../config/db"); // Import database connection
const router = express.Router();

// Secret key for signing JWT tokens (should be stored in .env for security)
const SECRET = process.env.JWT_SECRET || "mysecretkey";

/**
 * POST /login
 * เส้นทางนี้ใช้สำหรับเข้าสู่ระบบด้วย email และ password
 * หากเข้าสู่ระบบสำเร็จ จะส่ง token และข้อมูลผู้ใช้กลับไป
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query user by email
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];

    // If user not found, return 404
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare plain-text password (note: use bcrypt in production)
    if (user.password !== password)
      return res.status(401).json({ message: "Invalid password" });

    // Generate JWT token valid for 2 hours
    const token = jwt.sign({ userId: user.user_id }, SECRET, {
      expiresIn: "2h",
    });

    // Return token and user info
    res.json({
      token,
      userId: user.user_id,
      name: user.name,
      email: user.email,
      faculty: user.faculty,
      major: user.major,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /profile/:id
 * เส้นทางนี้ใช้ดึงข้อมูลโปรไฟล์ของผู้ใช้ตาม user_id
 * จะส่ง id, name, email กลับไป
 */
router.get("/profile/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Query user by ID and alias user_id to id
    const [rows] = await pool.query(
      "SELECT user_id AS id, name, email FROM users WHERE user_id = ?",
      [id]
    );

    // If user not found, return 404
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user profile
    res.json(rows[0]);
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
