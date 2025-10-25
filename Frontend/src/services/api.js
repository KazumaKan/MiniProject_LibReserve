const API_BASE_URL = "/api"; // <-- แก้ตรงนี้จากเดิม http://10.99.72.236:3000

console.log("🌐 API Base URL:", API_BASE_URL);

// ============ AUTH API ============
export const authAPI = {
  // Login ด้วย email และ password
  login: async (email, password) => {
    console.log("🔐 Login attempt:", { email });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("📩 Login response status:", response.status);

      const data = await response.json();
      console.log("🧾 Raw login response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ แปลง response ให้อยู่ในรูปแบบที่ frontend ใช้งานได้
      const user = {
        id: data.userId ?? data.id,
        name: data.name || "",
        email: data.email || "", // อาจเป็นรหัสนักศึกษา
        faculty: data.faculty || "",
        major: data.major || "",
      };

      // ✅ ยอมรับถ้ามี id ก็ถือว่า valid แล้ว
      if (!user.id) {
        throw new Error("Invalid response from server (missing userId)");
      }

      console.log("✅ Login success:", user);

      // ✅ return ในรูปแบบที่ AuthContext ใช้ต่อได้
      return { user, token: data.token };
    } catch (error) {
      console.error("❌ Login error:", error.message);
      throw new Error("Login error: " + error.message);
    }
  },
};

// ============ RESERVATIONS API ============
export const reservationAPI = {
  async getRooms() {
    const res = await fetch(`${API_BASE_URL}/rooms`);
    if (!res.ok) throw new Error("Failed to fetch rooms");
    return res.json();
  },

  async bookRoom(bookingData, token) {
    const res = await fetch(`${API_BASE_URL}/reservations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    });
    if (!res.ok) throw new Error("Booking failed");
    return res.json();
  },
};

// ============ API UTILS (HEALTH CHECK) ============
export const apiUtils = {
  checkConnection: async () => {
    console.log("🔍 Checking API connection...");

    try {
      const response = await fetch(`${API_BASE_URL}/ping`, {
        method: "GET",
      });

      console.log("📶 API Health Check Status:", response.status);

      if (!response.ok) {
        throw new Error("API is not responding correctly");
      }

      const data = await response.json();
      console.log("✅ API is reachable:", data);
      return true;
    } catch (error) {
      console.error("❌ Cannot connect to API:", error.message);
      return false;
    }
  },
};

// ============ ROOMS API ============
export const roomAPI = {
  getAllRooms: async () => {
    console.log("🏢 Fetching all rooms...");
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, { method: "GET" });
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
