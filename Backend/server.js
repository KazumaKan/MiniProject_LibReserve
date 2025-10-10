const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Import route handlers
const authRoutes = require("./routes/auth");
const reservationRoutes = require("./routes/reservations");
const roomRoutes = require("./routes/rooms");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

require("./sockets/reservationSocket")(io);

// Middleware
app.use(cors());
app.use(express.json());
app.get("/ping", (req, res) => {
  res.json({ status: "ok" });
});

// Use imported routes
app.use("/auth", authRoutes);
app.use("/reservations", reservationRoutes);
app.use("/rooms", roomRoutes);

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
