const express = require("express");
const pool = require("../config/db");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM rooms");
    console.log(`📦 ดึงข้อมูลห้องทั้งหมดสำเร็จ: ${rows.length} รายการ`);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching rooms:", err);
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

module.exports = router;
