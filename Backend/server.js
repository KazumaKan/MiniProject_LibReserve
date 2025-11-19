const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { port } = require("./config/env");

// Routes
const authRoutes = require("./routes/auth");
const reservationRoutes = require("./routes/reservations");
const roomRoutes = require("./routes/rooms");

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: { origin: "*" },
});
require("./sockets/reservationSocket")(io);

// Middleware
app.use(cors());
app.use(express.json());

// Force JSON response headers
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

// Test route
app.get("/ping", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/reservations", reservationRoutes);
app.use("/rooms", roomRoutes);

// JSON 404 (instead of HTML)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// JSON Error handler (instead of HTML)
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(500).json({ error: "Server error", detail: err.message });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${port}`);
});
