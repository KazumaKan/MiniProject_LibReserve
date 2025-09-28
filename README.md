# 📚 MiniProject_LibReserve

**MiniProject_LibReserve** is a web-based mini project that simulates a room reservation system for a university library. This project is inspired by and references the library services at **Sripatum University**.

Users can log in using their student ID, select a library room and floor, choose a time slot (between 1–2 hours from 09:00 to 17:00), and pick a date for reservation. The system enforces that each room reservation must include **at least 3 members**, and only those included in the reservation can view its history.

---

## 🧩 Features

- 🔐 **Student Login System**
  - Students log in using their student ID before accessing reservation functionalities.

- 🏢 **Room & Floor Selection**
  - Users can choose the specific room and floor they wish to reserve.

- ⏰ **Time Slot Management**
  - Time slots are between **1–2 hours**.
  - Available reservation time: **09:00 - 17:00**.

- 📆 **Date Selection**
  - Users can pick a date in advance for the reservation.

- 👥 **Group Reservation Requirement**
  - Each room must be reserved by **at least 3 students**.
  - All group members will have access to the reservation history.

- 🔒 **Privacy & Access Control**
  - Only users who are part of a reservation can view its history.
  - External users (not in the reservation group) **cannot view or reserve the same room/time slot**.

---

## 🧪 Example Use Case

- Student **A**, **B**, and **C** reserve **Room 1** together.
- All 3 can view the reservation history from their accounts.
- Another student, **D**, who is not part of the reservation, **cannot view** the booking or **reserve the same slot**.

---

## 🎯 Project Objectives

- Practice building a web application using **React** for the front-end.
- Develop back-end logic and database integration to store data and control system behavior.
- Simulate a university library room reservation system.
- Gain experience using **Virtual Machines** and **Nginx Web Server** to deploy the system for internet access.

---

## 📌 Notes

- This project is developed for educational purposes as part of the **Cloud Architecture (CPE417)** course.

---
