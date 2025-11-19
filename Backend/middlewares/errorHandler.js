module.exports = (err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(500).json({
    error: "Server error",
    detail: err.message,
  });
};
