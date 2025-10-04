import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hook/useAuth';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BookingHistoryPage } from './pages/BookingHistoryPage';

// Component ภายในที่เข้าถึง Auth Context ได้
const AppContent = ({ currentPage, onNavigate }) => {
  const { user } = useAuth();

  // ถ้ายังไม่ได้ล็อกอิน แสดงหน้า Login
  if (!user) {
    return <LoginPage />;
  }

  // ถ้าล็อกอินแล้ว แสดงหน้าตาม navigation
  switch (currentPage) {
    case 'booking-list':
      return <BookingHistoryPage onNavigate={onNavigate} />;
    case 'book-room':
    default:
      return <DashboardPage onNavigate={onNavigate} />;
  }
};

// Main App Component
export default function App() {
  const [currentPage, setCurrentPage] = useState('book-room');
  
  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <AuthProvider>
      <AppContent currentPage={currentPage} onNavigate={handleNavigate} />
    </AuthProvider>
  );
}