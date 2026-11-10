/**
 * src/lang/lang-pack.js
 * Hệ thống Đa ngôn ngữ Song ngữ Việt - Anh (VI / EN) & đồng bộ nhãn DOM
 */
// =========================================================================================
// BỘ NGÔN NGỮ CHUẨN HÓA (LANG_PACK = { vi, en }) — TIẾNG VIỆT 100% VI / TIẾNG ANH 100% EN
// ĐẠI ĐÔ THỊ NOVAVERDE (THÀNH PHỐ XANH ÁNH DƯƠNG / NOVAVERDE METROPOLIS) — 100% BẢN QUYỀN GỐC
// =========================================================================================
window.LANG_PACK = {
  vi: {
    cityName: "Đại Đô Thị NovaVerde",
    citySub: "Thành Phố Xanh Ánh Dương (5.400 Lô • 12 Quận • 36 Phường)",
    riverName: "Sông Ngân Hà",
    centralLakeName: "Hồ Tinh Cầu",
    speedLockedBadge: "🔒 1x",
    speedLockedSetting: "🔒 Tốc độ Server: 1x Cố Định (Chống gian lận BXH)",
    hudLocateTitle: "Định vị & nhảy tuần tự qua các Lô Trạm Sạc của tôi",
    hudRadarTitle: "Bật/Tắt Radar Minimap Hình Tròn 360° Toàn Cảnh 5.400 Lô",
    hudSettingTitle: "Mở Cài Đặt (Ngôn ngữ, Âm thanh, Góc nhìn, Lưu game & Công cụ)",
    tabLot: "🔌 QUY HOẠCH M² ĐẤT & TRỤ SẠC",
    tabAmenities: "☕ TỔ HỢP TIỆN ÍCH 2.5D TRÊN SÂN",
    tabAllLots: "🏙️ ĐẠI ĐÔ THỊ NOVAVERDE 5.400 LÔ ĐẤT (12 QUẬN × 36 PHƯỜNG)",
    tabRivals: "🏆 BẢNG XẾP HẠNG ĐUA TOP, SÀN ĐẤU GIÁ SỔ ĐỎ & ĐỐI THỦ",
    tabFinance: "🧾 THUẾ KINH DOANH, THUẾ NĂM & SỔ ĐỐI SOÁT",
    dockLot: "Đất & Trụ",
    dockAm: "Tiện Ích",
    dockAll: "5.400 Lô (12Q)",
    dockMp: "BXH & Đấu Giá",
    dockFin: "Thuế & Sổ"
  },
  en: {
    cityName: "NovaVerde Metropolis",
    citySub: "Solaris Green Megacity (5,400 Lots • 12 Districts • 36 Wards)",
    riverName: "Silverstar River",
    centralLakeName: "Starlight Lake",
    speedLockedBadge: "🔒 1x",
    speedLockedSetting: "🔒 Server Time: 1x Real-Time Locked (Anti-Cheat)",
    hudLocateTitle: "Locate & cycle through my owned EV Charging Stations",
    hudRadarTitle: "Toggle 360° Circular Urban Radar Minimap (5,400 Lots)",
    hudSettingTitle: "Open Settings (Language, Sound, Camera View, Cloud Save & Tools)",
    tabLot: "🔌 LAND AREA M² & EV CHARGER BAYS",
    tabAmenities: "☕ 3D STATION AMENITIES & SERVICES",
    tabAllLots: "🏙️ NOVAVERDE 5,400 LOTS (12 DISTRICTS × 36 WARDS OPEN WORLD)",
    tabRivals: "🏆 LEADERBOARD, LAND AUCTION & RIVAL STATIONS",
    tabFinance: "🧾 BUSINESS TAXES, ANNUAL CIT & FINANCIAL LEDGER",
    dockLot: "Land & Bays",
    dockAm: "Amenities",
    dockAll: "5,400 Lots",
    dockMp: "Rank & Auction",
    dockFin: "Tax & Ledger"
  }
};

window.currentLang = localStorage.getItem("HN_EV_LANG") === "en" ? "en" : "vi";


export function isEn() {
  return window.currentLang === "en";
}

export function tPack(key) {
  const pack = window.LANG_PACK[window.currentLang] || window.LANG_PACK.vi;
  return pack[key] || window.LANG_PACK.vi[key] || key;
}

export function L(viText, enText) {
  return window.currentLang === "en" ? enText : viText;
}

export function getItemName(obj) {
  if (!obj) return "";
  return (window.currentLang === "en" && obj.nameEn) ? obj.nameEn : obj.name;
}

export function getItemDesc(obj) {
  if (!obj) return "";
  return (window.currentLang === "en" && obj.descEn) ? obj.descEn : obj.desc;
}


export function applyLanguageStaticDOM() {
  const en = isEn();
  const setTxt = (id, vi, enStr) => {
    const el = document.getElementById(id);
    if (el) el.textContent = en ? enStr : vi;
  };
  const setHtml = (id, vi, enStr) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = en ? enStr : vi;
  };

  setTxt("btn-toggle-lang", "🇻🇳", "🇬🇧");
  setTxt("lang-pop-btn", "🌐 Ngôn ngữ: Tiếng Việt (Bấm đổi sang EN)", "🌐 Language: English (Tap to switch to VI)");
  setTxt(
    "sfx-pop-btn",
    (typeof sfxEnabled === "undefined" || sfxEnabled) ? "🔊 Âm thanh: Bật" : "🔇 Âm thanh: Tắt",
    (typeof sfxEnabled === "undefined" || sfxEnabled) ? "🔊 Sound: ON" : "🔇 Sound: OFF"
  );
  setTxt("save-pop-btn", "💾 Lưu & Cloud", "💾 Save & Sync");
  setTxt("map-pop-btn", "🗺️ Bản Đồ 12 Quận", "🗺️ 12-District Map");
  setTxt("search-5400-pop-btn", "🔍 Tìm Lô #1..5400", "🔍 Find Lot #1..5400");
  setTxt("locate-pop-btn", "🎯 Tới Trạm Của Tôi", "🎯 Locate My Station");
  setTxt("open-gc-shop-pop-btn", "🪙 Cửa Hàng GreenCoin: Tools • Vật Phẩm • Skin 3D", "🪙 GreenCoin Shop: VIP Tools • Items • 3D Skins");
  setTxt("hud-prev-ward-btn", "◀", "◀");
  setTxt("hud-next-ward-btn", "▶", "▶");
  setTxt("radar-hdr-lbl", "🧭 BẢN ĐỒ RADAR ĐÔ THỊ", "🧭 URBAN RADAR MAP");
  setTxt("mini-mode-world-btn", "🌐 12 Quận (36P)", "🌐 12 Districts");
  setTxt("mini-mode-ward-btn", "🔍 Chi Tiết Phố", "🔍 Ward Streets");
  setTxt(
    "mini-expand-btn",
    state.minimapExpanded ? "🗕 Thu gọn" : "⛶ Phóng to",
    state.minimapExpanded ? "🗕 Compact" : "⛶ Expand"
  );
  setHtml(
    "mini-legend-bar",
    "<span>🟢 Trạm tôi</span><span>🔴 Đối thủ</span><span>🔨 Đấu giá</span><span>🟡 Đang chọn</span><span>🌊 Sông/Hồ</span>",
    "<span>🟢 My Lot</span><span>🔴 Rival</span><span>🔨 Auction</span><span>🟡 Selected</span><span>🌊 Water</span>"
  );
  setTxt("tools-pop-title", "⚙️ CÀI ĐẶT & ĐIỀU KHIỂN (SETTINGS)", "⚙️ SETTINGS & QUICK CONTROLS");
  setHtml(
    "tools-pop-desc",
    "💵 <b>GreenDollar (G$):</b> Tiền kiếm được từ sạc điện, tiện ích & thu phạt.<br/>🪙 <b>GreenCoin (GC):</b> Tiền nạp để dùng VIP Tools, mua Vật phẩm & Skin 3D!",
    "💵 <b>GreenDollar (G$):</b> Earned currency from EV charging, amenities & fines.<br/>🪙 <b>GreenCoin (GC):</b> Top-up currency for VIP Tools, Boosters & 3D Skins!"
  );

  setTxt("iso-mode-pop-btn", state.isoView ? "💎 Góc: Iso 3D" : "🗺️ Góc: Phẳng", state.isoView ? "💎 View: Iso 3D" : "🗺️ View: Flat 2D");
  const wMapVi = { auto: "☀️ Tự động", sunny: "☀️ Nắng ráo", rain: "🌧️ Mưa dông", night: "🌙 Ban đêm" };
  const wMapEn = { auto: "☀️ Weather: Auto", sunny: "☀️ Sunny", rain: "🌧️ Rainstorm", night: "🌙 Night" };
  setTxt("weather-btn", wMapVi[state.weatherMode] || "☀️ Tự động", wMapEn[state.weatherMode] || "☀️ Weather: Auto");
  setTxt("zoom-out-pop-btn", "🔍 Thu nhỏ (-)", "🔍 Zoom Out (-)");
  setTxt("zoom-in-pop-btn", "🔍 Phóng to (+)", "🔍 Zoom In (+)");
  setTxt("setting-speed-lock-lbl", tPack("speedLockedSetting"), tPack("speedLockedSetting"));
  setTxt("hud-realtime-badge", tPack("speedLockedBadge"), tPack("speedLockedBadge"));
  setTxt("next-month-pop-btn", "⚡ Sạc Đầy Ngay (10 GC)", "⚡ Instant Charge (10 GC)");
  setTxt("add-cap-pop-btn", "💵 +150K G$", "💵 +150K G$");

  const locBtn = document.getElementById("btn-locate-my-lot");
  if (locBtn) locBtn.title = tPack("hudLocateTitle");
  const radBtn = document.getElementById("btn-toggle-radar");
  if (radBtn) radBtn.title = tPack("hudRadarTitle");
  const setBtn = document.getElementById("btn-toggle-tools");
  if (setBtn) setBtn.title = tPack("hudSettingTitle");

  setTxt("drawer-hide-btn", "🔽 Ẩn", "🔽 Hide");
  setTxt("jump-lot-lbl", "🎯 Tới Lô #1–#5400:", "🎯 Go to Lot #1–5400:");
  const jumpInp = document.getElementById("lot-jump-input");
  if (jumpInp) jumpInp.placeholder = en ? "Enter Lot # (1 - 5400)..." : "Nhập số Lô (1 - 5400)...";
  setTxt("jump-lot-go-btn", "🚀 Bay Tới", "🚀 Jump");
  setTxt("jump-lot-map-btn", "🗺️ 12 Quận", "🗺️ 12 Districts");

  const zfLabels = {
    ALL: ["🌐 Tất cả (5.400 Lô)", "🌐 All (5,400 Lots)"],
    CURRENT_WARD: ["📍 Phường Đang Xem (150)", "📍 Current Ward (150)"],
    OWNED: ["🟢 Đang sở hữu", "🟢 Owned Lots"],
    DIST_0: ["🐢 Q1.Hoàng Kim (450)", "🐢 D1.Aurum (450)"],
    DIST_1: ["🏛️ Q2.Thiên Đình (450)", "🏛️ D2.Celestia (450)"],
    DIST_2: ["🌊 Q3.Bích Hồ (450)", "🌊 D3.Azure Lake (450)"],
    DIST_3: ["🎓 Q4.Văn Hiến (450)", "🎓 D4.Academica (450)"],
    DIST_4: ["🏙️ Q5.Silicon CBD (450)", "🏙️ D5.Silicon CBD (450)"],
    DIST_5: ["🏟️ Q6.Olympus (450)", "🏟️ D6.Olympus (450)"],
    DIST_6: ["🏢 Q7.Tân Cổ Điển (450)", "🏢 D7.Imperia (450)"],
    DIST_7: ["🌳 Q8.Đại Công Viên (450)", "🌳 D8.Central Park (450)"],
    DIST_8: ["🌉 Q9.Đông Giang (450)", "🌉 D9.Eastbank (450)"],
    DIST_9: ["🚇 Q10.Metro Lụa (450)", "🚇 D10.Metro Silk (450)"],
    DIST_10: ["🚀 Q11.Bắc Ngân Hà (450)", "🚀 D11.North Galaxy (450)"],
    DIST_11: ["🌴 Q12.Vịnh Ngọc Trai (450)", "🌴 D12.Pearl Lagoon (450)"],
    CONG_VIEN: ["🌳 Ven Công Viên", "🌳 Near Parks"],
    CAO_OC_CBD: ["🏙️ Cao Ốc CBD", "🏙️ CBD Towers"],
    PHO_CO: ["🏮 Khu Phố Cổ", "🏮 Heritage Core"],
    SONG_HONG: ["🌊 Ven Sông Ngân Hà", "🌊 Silverstar Riverfront"]
  };
  document.querySelectorAll(".zone-chip[data-zf]").forEach(btn => {
    const k = btn.getAttribute("data-zf");
    if (zfLabels[k]) btn.textContent = en ? zfLabels[k][1] : zfLabels[k][0];
  });

  setTxt("fin-lbl-yr-rev", "Doanh thu năm (GreenDollar)", "Annual Gross Revenue (G$)");
  setTxt("fin-lbl-profit", "Lợi nhuận Sạc + Tiện ích (G$)", "Charging + Amenity Profit (G$)");
  setTxt("fin-lbl-tax", "Tổng Thuê & Thuế đã nộp (G$)", "Total Rent & Taxes Paid (G$)");
  setTxt("fin-lbl-debt", "Tổng Dư Nợ (Gốc + Lãi G$)", "Total Overdue Debt (G$)");

  setTxt("dock-lbl-lot", "Đất & Trụ", "Land & Bays");
  setTxt("dock-lbl-am", "Tiện Ích", "Amenities");
  setTxt("dock-lbl-all", "5.400 Lô (12Q)", "5,400 Lots");
  setTxt("dock-lbl-mp", "MP & Đấu Giá", "MP & Auction");
  setTxt("dock-lbl-fin", "Thuế & Sổ", "Tax & Ledger");

  setTxt("report-modal-title", "📡 BÁO CÁO VẬN HÀNH & QUYẾT TOÁN", "📡 OPERATIONS & TAX SETTLEMENT REPORT");
  setTxt("offline-close-btn", "Đóng", "Close");
  setTxt("save-modal-hdr-title", "💾 ĐỒNG BỘ SERVER & LƯU TRỮ (5.400 LÔ)", "💾 SERVER SYNC & CLOUD SAVE (5,400 LOTS)");
  setHtml(
    "save-modal-desc",
    "• <b>Hệ tiền tệ thống nhất:</b> 💵 <b>GreenDollar (G$)</b> (tiền kiếm được từ trạm sạc) & 🪙 <b>GreenCoin (GC)</b> (tiền nạp dùng VIP Tools, mua Vật phẩm & Skin 3D).<br/>• <b>Song ngữ Việt 🇻🇳 ⇄ Anh 🇬🇧:</b> Bấm nút cờ trên HUD để đổi ngôn ngữ tức thì.",
    "• <b>Unified Dual Currency:</b> 💵 <b>GreenDollar (G$)</b> (earned from charging & amenities) & 🪙 <b>GreenCoin (GC)</b> (top-up currency for VIP Tools, Items & 3D Skins).<br/>• <b>Bilingual 🇻🇳 VI ⇄ 🇬🇧 EN:</b> Tap the flag icon on the HUD to switch language."
  );
  setTxt("sim-offline-btn", "🌙 Giả lập Offline 2 Giờ", "🌙 Simulate 2h Offline");
  setTxt("save-now-btn", "💾 Lưu Ngay Lập Tức", "💾 Save Immediately");
  setTxt("save-json-hdr-lbl", "📤 Mã Save JSON (Chuyển thiết bị / Sao lưu):", "📤 Save JSON String (Cross-Device Backup):");
  setTxt("export-save-btn", "📋 Copy Mã Save", "📋 Copy Save JSON");
  setTxt("import-save-btn", "📥 Nạp Mã Save", "📥 Load Save JSON");
  setTxt("reset-prompt-lbl", "Muốn chơi lại từ đầu (65,000 G$ & 250 GC)?", "Start a fresh game (65,000 G$ & 250 GC)?");
  setTxt("reset-game-btn", "🔄 Reset Game", "🔄 Reset Game");
  setTxt("metro-modal-hdr-title", "🗺️ BẢN ĐỒ 12 QUẬN ĐẠI ĐÔ THỊ NOVAVERDE (5.400 LÔ)", "🗺️ NOVAVERDE 12 DISTRICTS MAP (5,400 LOTS)");
  setTxt("gc-shop-modal-hdr-title", "🪙 CỬA HÀNG GREENCOIN: TOOLS • VẬT PHẨM • SKIN 3D", "🪙 GREENCOIN SHOP: VIP TOOLS • ITEMS • 3D SKINS");

  updateGreenCoinHUD();
  if (typeof applySheetModeUI === "function") applySheetModeUI();
}

export function syncRecentFeedLanguage() {
  if (!window.mpState) return;
  window.mpState.recentFeed = isEn()
    ? [
        "🏆 NovaVerde Metropolis Leaderboard (5,400 Lots) is live!",
        "📈 Goldleaf Ward land value rose +12% due to surging EV charger demand.",
        "🔨 Freehold Red Book Auction open for Lot #12: Solaris Galleria Frontage."
      ]
    : [
        "🏆 Bảng Xếp Hạng Đua Top Đại Đô Thị NovaVerde (5.400 Lô) đã sẵn sàng!",
        "📈 Giá BĐS Phường Kim Ngân tăng +12% do nhu cầu lắp trạm sạc tăng cao.",
        "🔨 Đang mở phiên đấu giá Sổ Đỏ Lô #12: Mặt Tiền Trường Thịnh Galleria."
      ];
  if (window.mpState.playerName === "Tập Đoàn GreenVolt HN" || window.mpState.playerName === "Tập Đoàn GreenVolt Nova" || window.mpState.playerName === "GreenVolt Nova Corp") {
    window.mpState.playerName = isEn() ? "GreenVolt Nova Corp" : "Tập Đoàn GreenVolt Nova";
  }
}

export function toggleLanguage() {
  window.currentLang = window.currentLang === "en" ? "vi" : "en";
  localStorage.setItem("HN_EV_LANG", window.currentLang);
  if (typeof playSfx === "function") playSfx("click");
  if (typeof triggerHaptic === "function") triggerHaptic(18);
  syncRecentFeedLanguage();
  const logBox = document.getElementById("event-log");
  if (logBox) logBox.innerHTML = "";
  applyLanguageStaticDOM();
  refreshAllUI();
  renderGreenCoinShopModal();
  const metroModal = document.getElementById("metro-map-modal");
  if (metroModal && metroModal.classList.contains("show")) {
    openWorldMetroMapModal();
  }
  logEvent(L(
    "🇻🇳 Đã chuyển toàn bộ ngôn ngữ sang Tiếng Việt (Đại Đô Thị NovaVerde • Tiền tệ: GreenDollar G$ & GreenCoin GC)!",
    "🇬🇧 Switched entire game language to English (NovaVerde Metropolis • Currency: GreenDollar G$ & GreenCoin GC)!"
  ));
}

// CỬA HÀNG & HỆ THỐNG XỬ LÝ GREENCOIN (🪙 GC): NẠP GC, DÙNG VIP TOOLS, MUA VẬT PHẨM & TRANG BỊ SKIN 3D

// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  isEn,
  tPack,
  L,
  getItemName,
  getItemDesc,
  applyLanguageStaticDOM,
  syncRecentFeedLanguage,
  toggleLanguage,
  LANG_PACK
});
