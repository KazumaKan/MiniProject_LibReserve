// รอ
const API_URL = 'http://localhost:8000/api';

export const authAPI = {
  login: async (username, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  }
};

export const bookingAPI = {
  create: async (bookingData) => {
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    return response.json();
  },
  
  getAll: async () => {
    const response = await fetch(`${API_URL}/bookings`);
    return response.json();
  }
};