/**
 * src/state/calendar-state.js
 * Quản lý trạng thái Lịch trình, Ngày/Tháng/Năm, Giờ mô phỏng & Thời tiết
 */
export function getCalendarState() {
  const s = globalThis.state || {};
  return {
    year: s.year,
    month: s.month,
    dayOfMonth: s.dayOfMonth,
    totalDaysElapsed: s.totalDaysElapsed,
    simMinute: s.simMinute,
    weatherMode: s.weatherMode,
    isRaining: s.isRaining
  };
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  getCalendarState
});
