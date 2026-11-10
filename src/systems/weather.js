/**
 * src/systems/weather.js
 * Hệ thống Thời tiết (Nắng / Mưa rào nhiệt đới / Tự động) & khởi tạo hạt mưa
 */
for (let i = 0; i < 85; i++) {
  rainDrops.push({
    x: Math.random() * 500,
    y: Math.random() * 500,
    len: 9 + Math.random() * 9,
    spd: 180 + Math.random() * 120
  });
}

export function cycleWeatherMode() {
  const modes = ["auto", "sunny", "rain", "night"];
  const idx = (modes.indexOf(state.weatherMode) + 1) % modes.length;
  state.weatherMode = modes[idx];
  updateWeatherState();
  refreshAllUI();
}

export function updateWeatherState() {
  const btn = document.getElementById("weather-btn");
  if (state.weatherMode === "rain") {
    state.isRaining = true;
    if (btn) btn.textContent = L("🌧️ Mưa dông", "🌧️ Rainstorm");
  } else if (state.weatherMode === "sunny") {
    state.isRaining = false;
    if (btn) btn.textContent = L("☀️ Nắng ráo", "☀️ Sunny");
  } else if (state.weatherMode === "night") {
    state.isRaining = false;
    if (btn) btn.textContent = L("🌙 Ban đêm", "🌙 Night");
  } else {
    const h = Math.floor(state.simMinute / 60);
    state.isRaining = ((state.dayOfMonth % 3 === 0) && (h >= 14 && h <= 19));
    if (btn) btn.textContent = state.isRaining ? L("🌧️ Tự động (Mưa)", "🌧️ Weather: Rain") : L("☀️ Tự động", "☀️ Weather: Auto");
  }
}

// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  cycleWeatherMode,
  updateWeatherState
});
