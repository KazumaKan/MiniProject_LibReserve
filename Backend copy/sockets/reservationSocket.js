module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 User connected");

    socket.on("newReservation", (data) => {
      io.emit("reservationUpdate", data);
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected");
    });
  });
};
