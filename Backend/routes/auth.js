const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { jwtSecret } = require("../config/env");

const router = express.Router();

// ✅ LOGIN
router.post("/login", async (req, res) => {
  console.log("📩 [LOGIN] Received:", req.body);

  const { email, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];

    if (!user) {
      console.warn(`⚠️ [LOGIN] User not found: ${email}`);
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== password) {
      console.warn(`⚠️ [LOGIN] Invalid password for user: ${email}`);
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user.user_id }, jwtSecret, {
      expiresIn: "2h",
    });
    console.log(`✅ [LOGIN] Token generated for user: ${email}`);

    res.json({
      token,
      code_user: user.code_user,
      userId: user.user_id,
      name: user.name,
      email: user.email,
      faculty: user.faculty,
      major: user.major,
    });
  } catch (err) {
    console.error("❌ [LOGIN ERROR]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PROFILE
router.get("/profile/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`📩 [PROFILE] Fetching profile for user id: ${id}`);

  try {
    const [rows] = await pool.query(
      "SELECT user_id AS id, name, email FROM users WHERE user_id = ?",
      [id]
    );

    if (rows.length === 0) {
      console.warn(`⚠️ [PROFILE] User not found with id: ${id}`);
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ [PROFILE ERROR]", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
