// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { port } = require("./config/env");

// Routes
const authRoutes = require("./routes/auth");
const reservationRoutes = require("./routes/reservations");
const roomRoutes = require("./routes/rooms");

// Socket
const reservationSocket = require("./sockets/reservationSocket");

// Middlewares
const jsonResponseHeader = require("./middlewares/jsonResponseHeader");
const notFoundHandler = require("./middlewares/notFoundHandler");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: { origin: "*" },
});
reservationSocket(io);

// Debugging logs to verify imports
console.log("jsonResponseHeader:", jsonResponseHeader);
console.log("notFoundHandler:", notFoundHandler);
console.log("errorHandler:", errorHandler);

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(jsonResponseHeader);

// Health Check
app.get("/ping", (req, res) => res.json({ status: "ok" }));

// API Routes
app.use("/auth", authRoutes);
app.use("/reservations", reservationRoutes);
app.use("/rooms", roomRoutes);

// Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${port}`);
});
