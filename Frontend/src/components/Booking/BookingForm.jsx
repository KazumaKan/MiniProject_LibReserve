import { useState } from 'react';
import { useAuth } from '../../hook/useAuth';
import { Calendar as CalendarIcon, Clock, Users, Plus, X, Info } from 'lucide-react';

// ข้อมูลห้อง (Mock data)
const ROOMS_DATA = {
  floor1: [
    { 
      id: 'r101', 
      name: 'ห้อง 101', 
      capacity: 4, 
      facilities: ['โปรเจคเตอร์', 'กระดานไวท์บอร์ด', 'WiFi', 'ปลั๊กไฟ'] 
    },
    { 
      id: 'r102', 
      name: 'ห้อง 102', 
      capacity: 6, 
      facilities: ['โปรเจคเตอร์', 'กระดานไวท์บอร์ด', 'WiFi', 'ปลั๊กไฟ', 'เครื่องปรับอากาศ'] 
    },
    { 
      id: 'r103', 
      name: 'ห้อง 103', 
      capacity: 8, 
      facilities: ['โปรเจคเตอร์', 'TV', 'กระดานไวท์บอร์ด', 'WiFi', 'ปลั๊กไฟ', 'เครื่องปรับอากาศ'] 
    },
  ],
  floor2: [
    { 
      id: 'r201', 
      name: 'ห้อง 201', 
      capacity: 10, 
      facilities: ['โปรเจคเตอร์', 'ระบบเสียง', 'กระดานไวท์บอร์ด', 'WiFi', 'ปลั๊กไฟ', 'เครื่องปรับอากาศ'] 
    },
    { 
      id: 'r202', 
      name: 'ห้อง 202', 
      capacity: 12, 
      facilities: ['โปรเจคเตอร์', 'ระบบเสียง', 'TV', 'กระดานไวท์บอร์ด', 'WiFi', 'ปลั๊กไฟ', 'เครื่องปรับอากาศ'] 
    },
  ],
  floor3: [
    { 
      id: 'r301', 
      name: 'ห้อง 301', 
      capacity: 15, 
      facilities: ['โปรเจคเตอร์', 'ระบบเสียง', 'TV', 'กระดานไวท์บอร์ด', 'WiFi', 'ปลั๊กไฟ', 'เครื่องปรับอากาศ', 'โต๊ะประชุมขนาดใหญ่'] 
    },
  ]
};

// สร้าง time slots 9:00-17:00
const TIME_SLOTS = Array.from({ length: 9 }, (_, i) => {
  const hour = 9 + i;
  return {
    value: `${hour}:00`,
    label: `${hour}:00 น.`
  };
});

// Calendar Component
const CalendarPicker = ({ selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelectDate(selected);
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded"
        >
          ‹
        </button>
        <div className="font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear() + 543}
        </div>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded"
        >
          ›
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`
                p-2 text-center rounded hover:bg-blue-50 transition-colors
                ${isToday(day) ? 'bg-blue-100 font-semibold' : ''}
                ${isSelected(day) ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Member Input Component
const MemberInput = ({ members, onAddMember, onRemoveMember }) => {
  const [memberId, setMemberId] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    setError('');
    
    if (!memberId.trim()) {
      setError('กรุณากรอกรหัสสมาชิก');
      return;
    }

    // ตรวจสอบว่าเป็นตัวเลข 8 หัก
    if (!/^\d{8}$/.test(memberId)) {
      setError('รหัสสมาชิกต้องเป็นตัวเลข 8 หลักเท่านั้น');
      return;
    }

    if (members.some(m => m.id === memberId)) {
      setError('รหัสสมาชิกนี้ถูกเพิ่มแล้ว');
      return;
    }

    // Mock: สมมติว่าดึงข้อมูลจาก API
    onAddMember({
      id: memberId,
      name: `สมาชิก ${memberId}`,
      addedAt: new Date()
    });
    
    setMemberId('');
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        สมาชิกที่จอง <span className="text-red-500">(ขั้นต่ำ 3 คน)</span>
      </label>
      
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={memberId}
          onChange={(e) => {
            // อนุญาตให้กรอกเฉพาะตัวเลข และไม่เกิน 8 หลัก
            const value = e.target.value.replace(/\D/g, '').slice(0, 8);
            setMemberId(value);
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="กรอกรหัสสมาชิก 8 หลัก (ตัวเลขเท่านั้น)"
          maxLength={8}
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2"
        >
          <Plus size={16} />
          เพิ่ม
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      
      <p className="text-xs text-gray-500 mb-2">
        * รหัสสมาชิกต้องเป็นตัวเลข 8 หลัก เช่น 12345678
      </p>

      {/* Members List */}
      {members.length > 0 && (
        <div className="border border-gray-400 rounded p-3 mt-3 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            รายชื่อสมาชิก ({members.length} คน)
          </p>
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between bg-gray-50 p-2 rounded"
            >
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-600" />
                <span className="text-sm">
                  {member.name} ({member.id})
                </span>
              </div>
              <button
                onClick={() => onRemoveMember(member.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {members.length < 3 && members.length > 0 && (
        <p className="text-orange-500 text-sm mt-2">
          ⚠️ ต้องมีสมาชิกอย่างน้อย 3 คน (ยังต้องเพิ่มอีก {3 - members.length} คน)
        </p>
      )}
    </div>
  );
};

// Room Detail Component
const RoomDetail = ({ room }) => {
  if (!room) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <div className="flex items-start gap-2 mb-3">
        <Info size={20} className="text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-semibold text-blue-900">{room.name}</h4>
          <p className="text-sm text-blue-700">รายละเอียดห้อง</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-blue-600" />
          <span className="text-sm">รองรับได้: {room.capacity} ที่นั่ง</span>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">สิ่งอำนวยความสะดวก:</p>
          <div className="flex flex-wrap gap-1">
            {room.facilities.map((facility, index) => (
              <span
                key={index}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
              >
                {facility}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Booking Form Component
export const BookingForm = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [members, setMembers] = useState([]);

  const currentRoom = selectedFloor && selectedRoom 
    ? ROOMS_DATA[selectedFloor]?.find(r => r.id === selectedRoom)
    : null;

  // คำนวณระยะเวลาที่จอง (ในชั่วโมง)
  const getBookingDuration = () => {
    if (!startTime || !endTime) return 0;
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    return end - start;
  };

  // ตรวจสอบเวลาที่เลือกถูกต้องหรือไม่
  const isValidTimeRange = () => {
    const duration = getBookingDuration();
    return duration >= 1 && duration <= 2;
  };

  // กรองเวลาสิ้นสุดที่เลือกได้
  const getAvailableEndTimes = () => {
    if (!startTime) return [];
    
    const start = parseInt(startTime.split(':')[0]);
    const maxEnd = Math.min(start + 2, 17); // สูงสุด 2 ชั่วโมง หรือไม่เกิน 17:00
    
    return TIME_SLOTS.filter(slot => {
      const hour = parseInt(slot.value.split(':')[0]);
      return hour > start && hour <= maxEnd;
    });
  };

  const handleAddMember = (member) => {
    setMembers([...members, member]);
  };

  const handleRemoveMember = (memberId) => {
    setMembers(members.filter(m => m.id !== memberId));
  };

  const handleSubmit = () => {
    // Validation
    if (!selectedDate) {
      alert('กรุณาเลือกวันที่');
      return;
    }
    if (!selectedFloor || !selectedRoom) {
      alert('กรุณาเลือกชั้นและห้อง');
      return;
    }
    if (!startTime || !endTime) {
      alert('กรุณาเลือกเวลาเริ่มต้นและเวลาสิ้นสุด');
      return;
    }
    if (!isValidTimeRange()) {
      alert('ระยะเวลาการจองต้องอยู่ระหว่าง 1-2 ชั่วโมง');
      return;
    }
    if (members.length < 3) {
      alert('ต้องมีสมาชิกอย่างน้อย 3 คน');
      return;
    }

    const duration = getBookingDuration();
    const bookingData = {
      date: selectedDate,
      floor: selectedFloor,
      room: currentRoom.name,
      startTime: startTime,
      endTime: endTime,
      duration: duration + ' ชั่วโมง',
      members: members,
      bookedBy: user.username,
      bookedAt: new Date()
    };

    console.log('Booking Data:', bookingData);
    alert(`จองสำเร็จ! ✅\nระยะเวลา: ${duration} ชั่วโมง (${startTime} - ${endTime})`);

    // Reset form
    setSelectedDate(null);
    setSelectedFloor('');
    setSelectedRoom('');
    setStartTime('');
    setEndTime('');
    setMembers([]);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">ทำรายการจอง</h2>

      {/* Opening Hours Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <Clock size={20} className="text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">เวลาเปิด-ปิดให้บริการ</h3>
            <p className="text-sm text-yellow-700">
              วันจันทร์ - ศุกร์: 09:00 - 17:00 น. | 
              วันเสาร์ - อาทิตย์: ปิดทำการ
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 ">
        {/* User Info */}
        <div className="mb-6 pb-6 border-gray-200 border-b">
          <p className="text-sm text-gray-600 mb-4">ผู้ทำรายการจอง</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex">
              <span className="text-gray-600 w-48">รหัสนักศึกษา:</span>
              <span className="font-medium">{user?.studentId}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-48">คณะ:</span>
              <span className="font-medium">{user?.fullName}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-48">รหัสบัตรสมาร์ทการ์ด:</span>
              <span className="font-medium">{user?.libraryCard}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-48">สาขา:</span>
              <span className="font-medium">{user?.branch}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-48">หมายเลขบัตรประชาชน:</span>
              <span className="font-medium">{user?.nationalId}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-48">สถานะ:</span>
              <span className="font-medium">{user?.status}</span>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="space-y-6 ">
          {/* Step 1: Select Date */}
          <div>
            <div className="flex items-center gap-2 mb-3 ">
              <CalendarIcon size={20} className="text-blue-600 " />
              <label className="text-lg font-semibold">1. เลือกวันที่ต้องการ</label>
            </div>
            <CalendarPicker
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
            {selectedDate && (
              <p className="mt-2 text-sm text-green-600">
                ✓ เลือกวันที่: {selectedDate.toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>

          {/* Step 2: Select Floor & Room */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users size={20} className="text-blue-600" />
              <label className="text-lg font-semibold">2. เลือกชั้นและห้อง</label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">ชั้น</label>
                <select
                  value={selectedFloor}
                  onChange={(e) => {
                    setSelectedFloor(e.target.value);
                    setSelectedRoom('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-500 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- เลือกชั้น --</option>
                  <option value="floor1">ชั้น 1</option>
                  <option value="floor2">ชั้น 2</option>
                  <option value="floor3">ชั้น 3</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ห้อง</label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  disabled={!selectedFloor}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">-- เลือกห้อง --</option>
                  {selectedFloor &&
                    ROOMS_DATA[selectedFloor].map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} (รองรับ {room.capacity} คน)
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Room Detail */}
            <RoomDetail room={currentRoom} />
          </div>

          {/* Step 3: Select Time */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={20} className="text-blue-600" />
              <label className="text-lg font-semibold">3. เลือกช่วงเวลา (1-2 ชั่วโมง)</label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">เวลาเริ่มต้น</label>
                <select
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setEndTime(''); // Reset end time เมื่อเปลี่ยน start time
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- เลือกเวลาเริ่มต้น --</option>
                  {TIME_SLOTS.slice(0, -1).map((slot) => ( // ไม่ให้เลือก 17:00 เป็นเวลาเริ่ม
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">เวลาสิ้นสุด</label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={!startTime}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">-- เลือกเวลาสิ้นสุด --</option>
                  {getAvailableEndTimes().map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {startTime && endTime && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm">
                  <span className="font-medium">ระยะเวลาที่จอง:</span>{' '}
                  <span className="text-blue-700 font-semibold">
                    {getBookingDuration()} ชั่วโมง ({startTime} - {endTime})
                  </span>
                  {!isValidTimeRange() && (
                    <span className="block text-red-600 mt-1">
                      ⚠️ ระยะเวลาการจองต้องอยู่ระหว่าง 1-2 ชั่วโมง
                    </span>
                  )}
                  {isValidTimeRange() && (
                    <span className="block text-green-600 mt-1">
                      ✓ ระยะเวลาถูกต้อง
                    </span>
                  )}
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              * สามารถจองได้ขั้นต่ำ 1 ชั่วโมง และสูงสุด 2 ชั่วโมง
            </p>
          </div>

          {/* Step 4: Add Members */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users size={20} className="text-blue-600" />
              <label className="text-lg font-semibold">4. เพิ่มสมาชิกที่จอง</label>
            </div>
            <MemberInput
              members={members}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-6 ">
            <button
              onClick={handleSubmit}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
            >
              ยืนยันการจอง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};