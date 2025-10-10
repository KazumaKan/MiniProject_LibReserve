const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const reservationRoutes = require("./routes/reservations");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

require("./sockets/reservationSocket")(io);

app.use(cors());
app.use(express.json());

app.get("/ping", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/reservations", reservationRoutes);

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
