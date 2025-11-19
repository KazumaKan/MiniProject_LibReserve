import React, { useState, useEffect } from "react";
import { reservationAPI, apiUtils } from "../../services/api";
import { useAuth } from '../../hook/useAuth.js';
import { Calendar as CalendarIcon, Clock, Users, Plus, X, Info } from "lucide-react";

const TIME_SLOTS = Array.from({ length: 9 }, (_, i) => {
  const hour = 9 + i;
  return { value: `${hour}:00`, label: `${hour}:00 น.` };
});

// Calendar Component
// Calendar Component
const CalendarPicker = ({ selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // ฟังก์ชันตรวจวันที่ย้อนหลัง
  const isPastDate = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    return thisDate < today;
  };

  // กันทั้งเดือนย้อนหลัง → ปุ่ม Prev ใช้ไม่ได้
  const isPastMonth = () => {
    const today = new Date();
    const firstDayOfCurrent = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    return firstDayOfCurrent < new Date(today.getFullYear(), today.getMonth(), 1);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const handlePrevMonth = () => {
    if (!isPastMonth()) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    if (!isPastDate(day)) {
      onSelectDate(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      );
    }
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) =>
    selectedDate &&
    day === selectedDate.getDate() &&
    currentMonth.getMonth() === selectedDate.getMonth() &&
    currentMonth.getFullYear() === selectedDate.getFullYear();

  const monthNames = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];

  const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">

        {/* ปุ่มย้อนเดือน (ปิดถ้าเป็นเดือนอดีต) */}
        <button
          onClick={handlePrevMonth}
          disabled={isPastMonth()}
          className={`p-2 rounded ${
            isPastMonth()
              ? "text-gray-300 cursor-not-allowed"
              : "hover:bg-gray-100"
          }`}
        >
          ‹
        </button>

        <div className="font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear() + 543}
        </div>

        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded">
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

      {/* Dates */}
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
              disabled={isPastDate(day)}
              className={`p-2 text-center rounded transition-colors
                ${isPastDate(day) ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "hover:bg-blue-50"}
                ${isToday(day) ? "bg-blue-100 font-semibold" : ""}
                ${isSelected(day) ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
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

// Check if date is in the past
const isPastDate = (day) => {
  const today = new Date();
  const thisDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
  today.setHours(0, 0, 0, 0);
  return thisDate < today;
};

// Member Input Component
const MemberInput = ({ members, onAddMember, onRemoveMember }) => {
  const [memberId, setMemberId] = useState("");
  const [error, setError] = useState("");

  const handleAdd = async () => {
    setError("");
    console.log("➕ Trying to add member:", memberId);
    if (!memberId.trim()) return setError("กรุณากรอกรหัสสมาชิก");
    if (!/^\d{8}$/.test(memberId)) return setError("รหัสสมาชิกต้องเป็นตัวเลข 8 หลักเท่านั้น");
    if (members.some(m => m.id === memberId)) return setError("รหัสสมาชิกนี้ถูกเพิ่มแล้ว");

    try {
      const user = await apiUtils.checkMemberExists(memberId);
      console.log("🧾 Member data:", user);
      onAddMember({ id: memberId, name: user.name, addedAt: new Date() });
      setMemberId("");
    } catch (err) {
      console.error("❌ Add member error:", err.message);
      setError(err.message);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">สมาชิกที่จอง <span className="text-red-500">(ขั้นต่ำ 3 คน)</span></label>
      <div className="flex gap-2 mb-2">
        <input type="text" value={memberId} onChange={e => setMemberId(e.target.value.replace(/\D/g,"").slice(0,8))}
          onKeyPress={e => e.key === "Enter" && handleAdd()}
          placeholder="กรอกรหัสสมาชิก 8 หลัก"
          maxLength={8} className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
        <button onClick={handleAdd} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2">
          <Plus size={16} /> เพิ่ม
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      {members.length > 0 && (
        <div className="border border-gray-400 rounded p-3 mt-3 space-y-2">
          <p className="text-sm font-medium text-gray-700">รายชื่อสมาชิก ({members.length} คน)</p>
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div className="flex items-center gap-2"><Users size={16} className="text-gray-600" /><span className="text-sm">{member.name} ({member.id})</span></div>
              <button onClick={() => onRemoveMember(member.id)} className="text-red-500 hover:text-red-700"><X size={16} /></button>
            </div>
          ))}
        </div>
      )}
      {members.length < 3 && members.length > 0 && <p className="text-orange-500 text-sm mt-2">⚠️ ต้องมีสมาชิกอย่างน้อย 3 คน (ยังต้องเพิ่มอีก {3-members.length} คน)</p>}
    </div>
  );
};

// Room Detail Component
const RoomDetail = ({ room }) => {
  if (!room) return null;
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <div className="flex items-start gap-2 mb-2"><Info size={20} className="text-blue-600 mt-0.5" />
        <div><h4 className="font-semibold text-blue-900">{room.room_name}</h4><p className="text-sm text-blue-700">รหัสห้อง: {room.room_id}</p></div>
      </div>
      <p className="text-sm">ตำแหน่ง: {room.location}</p>
      <p className="text-sm">ความจุ: {room.capacity} คน</p>
      <p className="text-sm">สิ่งอำนวยความสะดวก: {room.amenity}</p>
    </div>
  );
};

// Main Booking Form Component
export const BookingForm = () => {
  const { user, token } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [rooms, setRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoadingRooms(true);
        const data = await reservationAPI.getRooms();
        console.log("🏢 Rooms data:", data);
        setRooms(data);
      } catch (err) { console.error("❌ Error fetching rooms:", err); }
      finally { setIsLoadingRooms(false); }
    };
    fetchRooms();
  }, []);

  const floors = Array.from(new Set(rooms.map(r => r.location)));
  const roomsByFloor = (floor) => rooms.filter(r => r.location === floor);
  const currentRoom = rooms.find(r => r.room_id.toString() === selectedRoom);

  const getBookingDuration = () => !startTime || !endTime ? 0 : parseInt(endTime) - parseInt(startTime);
  const isValidTimeRange = () => { const d = getBookingDuration(); return d >= 1 && d <= 2; };
  const getAvailableEndTimes = () => {
    if (!startTime) return [];
    const start = parseInt(startTime);
    const maxEnd = Math.min(start + 2, 17);
    return TIME_SLOTS.filter(slot => { const hour = parseInt(slot.value); return hour > start && hour <= maxEnd; });
  };

  const handleAddMember = (member) => setMembers([...members, member]);
  const handleRemoveMember = (id) => setMembers(members.filter(m => m.id !== id));

  const handleSubmit = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert("ไม่สามารถจองวันย้อนหลังได้");
      return;
    }
    if (!selectedDate) return alert("กรุณาเลือกวันที่");
    if (!selectedFloor || !selectedRoom) return alert("กรุณาเลือกชั้นและห้อง");
    if (!startTime || !endTime) return alert("กรุณาเลือกเวลาเริ่มต้นและสิ้นสุด");
    if (!isValidTimeRange()) return alert("จองได้แค่ 1-2 ชั่วโมงเท่านั้น");
    if (members.length < 3) return alert("ต้องมีสมาชิกอย่างน้อย 3 คน");

    setIsLoading(true);
    try {
      const dateString = selectedDate.toISOString().split("T")[0];
      const startDateTime = `${dateString}T${startTime}:00`;
      const endDateTime = `${dateString}T${endTime}:00`;
    const bookingData = {
      userId: user?.id,
      roomId: selectedRoom,
      startTime: startDateTime,
      endTime: endDateTime,
      codeUsers: members.map(m => m.id),
    };

      console.log("📤 Submitting booking:", bookingData);
      const response = await reservationAPI.bookRoom(bookingData, token);
      console.log("✅ Booking success:", response);
      alert("จองสำเร็จ!");
      setSelectedDate(null); setSelectedFloor(""); setSelectedRoom(""); setStartTime(""); setEndTime(""); setMembers([]);
    } catch (err) {
      console.error("❌ Booking error:", err);
      setError(err.message);
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">ทำรายการจอง</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6 pb-6 border-gray-200 border-b">
          <p className="text-sm text-gray-600 mb-4">ผู้ทำรายการจอง</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex"><span className="text-gray-600 w-40">ชื่อผู้ใช้:</span> <span className="font-medium">{user.name}</span></div>
            <div className="flex"><span className="text-gray-600 w-40">คณะ:</span> <span className="font-medium">{user.faculty}</span></div>
            <div className="flex"><span className="text-gray-600 w-40">รหัสนักศึกษา:</span> <span className="font-medium">{user.email}</span></div>
            <div className="flex"><span className="text-gray-600 w-40">สาขา:</span> <span className="font-medium">{user.major}</span></div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3"><CalendarIcon size={20} className="text-blue-600" /><label className="text-lg font-semibold">1. เลือกวันที่ต้องการ</label></div>
            <CalendarPicker selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            {selectedDate && <p className="mt-2 text-sm text-green-600">✓ เลือกวันที่: {selectedDate.toLocaleDateString("th-TH", { year:"numeric", month:"long", day:"numeric" })}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3"><Users size={20} className="text-blue-600" /><label className="text-lg font-semibold">2. เลือกชั้นและห้อง</label></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">ชั้น</label>
                <select value={selectedFloor} onChange={e=>{setSelectedFloor(e.target.value); setSelectedRoom("");}} className="w-full px-3 py-2 border border-gray-300 text-gray-500 rounded focus:ring-2 focus:ring-blue-500">
                  <option value="">-- เลือกชั้น --</option>
                  {floors.map(floor=> <option key={floor} value={floor}>{floor}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ห้อง</label>
                <select value={selectedRoom} onChange={e=>setSelectedRoom(e.target.value)} disabled={!selectedFloor} className="w-full px-3 py-2 border border-gray-300 rounded text-gray-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                  <option value="">-- เลือกห้อง --</option>
                  {selectedFloor && roomsByFloor(selectedFloor).map(room=> <option key={room.room_id} value={room.room_id}>{room.room_name} (รองรับ {room.capacity} คน)</option>)}
                </select>
              </div>
            </div>
            <RoomDetail room={currentRoom} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3"><Clock size={20} className="text-blue-600" /><label className="text-lg font-semibold">3. เลือกเวลา</label></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">เวลาเริ่มต้น</label>
                <select value={startTime} onChange={e=>{setStartTime(e.target.value); setEndTime("");}} className="w-full px-3 py-2 border border-gray-300 rounded">
                  <option value="">-- เลือกเวลา --</option>
                  {TIME_SLOTS.map(slot => <option key={slot.value} value={slot.value.split(":")[0]}>{slot.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">เวลาสิ้นสุด</label>
                <select value={endTime} onChange={e=>setEndTime(e.target.value)} disabled={!startTime} className="w-full px-3 py-2 border border-gray-300 rounded disabled:bg-gray-100">
                  <option value="">-- เลือกเวลา --</option>
                  {getAvailableEndTimes().map(slot => <option key={slot.value} value={slot.value.split(":")[0]}>{slot.label}</option>)}
                </select>
              </div>
            </div>
            {!isValidTimeRange() && startTime && endTime && <p className="text-red-500 text-sm mt-1">⚠️ จองได้แค่ 1-2 ชั่วโมงเท่านั้น</p>}
          </div>

          <div className="flex items-center gap-2 mb-3"><Users size={20} className="text-blue-600" /><label className="text-lg font-semibold">4. เพิ่มสมาชิกที่จอง</label></div>
          <MemberInput members={members} onAddMember={handleAddMember} onRemoveMember={handleRemoveMember} />

          <div className="mt-6">
            <button onClick={handleSubmit} disabled={isLoading} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">{isLoading ? "กำลังจอง..." : "ยืนยันการจอง"}</button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
