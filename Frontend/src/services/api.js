const API_BASE_URL = "http://10.99.104.23:3000"; 
console.log("🌐 API Base URL:", API_BASE_URL);

// ============ AUTH API ============
export const authAPI = {
  login: async (email, password) => {
    console.log("🔐 Login attempt:", { email });
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("📩 Login response status:", response.status);
      const data = await response.json();
      console.log("🧾 Raw login response data:", data);

      if (!response.ok) throw new Error(data.message || "Login failed");

      // แก้ให้ดึง code_user ด้วย
      const user = {
        id: data.userId ?? data.id,
        code_user: data.code_user,
        name: data.name || "",
        email: data.email || "",
        faculty: data.faculty || "",
        major: data.major || "",
      };

      if (!user.id) throw new Error("Invalid response from server (missing userId)");
      console.log("✅ Login success:", user);

      return { user, token: data.token };
    } catch (error) {
      console.error("❌ Login error:", error.message);
      throw new Error("Login error: " + error.message);
    }
  },
};


// ============ RESERVATIONS API ============
export const reservationAPI = {
  // ดึงรายการห้องทั้งหมด
  async getRooms() {
    console.log("🏢 Fetching rooms...");
    const res = await fetch(`${API_BASE_URL}/rooms`);
    if (!res.ok) throw new Error("Failed to fetch rooms");
    const data = await res.json();
    console.log(`✅ Rooms fetched: ${data.length} rooms`);
    return data;
  },

  // Booking room
    async bookRoom(bookingData, token) {
      console.log("📤 Booking room with data:", bookingData);
      try {
        const res = await fetch(`${API_BASE_URL}/reservations/room`, {  // <-- เปลี่ยน /reservations เป็น /my/room
          method: "POST",
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(bookingData),
        });

        console.log("📩 Booking response status:", res.status);

        if (!res.ok) {
          const text = await res.text();
          console.error("❌ Booking failed response:", text);
          throw new Error("Booking failed: " + res.status);
        }

        const data = await res.json();
        console.log("✅ Booking response:", data);
        return data;
      } catch (error) {
        console.error("❌ Booking error:", error.message);
        throw error;
      }
      },


  // ดึงรายการจองของผู้ใช้
    async getMyReservations(codeUser, token) {
      console.log("📋 Fetching reservations for user code_user:", codeUser);
      try {
        const res = await fetch(`${API_BASE_URL}/reservations/my/${codeUser}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("📩 My reservations response status:", res.status);

        if (!res.ok) {
          const text = await res.text();
          console.error("❌ Failed to fetch my reservations:", text);
          throw new Error("Cannot fetch reservations: " + res.status);
        }

        const data = await res.json();
        console.log("✅ My reservations data:", data);
        return data;
      } catch (error) {
        console.error("❌ Error fetching my reservations:", error.message);
        throw error;
      }
    },

  // ยกเลิกการจอง
  cancelReservation: async (reservationId, token) => {
    console.log("📡 [API] PUT /reservations/cancel/" + reservationId);

    const res = await fetch(
      `${API_BASE_URL}/reservations/cancel/${reservationId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    console.log("📩 Cancel response status:", res.status);

    const data = await res.json();
    console.log("📦 Cancel raw response:", data);

    if (!res.ok) {
      throw new Error(data.error || "Cancel failed");
    }

    return data;
  },


};

// ============ ROOMS API ============
export const roomAPI = {
  getAllRooms: async () => {
    console.log("🏢 Fetching all rooms...");
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`);
      console.log("📩 Rooms response status:", response.status);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch rooms");
      }
      const data = await response.json();
      console.log(`✅ Rooms fetched: ${data.length} rooms`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error fetching rooms:", error.message);
      throw new Error("Fetch rooms error: " + error.message);
    }
  },
};

// ============ API UTILS ============
export const apiUtils = {
  checkConnection: async () => {
    console.log("🔍 Checking API connection...");
    try {
      const response = await fetch(`${API_BASE_URL}/ping`);
      console.log("📶 API Health Check Status:", response.status);
      if (!response.ok) throw new Error("API not responding");
      const data = await response.json();
      console.log("✅ API is reachable:", data);
      return true;
    } catch (error) {
      console.error("❌ Cannot connect to API:", error.message);
      return false;
    }
  },

checkMemberExists: async (memberId) => {
  console.log("🔍 Checking member:", memberId);
  try {
    const res = await fetch(`${API_BASE_URL}/reservations/my/check/${memberId}`);
    console.log("📩 Member check status:", res.status);

    if (!res.ok) {
      const text = await res.text();  // อ่าน text แทน json
      console.error("❌ Member not found or error:", text);
      throw new Error(`สมาชิกไม่พบ หรือเกิดข้อผิดพลาด: ${res.status}`);
    }

    const data = await res.json();
    console.log("✅ Member found:", data);
    return data.user;  // คืน user object ตาม backend
  } catch (error) {
    console.error("❌ Member check error:", error.message);
    throw new Error(error.message || "Cannot check member");
  }
}
};
