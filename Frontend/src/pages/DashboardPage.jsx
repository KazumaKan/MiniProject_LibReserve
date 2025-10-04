import { MainLayout } from '../components/Layout/MainLayout';
import { BookingForm } from '../components/Booking/BookingForm';

export const DashboardPage = ({ onNavigate }) => {
  return (
    <MainLayout currentPage="book-room" onNavigate={onNavigate}>
      <BookingForm />
    </MainLayout>
  );
};