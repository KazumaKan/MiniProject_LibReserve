import { useAuth } from '../../hook/useAuth';
import { reservationAPI } from '../../services/api';
import { useState, useEffect } from 'react';

export const BookingList = () => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ⚠️ ดึงรายการจองเมื่อ component mount หรือ user เปลี่ยน
  useEffect(() => {
    if (user?.id && token) {
      console.log('📋 Fetching bookings for user:', user.id);
      fetchBookings();
    }
  }, [user?.id, token]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');

    try {
      // ⚠️ ส่ง user.id และ token ไป API
      const data = await reservationAPI.getMyReservations(user.id, token);
      
      console.log('📦 Raw API response:', data);

      // ⚠️ แปลง API response ให้เข้ากับ UI format
      const formattedBookings = data.map(booking => {
        const startDate = new Date(booking.start_time);
        const endDate = new Date(booking.end_time);
        
        return {
          id: booking.reservation_id,
          roomName: booking.room_name || `Room ${booking.room_id}`,
          building: booking.building || 'อาคาร 11',
          floor: booking.floor || 'ชั้น 1',
          section: booking.section || 'โซน A',
          date: startDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          time: `${startDate.toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}-${endDate.toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}`,
          members: booking.member_count || 1,
          status: 'active'
        };
      });

      console.log('✅ Formatted bookings:', formattedBookings);
      setBookings(formattedBookings);
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch bookings';
      console.error('❌ Error fetching bookings:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?')) {
      try {
        console.log('🗑️ Cancelling booking:', bookingId);
        // ⚠️ ส่ง bookingId และ token ไป API
        await reservationAPI.cancelReservation(bookingId, token);
        
        console.log('✅ Booking cancelled');
        alert('ยกเลิกการจองเรียบร้อยแล้ว');
        
        // ⚠️ อัปเดต UI
        setBookings(bookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' }
            : booking
        ));
      } catch (err) {
        const errorMsg = err.message || 'Failed to cancel booking';
        console.error('❌ Error cancelling booking:', errorMsg);
        alert('เกิดข้อผิดพลาด: ' + errorMsg);
      }
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
      <h2 className="text-3xl font-bold mb-6">รายการจองส่วงหน้า V</h2>
      
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* User Info Section */}
        <div className="mb-6">
          <p className="text-gray-700 mb-1">
            <span className="font-semibold">User</span> {user?.name || user?.email || 'ผู้ใช้'}
          </p>
          <p className="text-gray-700 mb-4">ข้อมูลการจอง</p>
        </div>

        {/* ⚠️ Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Bookings Table */}
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
                  <th className="text-left py-4 px-3 font-semibold text-gray-700 bg-gray-50">
                    ลำดับที่
                  </th>
                  <th className="text-left py-4 px-3 font-semibold text-gray-700 bg-gray-50">
                    ชื่อห้อง
                  </th>
                  <th className="text-left py-4 px-3 font-semibold text-gray-700 bg-gray-50">
                    สถานที่
                  </th>
                  <th className="text-left py-4 px-3 font-semibold text-gray-700 bg-gray-50">
                    วันที่จอง
                  </th>
                  <th className="text-center py-4 px-3 font-semibold text-gray-700 bg-gray-50">
                    จำนวนผู้ใช้
                  </th>
                  <th className="text-center py-4 px-3 font-semibold text-gray-700 bg-gray-50">
                    {/* Action column */}
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr 
                    key={booking.id} 
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-5 px-3">{index + 1}</td>
                    <td className="py-5 px-3 font-medium">{booking.roomName}</td>
                    <td className="py-5 px-3">
                      {booking.building} {booking.floor} {booking.section}
                    </td>
                    <td className="py-5 px-3">
                      <div>{booking.date}</div>
                      <div className="text-sm text-gray-600">{booking.time}</div>
                    </td>
                    <td className="py-5 px-3 text-center font-medium">
                      {booking.members}
                    </td>
                    <td className="py-5 px-3 text-center">
                      {booking.status === 'active' ? (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-4 py-2 rounded transition-colors duration-200"
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

        {/* Summary */}
        {bookings.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>ทั้งหมด {bookings.length} รายการ</span>
              <span>
                ใช้งานอยู่ {bookings.filter(b => b.status === 'active').length} | 
                ยกเลิกแล้ว {bookings.filter(b => b.status === 'cancelled').length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};