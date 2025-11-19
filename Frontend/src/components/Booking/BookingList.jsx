import { useAuth } from '../../hook/useAuth.js';
import { reservationAPI } from '../../services/api';
import { useState, useEffect } from 'react';

export const BookingList = () => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* -------------------------
      LOAD BOOKINGS
  -------------------------- */
  useEffect(() => {
    if (user?.code_user && token) {
      console.log('📋 Fetching bookings for:', user.code_user);
      fetchBookings();
    }
  }, [user?.code_user, token]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('📡 Calling getMyReservations...');
      const data = await reservationAPI.getMyReservations(user.code_user, token);
      console.log('📦 Raw API response:', data);

      const formatted = data.map((item) => {
        const start = new Date(item.start_time);
        const end = new Date(item.end_time);

        return {
          id: item.reservation_id,
          roomName: item.room_name,
          location: `${item.location || ''}`,
          date: start.toLocaleDateString('th-TH'),
          time: `${start.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                 -
                 ${end.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`,
          members: item.member_count,
          status: item.status, // ← ใช้ตาม Database
        };
      });

      console.log('✅ Formatted bookings:', formatted);
      setBookings(formatted);
    } catch (err) {
      console.error('❌ Error fetching bookings:', err);
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------
      CANCEL BOOKING
  -------------------------- */
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('ต้องการยกเลิกการจองนี้ใช่หรือไม่?')) return;

    try {
      console.log('🗑️ Cancelling reservation:', bookingId);
      await reservationAPI.cancelReservation(bookingId, token);

      alert('ยกเลิกการจองสำเร็จ');

      // โหลดข้อมูลอีกครั้งจาก backend ให้ตรง 100%
      fetchBookings();
    } catch (err) {
      console.error('❌ Error cancelling booking:', err);
      alert('เกิดข้อผิดพลาด: ' + (err.message || 'Cancel error'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">รายการจองล่วงหน้า</h2>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-3xl mb-3">-</p>
            <p className="text-sm">ไม่มีรายการจอง</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
              <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-4 px-3 bg-gray-50">ลำดับที่</th>
                  <th className="text-left py-4 px-3 bg-gray-50">ชื่อห้อง</th>
                  <th className="text-left py-4 px-3 bg-gray-50">สถานที่</th>
                  <th className="text-left py-4 px-3 bg-gray-50">วันที่จอง</th>
                  <th className="text-center py-4 px-3 bg-gray-50">จำนวนผู้ใช้</th>
                  <th className="text-center py-4 px-3 bg-gray-50"></th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((b, index) => (
                <tr key={b.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-5 px-3">{index + 1}</td>
                    <td className="py-5 px-3 font-medium">{b.roomName}</td>
                    <td className="py-5 px-3">{b.location}</td>
                    <td className="py-5 px-3">
                      <div>{b.date}</div>
                      <div className="text-sm text-gray-600">{b.time}</div>
                    </td>
                    <td className="py-5 px-3 text-center font-medium">{b.members}</td>

                    <td className="py-5 px-3 text-center">
                      {b.status !== 'Cancelled' ? (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded"
                        >
                          ยกเลิกการจอง
                        </button>
                      ) : (
                        <span className="text-red-600 font-bold text-sm italic">
                          ปิดใช้งานแล้ว
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
};
