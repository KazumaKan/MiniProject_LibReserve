export const BookingList = () => {
  const bookings = []; // Mock data - ในระบบจริงต้อง fetch จาก API

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">รายการจองล่วงหน้า</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600">User นาย พิชญางกูร เศยแก้ว</p>
          <p className="text-sm text-gray-600">ข้อมูลการจอง</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-2xl mb-2">-</p>
            <p className="text-sm">ไม่มีรายการจอง</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <div key={index} className="border rounded p-4">
                <p>วัน: {booking.day}</p>
                <p>ห้อง: {booking.room}</p>
                <p>จำนวน: {booking.people} คน</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};