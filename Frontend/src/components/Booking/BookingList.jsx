import { useState } from 'react';
import { useAuth } from '../../hook/useAuth';

// Mock data - รายการจองตัวอย่าง 5 รายการ
const INITIAL_BOOKINGS = [
  {
    id: 1,
    roomName: 'Study Room 4',
    building: 'อาคาร 11',
    floor: 'ชั้น 4',
    section: 'โซน C',
    date: '30 September 2025',
    time: '12:00-13:00',
    members: 4,
    status: 'active'
  },
  {
    id: 2,
    roomName: 'Study Room 3',
    building: 'อาคาร 11',
    floor: 'ชั้น 4',
    section: 'โซน A',
    date: '05 October 2025',
    time: '12:00-13:00',
    members: 3,
    status: 'active'
  },
  {
    id: 3,
    roomName: 'Study Room 1',
    building: 'อาคาร 11',
    floor: 'ชั้น 5',
    section: 'โซน B',
    date: '11 October 2025',
    time: '12:00-13:00',
    members: 4,
    status: 'active'
  },
  {
    id: 4,
    roomName: 'Study Room 4',
    building: 'อาคาร 11',
    floor: 'ชั้น 4',
    section: 'โซน A',
    date: '22 October 2025',
    time: '12:00-13:00',
    members: 5,
    status: 'active'
  },
  {
    id: 5,
    roomName: 'Study Room 1',
    building: 'อาคาร 11',
    floor: 'ชั้น 4',
    section: 'โซน B',
    date: '23 October 2025',
    time: '12:00-13:00',
    members: 6,
    status: 'cancelled'
  }
];

export const BookingList = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?')) {
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' }
          : booking
      ));
      alert('ยกเลิกการจองเรียบร้อยแล้ว');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">รายการจองล่วงหน้า</h2>
      
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* User Info Section */}
        <div className="mb-6">
          <p className="text-gray-700 mb-1">
            <span className="font-semibold">User</span> นาย พิชญางกูร เศยแก้ว
          </p>
          <p className="text-gray-700 mb-4">ข้อมูลการจอง</p>
        </div>

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
                    {/* ลำดับที่ */}
                    <td className="py-5 px-3 text-gray-800">
                      {index + 1}
                    </td>

                    {/* ชื่อห้อง */}
                    <td className="py-5 px-3">
                      <span className="font-medium text-gray-800">
                        {booking.roomName}
                      </span>
                    </td>

                    {/* สถานที่ */}
                    <td className="py-5 px-3 text-gray-700">
                      {booking.building} {booking.floor} {booking.section}
                    </td>

                    {/* วันที่จอง */}
                    <td className="py-5 px-3 text-gray-700">
                      <div>{booking.date}</div>
                      <div className="text-sm text-gray-600">{booking.time}</div>
                    </td>

                    {/* จำนวนผู้ใช้ */}
                    <td className="py-5 px-3 text-center">
                      <span className="font-medium text-gray-800">
                        {booking.members}
                      </span>
                    </td>

                    {/* Action Button */}
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
              <span>
                ทั้งหมด {bookings.length} รายการ
              </span>
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