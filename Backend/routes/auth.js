const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const router = express.Router();

const SECRET = "mysecretkey"; // ควรเก็บเป็น ENV

// Apply for membership
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())",
    [name, email, hash]
  );
  res.json({ message: "User registered" });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  if (rows.length === 0)
    return res.status(401).json({ error: "User not found" });

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid password" });

  const token = jwt.sign({ userId: user.user_id }, SECRET, { expiresIn: "2h" });
  res.json({ token });
});

module.exports = router;
