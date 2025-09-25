module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected");

    // เมื่อมีการจองใหม่
    socket.on("newReservation", (data) => {
      io.emit("reservationUpdate", data); // broadcast ไปทุก client
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};
// const express = require("express");
