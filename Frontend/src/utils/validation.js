export const validateBooking = (day, room, people) => {
  const errors = {};
  
  if (!day) errors.day = 'กรุณาเลือกวัน';
  if (!room) errors.room = 'กรุณาเลือกห้อง';
  if (!people) errors.people = 'กรุณาเลือกจำนวนคน';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};