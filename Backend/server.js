const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { port } = require("./config/env");

// Import route handlers
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
app.use(cors()); // ใช้ CORS default
app.use(express.json());

// Test route
app.get("/ping", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/reservations", reservationRoutes);
app.use("/rooms", roomRoutes);

// Start server
server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${port}`);
});
