import { MainLayout } from '../components/Layout/MainLayout';
import { BookingList } from '../components/Booking/BookingList';

export const BookingHistoryPage = ({ onNavigate }) => {
  return (
    <MainLayout currentPage="booking-list" onNavigate={onNavigate}>
      <BookingList />
    </MainLayout>
  );
};