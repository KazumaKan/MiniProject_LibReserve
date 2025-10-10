import { useState } from 'react';
import { AuthProvider, useAuth } from "./context/AuthContext";

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BookingHistoryPage } from './pages/BookingHistoryPage';

// Component ภายในที่เข้าถึง Auth Context ได้
const AppContent = ({ currentPage, onNavigate }) => {
  const { user } = useAuth();
  console.log("👤 Current user in AppContent:", user);

  // ถ้ายังไม่ได้ล็อกอิน
  if (!user) {
    return <LoginPage />;
  }

  // ถ้าล็อกอินแล้ว
  switch (currentPage) {
    case "booking-list":
      return <BookingHistoryPage onNavigate={onNavigate} />;
    case "book-room":
    default:
      return <DashboardPage onNavigate={onNavigate} />;
  }
};

export default function App() {
  const [currentPage, setCurrentPage] = useState("book-room");

  return (
    <AuthProvider>
      <AppContent
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
      />
    </AuthProvider>
  );
}