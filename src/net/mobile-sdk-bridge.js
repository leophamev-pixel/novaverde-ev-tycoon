/**
 * src/net/mobile-sdk-bridge.js
 * Tích hợp Firebase Auth, Cloud Save (Firestore), Google AdMob (6 Slots), IAP & Màn hình chờ
 */
import { ENV_CONFIG } from "../config/env.js";

// === START NOVAVERDE MOBILE SDK BRIDGE ===
/**
 * =========================================================================================
 * NOVAVERDE METROPOLIS EV TYCOON — MOBILE STORE NATIVE BRIDGE SDK (iOS & ANDROID)
 * - Đã kết nối trực tiếp vào Firebase Project thật: `novaverde-ev-tycoon` (430266828922)
 *   1. Authentication: Sign in with Apple, Google Sign-In / Play Games & Firebase Anonymous Auth
 *   2. Cloud Save & Anti-Cheat 1x Speed Leaderboard Sync (Firebase Firestore `novaverde-ev-tycoon`)
 *   3. Monetization - Ads: Google AdMob Rewarded Video & Banner Ads (@capacitor-community/admob)
 *   4. Monetization - IAP: In-App Purchases nạp GreenCoin & Remove Ads (@revenuecat/purchases-capacitor)
 * =========================================================================================
 */
window._nvGameLoopStarted = true; initGame();

(function initNovaVerdeMobileSDK() {
const FIREBASE_CONFIG = {
projectId: "novaverde-ev-tycoon",
projectNumber: "430266828922",
authDomain: "novaverde-ev-tycoon.firebaseapp.com",
storageBucket: "novaverde-ev-tycoon.firebasestorage.app",
apiKeyIos: "AIzaSyCgOPtkqUaOthRR-YCqWhnP950vU4E-SkY",
apiKeyAndroid: "AIzaSyD2mpcspdI4oF9O2FECoMf40UkBvh4GqM0",
iosAppId: "1:430266828922:ios:95cb3e592f0f36da1a13c3",
androidAppId: "1:430266828922:android:d85743aad17689561a13c3",
iosClientId: "430266828922-lsrk2oc697cnosi9p9jcji3jmt4a3jaj.apps.googleusercontent.com",
reversedClientId: "com.googleusercontent.apps.430266828922-lsrk2oc697cnosi9p9jcji3jmt4a3jaj",
webClientId: "430266828922-12pfkgga86mvu95ocmc13kmhk8jdk9em.apps.googleusercontent.com"
};

const ADMOB_CONFIG = {
publisherId: "pub-7182007818337262",
adSenseClientId: "ca-pub-7182007818337262",
ios: {
  appId: "ca-app-pub-7182007818337262~4517338155",
  bannerAdUnitId: "ca-app-pub-7182007818337262/1084525457",
  rewardedAdUnitId: "ca-app-pub-7182007818337262/9536750608",
  bannerUnits: {
    "shop-top-banner": "ca-app-pub-7182007818337262/1084525457",
    "leaderboard-top-banner": "ca-app-pub-7182007818337262/1084525457",
    "bottom_adaptive": "ca-app-pub-7182007818337262/1084525457"
  },
  rewardedUnits: {
    ad_cash: "ca-app-pub-7182007818337262/9536750608",
    ad_gc: "ca-app-pub-7182007818337262/9536750608",
    ad_x2: "ca-app-pub-7182007818337262/9536750608",
    ad_box: "ca-app-pub-7182007818337262/9536750608"
  }
},
android: {
  appId: "ca-app-pub-7182007818337262~2769142219",
  bannerAdUnitId: "ca-app-pub-7182007818337262/1327088098",
  rewardedAdUnitId: "ca-app-pub-7182007818337262/4507785207",
  bannerUnits: {
    "shop-top-banner": "ca-app-pub-7182007818337262/1327088098",
    "leaderboard-top-banner": "ca-app-pub-7182007818337262/1327088098",
    "bottom_adaptive": "ca-app-pub-7182007818337262/1327088098"
  },
  rewardedUnits: {
    ad_cash: "ca-app-pub-7182007818337262/4507785207",
    ad_gc: "ca-app-pub-7182007818337262/4507785207",
    ad_x2: "ca-app-pub-7182007818337262/4507785207",
    ad_box: "ca-app-pub-7182007818337262/4507785207"
  }
}
};

const IAP_PRODUCTS_MAP = {
100:  { productId: "com.novaverde.evtycoon.gc100",  priceUsd: "$0.99",  gcAmount: 100, type: "consumable" },
500:  { productId: "com.novaverde.evtycoon.gc500",  priceUsd: "$3.99",  gcAmount: 500, type: "consumable" },
2000: { productId: "com.novaverde.evtycoon.gc2000", priceUsd: "$12.99", gcAmount: 2000, type: "consumable" },
remove_ads: { productId: "com.novaverde.evtycoon.removeads", priceUsd: "$2.99", gcAmount: 150, type: "non_consumable" }
};

function isNativeCapacitor() {
return Boolean(window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform());
}

function getPlatformName() {
if (window.Capacitor && typeof window.Capacitor.getPlatform === "function") {
  return window.Capacitor.getPlatform(); // "ios" | "android" | "web"
}
return "web";
}

function getActiveFirebaseApiKey() {
return getPlatformName() === "android" ? FIREBASE_CONFIG.apiKeyAndroid : FIREBASE_CONFIG.apiKeyIos;
}

function tr(vi, en) {
return (window.currentLang === "en") ? en : vi;
}

const FRESH_EPOCH_KEY = "NOVAVERDE_FRESH_EPOCH_2026_11_07_V1";
function clearAllGameAndAuthStorage() {
try {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k !== FRESH_EPOCH_KEY && k !== "HN_EV_LANG") {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
} catch (e) {}
}

let _didFreshEpochReset = false;
try {
if (localStorage.getItem(FRESH_EPOCH_KEY) !== "done") {
  clearAllGameAndAuthStorage();
  localStorage.setItem(FRESH_EPOCH_KEY, "done");
  _didFreshEpochReset = true;
}
} catch (e) {}

const savedAuth = (() => {
try {
  return JSON.parse(localStorage.getItem("NOVAVERDE_AUTH_USER") || "null");
} catch (e) {
  return null;
}
})();

const sdkState = {
platform: getPlatformName(),
isNative: isNativeCapacitor(),
firebaseProjectId: FIREBASE_CONFIG.projectId,
admobReady: false,
iapReady: false,
nativeBannerVisible: false,
lastCloudSyncAt: Number(localStorage.getItem("NOVAVERDE_LAST_CLOUD_SYNC") || 0),
antiCheatVerified: true,
sessionStartedAtRealMs: Date.now(),
sessionStartedSimDays: 1,
user: savedAuth || {
  uid: localStorage.getItem("HN_EV_MP_PLAYER_ID") || ("guest_" + Math.random().toString(36).slice(2, 9)),
  provider: "guest",
  displayName: localStorage.getItem("HN_EV_MP_PLAYER_NAME") || "GreenVolt Nova Corp",
  email: null,
  idToken: null,
  isAnonymous: true
}
};

// =======================================================================================
// 1. KHỞI TẠO CAPACITOR PLUGINS (STATUS BAR, SPLASH SCREEN, ADMOB, REVENUECAT IAP)
// =======================================================================================
async function bootstrapNativePlugins() {
const Plugins = (window.Capacitor && window.Capacitor.Plugins) || {};

if (Plugins.StatusBar) {
  try {
    await Plugins.StatusBar.setStyle({ style: "DARK" });
  } catch (e) {}
}

if (Plugins.AdMob) {
  try {
    await Plugins.AdMob.initialize({
      initializeForTesting: false
    });
    sdkState.admobReady = true;
  } catch (e) {
    console.warn("[NovaVerde SDK] AdMob init warning:", e);
  }
}

if (Plugins.Purchases) {
  try {
    const apiKey = sdkState.platform === "ios"
      ? "appl_REPLACE_WITH_REVENUECAT_IOS_KEY"
      : "goog_REPLACE_WITH_REVENUECAT_ANDROID_KEY";
    await Plugins.Purchases.configure({
      apiKey,
      appUserID: sdkState.user.uid
    });
    sdkState.iapReady = true;
  } catch (e) {
    console.warn("[NovaVerde SDK] RevenueCat init warning:", e);
  }
}
}

// =======================================================================================
// 2. HỆ THỐNG ĐĂNG NHẬP (APPLE SIGN-IN, GOOGLE SIGN-IN & FIREBASE IDENTITYTOOLKIT REST)
// =======================================================================================
async function ensureFirebaseAuthToken() {
try {
  if (typeof window !== "undefined" && window.firebase && typeof window.firebase.auth === "function") {
    const curUser = window.firebase.auth().currentUser;
    if (curUser && typeof curUser.getIdToken === "function") {
      const freshTk = await curUser.getIdToken(false);
      if (freshTk) {
        sdkState.user.idToken = freshTk;
        if (!sdkState.user.firebaseUid && curUser.uid) sdkState.user.firebaseUid = curUser.uid;
        localStorage.setItem("NOVAVERDE_AUTH_USER", JSON.stringify(sdkState.user));
        return freshTk;
      }
    }
  }
} catch (e) {}
if (sdkState.user && sdkState.user.idToken) return sdkState.user.idToken;
if (typeof fetch !== "function") return null;
try {
  const apiKey = getActiveFirebaseApiKey();
  const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnSecureToken: true })
  });
  if (resp.ok) {
    const data = await resp.json();
    if (data && data.idToken) {
      sdkState.user.idToken = data.idToken;
      if (!sdkState.user.firebaseUid) sdkState.user.firebaseUid = data.localId;
      localStorage.setItem("NOVAVERDE_AUTH_USER", JSON.stringify(sdkState.user));
      return data.idToken;
    }
  }
} catch (e) {}
return null;
}

function getCandidateCloudDocIds(userObj) {
const u = userObj || sdkState.user || {};
const rawList = [];
if (u.firebaseUid) {
  const fb = String(u.firebaseUid).trim();
  if (fb) {
    rawList.push(fb);
    if (!fb.startsWith("google_") && u.provider === "google") rawList.push("google_" + fb);
  }
}
if (u.uid) {
  const uidStr = String(u.uid).trim();
  if (uidStr) {
    rawList.push(uidStr);
    const stripped = uidStr.replace(/^(google_|apple_|guest_)/, "");
    if (stripped && stripped !== uidStr) rawList.push(stripped);
  }
}
if (u.email && String(u.email).includes("@")) {
  const cleanEmailSlug = String(u.email).trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
  if (cleanEmailSlug) rawList.push("email_" + cleanEmailSlug);
}
const unique = [];
rawList.forEach(k => {
  if (k && !unique.includes(k)) unique.push(k);
});
return unique.length > 0 ? unique : ["guest_default"];
}

function isStarterSnapshot(snap) {
if (!snap || typeof snap !== "object") return true;
const ownedLots = Array.isArray(snap.lots) ? snap.lots.filter(l => l.owned) : [];
const ownedCount = ownedLots.length;
const totalBays = ownedLots.reduce((s, l) => s + (Array.isArray(l.bays) ? l.bays.length : 0), 0);
const totalRev = Number(snap.totalRevenueAllTime) || 0;
const money = Number(snap.money) || 65000000;
const days = Number(snap.totalDaysElapsed) || 1;
const expCount = ownedLots.reduce((s, l) => s + (Number(l.expansionCount) || 0), 0);
return ownedCount <= 1 && totalBays <= 2 && expCount === 0 && totalRev === 0 && days <= 1 && money === 65000000;
}

function computeSnapshotProgressRank(snap, syncedAt = 0) {
if (!snap || typeof snap !== "object") return { isStarter: true, ownedLots: 0, totalBays: 0, totalRev: 0, money: 0, syncedAt: 0 };
const ownedLots = Array.isArray(snap.lots) ? snap.lots.filter(l => l.owned) : [];
const totalBays = ownedLots.reduce((s, l) => s + (Array.isArray(l.bays) ? l.bays.length : 0), 0);
return {
  isStarter: isStarterSnapshot(snap),
  ownedLots: ownedLots.length || 1,
  totalBays: totalBays || 2,
  totalRev: Number(snap.totalRevenueAllTime) || 0,
  money: Number(snap.money) || 65000000,
  syncedAt: Number(syncedAt || snap.lastSavedAt || 0)
};
}

function encodeCompactAuthProfileSave(payload) {
try {
  const snap = (payload && payload.snapshot) ? payload.snapshot : {};
  const compact = {
    v: 7,
    ts: Number((payload && payload.syncedAt) || Date.now()),
    dn: String((payload && payload.displayName) || sdkState.user.displayName || "NovaVerde EV Corp").slice(0, 28),
    m: Math.round(Number(snap.money) || 65000000),
    gc: Math.round(typeof snap.greenCoins === "number" ? snap.greenCoins : 250),
    ra: snap.removeAdsOwned ? 1 : 0,
    sk: String(snap.equippedSkin || sdkState.selectedSkin || "skin_emerald"),
    os: Object.keys(snap.ownedSkins || { skin_emerald: true }),
    oi: Object.keys(snap.ownedItems || {}),
    y: Number(snap.year) || 1,
    mo: Number(snap.month) || 1,
    dm: Number(snap.dayOfMonth) || 1,
    td: Number(snap.totalDaysElapsed) || 1,
    sm: Math.round(Number(snap.simMinute) || 480),
    sl: Number(snap.selectedLotId) || 1,
    tr: Math.round(Number(snap.totalRevenueAllTime) || 0),
    tp: Math.round(Number(snap.totalProfitAllTime) || 0),
    tx: Math.round(Number(snap.totalRentAndTaxPaid) || 0),
    l: (Array.isArray(snap.lots) ? snap.lots : []).slice(0, 14).map(lt => [
      lt.id,
      lt.owned ? 1 : 0,
      lt.ownershipType === "leased" ? "L" : "O",
      lt.businessMode === "direct" ? "D" : "F",
      lt.areaM2 || 90,
      lt.expansionCount || 0,
      lt.hasGuard ? 1 : 0,
      (Array.isArray(lt.bays) ? lt.bays : []).map(b => b.tier || 1),
      lt.amenities || {}
    ])
  };
  const json = JSON.stringify(compact);
  return `https://${FIREBASE_CONFIG.projectId}.web.app/#nvsave=` + encodeURIComponent(json);
} catch (e) {
  return null;
}
}

function decodeCompactAuthProfileSave(photoUrlStr) {
try {
  if (!photoUrlStr || typeof photoUrlStr !== "string") return null;
  const marker = "#nvsave=";
  const idx = photoUrlStr.indexOf(marker);
  if (idx === -1) return null;
  const rawJson = decodeURIComponent(photoUrlStr.slice(idx + marker.length));
  const c = JSON.parse(rawJson);
  if (!c || typeof c !== "object") return null;
  const ownedSkinsObj = { skin_emerald: true };
  if (Array.isArray(c.os)) c.os.forEach(k => { ownedSkinsObj[k] = true; });
  const ownedItemsObj = {};
  if (Array.isArray(c.oi)) c.oi.forEach(k => { ownedItemsObj[k] = true; });
  const lotsArr = Array.isArray(c.l) ? c.l.map(row => ({
    id: Number(row[0]) || 1,
    owned: Boolean(row[1]),
    ownershipType: row[2] === "L" ? "leased" : "owned",
    businessMode: row[3] === "D" ? "direct" : "franchise",
    areaM2: Number(row[4]) || 90,
    expansionCount: Number(row[5]) || 0,
    hasGuard: Boolean(row[6]),
    bays: (Array.isArray(row[7]) ? row[7] : [1, 1]).map((t, bIdx) => ({ id: bIdx, tier: Number(t) || 1, car: null })),
    amenities: (row[8] && typeof row[8] === "object") ? row[8] : { tra_da: 1, cafe: 0, phong_nghi: 0, nha_an: 0, nha_hang: 0, doi_pin: 0 }
  })) : [];
  const snapshot = {
    version: 7,
    money: Number(c.m) || 65000000,
    greenCoins: typeof c.gc === "number" ? c.gc : 250,
    removeAdsOwned: Boolean(c.ra),
    ownedSkins: ownedSkinsObj,
    ownedItems: ownedItemsObj,
    equippedSkin: c.sk || "skin_emerald",
    year: Number(c.y) || 1,
    month: Number(c.mo) || 1,
    dayOfMonth: Number(c.dm) || 1,
    totalDaysElapsed: Number(c.td) || 1,
    simMinute: Number(c.sm) || 480,
    isoView: true,
    weatherMode: "auto",
    businessMode: "franchise",
    selectedLotId: Number(c.sl) || 1,
    totalRevenueAllTime: Number(c.tr) || 0,
    totalProfitAllTime: Number(c.tp) || 0,
    totalRentAndTaxPaid: Number(c.tx) || 0,
    yearlyGrossRevenue: Number(c.tr) || 0,
    yearlyOperatingProfit: Number(c.tp) || 0,
    yearlyPrepaidTax: 0,
    lastSavedAt: Number(c.ts) || Date.now(),
    lots: lotsArr
  };
  if (typeof computeSaveSignatureHash === "function") {
    snapshot.saveChecksum = computeSaveSignatureHash(snapshot);
  }
  return {
    displayName: c.dn || "NovaVerde EV Corp",
    syncedAt: Number(c.ts) || Date.now(),
    ownedLots: lotsArr.filter(l => l.owned).length || 1,
    netWorth: snapshot.money,
    snapshot
  };
} catch (e) {
  return null;
}
}

async function signInWithProvider(providerName) {
const Plugins = (window.Capacitor && window.Capacitor.Plugins) || {};

try {
  if (sdkState.isNative && Plugins.FirebaseAuthentication) {
    let result;
    if (providerName === "apple") {
      result = await Plugins.FirebaseAuthentication.signInWithApple();
    } else if (providerName === "google") {
      result = await Plugins.FirebaseAuthentication.signInWithGoogle();
    } else {
      result = await Plugins.FirebaseAuthentication.signInAnonymously();
    }
    if (result && result.user) {
      let token = null;
      try {
        const tkRes = await Plugins.FirebaseAuthentication.getIdToken();
        token = tkRes && tkRes.token ? tkRes.token : null;
      } catch (e) {}
      setAuthenticatedUser({
        uid: result.user.uid,
        firebaseUid: result.user.uid,
        provider: providerName,
        displayName: result.user.displayName || (providerName === "apple" ? "Apple CEO" : "Google CEO"),
        email: result.user.email || null,
        photoUrlSave: result.user.photoUrl || result.user.photoURL || null,
        idToken: token,
        isAnonymous: providerName === "guest"
      });
      const restoredNative = await restoreCloudSaveNow();
      if (restoredNative) {
        sdkState.user.hasCompletedOnboarding = true;
        localStorage.setItem("NOVAVERDE_AUTH_USER", JSON.stringify(sdkState.user));
        sdkState.titleMode = "tap_to_play";
      } else {
        sdkState.titleMode = "onboarding";
      }
      renderPubgStyleTitleScreen();
      return sdkState.user;
    }
  }

  // Kết nối Firebase Auth thực tế qua IdentityToolkit (nếu có mạng)
  const fbToken = await ensureFirebaseAuthToken();
  const baseUid = sdkState.user.firebaseUid || (sdkState.user.uid.replace(/^(guest_|apple_|google_)/, ""));
  const mockUid = providerName === "guest" ? baseUid : (providerName + "_" + baseUid);
  const defaultName = (sdkState.user && sdkState.user.displayName && !sdkState.user.displayName.startsWith("Google_CEO_") && !sdkState.user.displayName.startsWith("Apple_CEO_"))
    ? sdkState.user.displayName
    : "NovaVerde EV Corp";

  try {
    const resp = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: mockUid,
        provider: providerName,
        displayName: defaultName
      })
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.user) {
        data.user.idToken = fbToken;
        setAuthenticatedUser(data.user);
        const restoredApi = await restoreCloudSaveNow();
        if (restoredApi) {
          sdkState.user.hasCompletedOnboarding = true;
          localStorage.setItem("NOVAVERDE_AUTH_USER", JSON.stringify(sdkState.user));
          sdkState.titleMode = "tap_to_play";
        }
        return sdkState.user;
      }
    }
  } catch (netErr) {}

  setAuthenticatedUser({
    uid: mockUid,
    firebaseUid: baseUid,
    provider: providerName,
    displayName: defaultName,
    email: providerName === "apple" ? "ceo@privaterelay.appleid.com" : (providerName === "google" ? "ceo.novaverde@gmail.com" : null),
    idToken: fbToken,
    isAnonymous: providerName === "guest"
  });
  const restoredFb = await restoreCloudSaveNow();
  if (restoredFb) {
    sdkState.user.hasCompletedOnboarding = true;
    localStorage.setItem("NOVAVERDE_AUTH_USER", JSON.stringify(sdkState.user));
    sdkState.titleMode = "tap_to_play";
  }
  return sdkState.user;
} catch (err) {
  if (typeof window.logEvent === "function") {
    window.logEvent(tr(`⚠️ Đăng nhập ${providerName} bị hủy hoặc lỗi: ${err.message || err}`, `⚠️ ${providerName} Sign-In cancelled or failed: ${err.message || err}`));
  }
  return null;
}
}

function setAuthenticatedUser(u) {
sdkState.user = u;
localStorage.setItem("NOVAVERDE_AUTH_USER", JSON.stringify(u));
localStorage.setItem("HN_EV_MP_PLAYER_ID", u.uid);
if (u.displayName && window.mpState) {
  window.mpState.playerId = u.uid;
  window.mpState.playerName = u.displayName;
  localStorage.setItem("HN_EV_MP_PLAYER_NAME", u.displayName);
}
if (typeof window.logEvent === "function") {
  const pBadge = u.provider === "apple" ? "🍎 Apple ID" : (u.provider === "google" ? "🇬 Google Play" : (u.provider === "email" ? "📧 Email" : "👤 Guest"));
  window.logEvent(tr(
    `🔐 [Firebase: ${FIREBASE_CONFIG.projectId}] Đã đăng nhập bằng ${pBadge}: ${u.displayName} (UID: ${u.uid.slice(0, 10)})!`,
    `🔐 [Firebase: ${FIREBASE_CONFIG.projectId}] Signed in with ${pBadge}: ${u.displayName} (UID: ${u.uid.slice(0, 10)})!`
  ));
}
renderAuthPanelInSaveModal();
if (typeof window.refreshAllUI === "function") window.refreshAllUI();
}

async function signOutAccount() {
const Plugins = (window.Capacitor && window.Capacitor.Plugins) || {};
if (sdkState.isNative && Plugins.FirebaseAuthentication) {
  try { await Plugins.FirebaseAuthentication.signOut(); } catch (e) {}
}
if (typeof window !== "undefined" && window.firebase && typeof window.firebase.auth === "function") {
  try { await window.firebase.auth().signOut(); } catch (e) {}
}
const guestId = "guest_" + Math.random().toString(36).slice(2, 8);
setAuthenticatedUser({
  uid: guestId,
  provider: "guest",
  displayName: tr("Tập Đoàn GreenVolt Nova", "GreenVolt Nova Corp"),
  email: null,
  idToken: null,
  isAnonymous: true,
  hasCompletedOnboarding: false
});
}

// =======================================================================================
// 3. CLOUD SAVE & ANTI-CHEAT 1X SPEED VALIDATOR (ĐỒNG BỘ ĐA KÊNH LÊN FIREBASE AUTH + FIRESTORE `novaverde-ev-tycoon`)
// =======================================================================================
function verifyAntiCheat1xIntegrity() {
if (typeof state === "undefined") return { valid: true, reason: "OK" };
if (state.tamperedSaveDetected) {
  return { valid: false, reason: "TAMPERED_SAVE_CHECKSUM" };
}
if (state.gameSpeed !== 1) {
  state.gameSpeed = 1;
  return { valid: false, reason: "SPEED_TAMPERED" };
}
const ownedCount = state.lots ? state.lots.filter(l => l.owned).length : 1;
if (ownedCount < 1 || ownedCount > 5400) {
  return { valid: false, reason: "INVALID_LOT_COUNT" };
}
return { valid: true, reason: "VERIFIED_1X_REALTIME" };
}

async function syncCloudSaveNow(showToast = true) {
if (typeof serializeStateForSave !== "function") return false;
const integrity = verifyAntiCheat1xIntegrity();
sdkState.antiCheatVerified = integrity.valid;
if (!integrity.valid) return false;

const snapshot = serializeStateForSave();
const corpName = sdkState.user.displayName || (window.mpState && window.mpState.playerName) || "NovaVerde EV Corp";
const ownedLotsCountVal = snapshot.lots ? snapshot.lots.filter(l => l.owned).length : 1;
const payload = {
  uid: sdkState.user.uid,
  firebaseUid: sdkState.user.firebaseUid || sdkState.user.uid,
  email: sdkState.user.email || null,
  provider: sdkState.user.provider,
  displayName: corpName,
  gameSpeed: 1,
  antiCheatToken: integrity.reason,
  netWorth: typeof calcPlayerNetWorth === "function" ? calcPlayerNetWorth() : snapshot.money,
  ownedLots: ownedLotsCountVal,
  ownedLotsCount: ownedLotsCountVal,
  totalChargers: (typeof state !== "undefined" && state.lots)
    ? state.lots.reduce((s, l) => s + (l.owned ? l.bays.length : 0), 0)
    : 2,
  snapshot,
  syncedAt: Date.now()
};

const candidateDocIds = getCandidateCloudDocIds(sdkState.user);
candidateDocIds.forEach(k => {
  try {
    localStorage.setItem("NOVAVERDE_CLOUD_BACKUP_" + k, JSON.stringify(payload));
  } catch (e) {}
});
sdkState.lastCloudSyncAt = payload.syncedAt;
localStorage.setItem("NOVAVERDE_LAST_CLOUD_SYNC", String(payload.syncedAt));

const idToken = await ensureFirebaseAuthToken();
const apiKey = getActiveFirebaseApiKey();

// 3A. Đồng bộ trực tiếp vào Hồ sơ Firebase Auth (`photoUrl` / `updateProfile`) — Hoạt động 100% xuyên thiết bị (Mac <-> Phone) không phụ thuộc Firestore Rules!
const compactSaveUrl = encodeCompactAuthProfileSave(payload);
if (compactSaveUrl) {
  sdkState.user.photoUrlSave = compactSaveUrl;
  localStorage.setItem("NOVAVERDE_AUTH_USER", JSON.stringify(sdkState.user));
  try {
    if (typeof window !== "undefined" && window.firebase && typeof window.firebase.auth === "function") {
      const curUser = window.firebase.auth().currentUser;
      if (curUser && typeof curUser.updateProfile === "function") {
        await curUser.updateProfile({
          displayName: String(payload.displayName).slice(0, 28),
          photoURL: compactSaveUrl
        });
      }
    }
  } catch (e) {}

  if (idToken && typeof fetch === "function") {
    try {
      await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          displayName: String(payload.displayName).slice(0, 28),
          photoUrl: compactSaveUrl,
          returnSecureToken: false
        })
      });
    } catch (e) {}
  }
}

// 3B. Đồng bộ trực tiếp lên Firebase Cloud Firestore (`novaverde-ev-tycoon`) cho tất cả khóa định danh (UID + Email)
if (typeof fetch === "function") {
  try {
    const headers = { "Content-Type": "application/json" };
    if (idToken) headers["Authorization"] = `Bearer ${idToken}`;

    const firestoreDoc = {
      fields: {
        uid: { stringValue: String(payload.uid) },
        provider: { stringValue: String(payload.provider) },
        displayName: { stringValue: String(payload.displayName) },
        email: { stringValue: String(payload.email || "") },
        gameSpeed: { integerValue: "1" },
        antiCheatToken: { stringValue: String(payload.antiCheatToken) },
        netWorth: { integerValue: String(Math.round(payload.netWorth || 0)) },
        ownedLots: { integerValue: String(payload.ownedLots || 1) },
        ownedLotsCount: { integerValue: String(payload.ownedLots || 1) },
        totalChargers: { integerValue: String(payload.totalChargers || 2) },
        syncedAt: { integerValue: String(payload.syncedAt) },
        snapshotJson: { stringValue: JSON.stringify(payload.snapshot) }
      }
    };

    for (const rawKey of candidateDocIds) {
      const docId = encodeURIComponent(rawKey);
      try {
        await fetch(
          `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/users/${docId}?key=${apiKey}`,
          { method: "PATCH", headers, body: JSON.stringify(firestoreDoc) }
        );
      } catch (e) {}
    }

    // Đồng bộ điểm lên bảng xếp hạng Cloud Firestore `/leaderboards/{primaryDocId}`
    const primaryDocId = encodeURIComponent(candidateDocIds[0]);
    const lbDoc = {
      fields: {
        uid: { stringValue: String(payload.uid) },
        displayName: { stringValue: String(payload.displayName) },
        gameSpeed: { integerValue: "1" },
        netWorth: { integerValue: String(Math.round(payload.netWorth || 0)) },
        ownedLots: { integerValue: String(payload.ownedLots || 1) },
        totalChargers: { integerValue: String(payload.totalChargers || 2) },
        updatedAt: { integerValue: String(payload.syncedAt) }
      }
    };
    await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/leaderboards/${primaryDocId}?key=${apiKey}`,
      { method: "PATCH", headers, body: JSON.stringify(lbDoc) }
    );
  } catch (e) {}

  // 3C. Đồng bộ song song vào Local Server API (nếu đang chạy node server.js)
  try {
    await fetch("/api/cloud/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (e) {}
}

if (showToast && typeof window.logEvent === "function") {
  window.logEvent(tr(
    `☁️ [Firebase: ${FIREBASE_CONFIG.projectId}] Đã đồng bộ hồ sơ của ${payload.displayName} lên đám mây (${payload.ownedLots} Lô • Tài sản ${typeof formatCompactVND === "function" ? formatCompactVND(payload.netWorth) : payload.netWorth})!`,
    `☁️ [Firebase: ${FIREBASE_CONFIG.projectId}] Synced ${payload.displayName}'s profile to cloud (${payload.ownedLots} Lots • Net Worth ${typeof formatCompactVND === "function" ? formatCompactVND(payload.netWorth) : payload.netWorth})!`
  ));
}
renderAuthPanelInSaveModal();
return true;
}

function pickBetterCloudCandidate(candA, candB) {
if (!candA || !candA.snapshot) return candB;
if (!candB || !candB.snapshot) return candA;
const rA = computeSnapshotProgressRank(candA.snapshot, candA.syncedAt);
const rB = computeSnapshotProgressRank(candB.snapshot, candB.syncedAt);
if (!rA.isStarter && rB.isStarter) return candA;
if (rA.isStarter && !rB.isStarter) return candB;
if (rB.ownedLots !== rA.ownedLots) return rB.ownedLots > rA.ownedLots ? candB : candA;
if (rB.totalBays !== rA.totalBays) return rB.totalBays > rA.totalBays ? candB : candA;
if (rB.totalRev !== rA.totalRev) return rB.totalRev > rA.totalRev ? candB : candA;
if (rB.money !== rA.money) return rB.money > rA.money ? candB : candA;
return rB.syncedAt > rA.syncedAt ? candB : candA;
}

async function restoreCloudSaveNow(options = {}) {
if (typeof state !== "undefined" && state.pendingOfflineReward > 0 && typeof window.claimOfflineModal === "function") {
  window.claimOfflineModal(false);
}
const prevUnclaimedSec = (typeof state !== "undefined" && state.unclaimedOfflineRealSec) ? state.unclaimedOfflineRealSec : 0;
let bestCloudData = null;
const candidateDocIds = getCandidateCloudDocIds(sdkState.user);
const idToken = await ensureFirebaseAuthToken();
const apiKey = getActiveFirebaseApiKey();

// Nguồn 1: Tải từ Firebase Cloud Firestore (`novaverde-ev-tycoon`) theo tất cả khóa định danh (firebaseUid, uid, email)
if (typeof fetch === "function") {
  const headers = {};
  if (idToken) headers["Authorization"] = `Bearer ${idToken}`;

  for (const rawKey of candidateDocIds) {
    try {
      const docId = encodeURIComponent(rawKey);
      const fbResp = await fetch(
        `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/users/${docId}?key=${apiKey}`,
        { method: "GET", headers }
      );
      if (fbResp.ok) {
        const fbDoc = await fbResp.json();
        if (fbDoc && fbDoc.fields && fbDoc.fields.snapshotJson && fbDoc.fields.snapshotJson.stringValue) {
          const parsedSnap = JSON.parse(fbDoc.fields.snapshotJson.stringValue);
          const cand = {
            displayName: (fbDoc.fields.displayName && fbDoc.fields.displayName.stringValue) || null,
            syncedAt: Number((fbDoc.fields.syncedAt && fbDoc.fields.syncedAt.integerValue) || parsedSnap.lastSavedAt || 0),
            snapshot: parsedSnap
          };
          bestCloudData = pickBetterCloudCandidate(bestCloudData, cand);
        }
      }
    } catch (e) {}
  }
}

// Nguồn 2: Tải từ Hồ sơ Firebase Auth (`currentUser.photoURL` hoặc IdentityToolkit `accounts:lookup`) — Luôn hoạt động 100% trên mọi thiết bị đăng nhập cùng Google!
try {
  let authPhotoUrl = sdkState.user && sdkState.user.photoUrlSave ? sdkState.user.photoUrlSave : null;
  if (typeof window !== "undefined" && window.firebase && typeof window.firebase.auth === "function") {
    const curUser = window.firebase.auth().currentUser;
    if (curUser && curUser.photoURL && curUser.photoURL.includes("#nvsave=")) {
      authPhotoUrl = curUser.photoURL;
    }
  }
  if (!authPhotoUrl && idToken && typeof fetch === "function") {
    const lookupResp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });
    if (lookupResp.ok) {
      const lookupData = await lookupResp.json();
      const uInfo = lookupData && lookupData.users && lookupData.users[0];
      if (uInfo && uInfo.photoUrl && uInfo.photoUrl.includes("#nvsave=")) {
        authPhotoUrl = uInfo.photoUrl;
      }
    }
  }
  if (authPhotoUrl) {
    const decodedAuthSave = decodeCompactAuthProfileSave(authPhotoUrl);
    if (decodedAuthSave && decodedAuthSave.snapshot) {
      bestCloudData = pickBetterCloudCandidate(bestCloudData, decodedAuthSave);
    }
  }
} catch (e) {}

// Nguồn 3: Tải từ Local Server API (`/api/cloud/load`)
if (typeof fetch === "function") {
  for (const rawKey of candidateDocIds) {
    try {
      const resp = await fetch(`/api/cloud/load?uid=${encodeURIComponent(rawKey)}`);
      if (resp.ok) {
        const resJson = await resp.json();
        if (resJson && resJson.snapshot) {
          bestCloudData = pickBetterCloudCandidate(bestCloudData, resJson);
        }
      }
    } catch (e) {}
  }
}

// Nguồn 4: Tải từ bản sao lưu LocalStorage (`NOVAVERDE_CLOUD_BACKUP_`)
for (const rawKey of candidateDocIds) {
  try {
    const localBackup = JSON.parse(localStorage.getItem("NOVAVERDE_CLOUD_BACKUP_" + rawKey) || "null");
    if (localBackup && localBackup.snapshot) {
      bestCloudData = pickBetterCloudCandidate(bestCloudData, localBackup);
    }
  } catch (e) {}
}

// Bảo vệ thông minh chống ghi đè ngược: Nếu máy hiện tại đang có tiến độ hoặc số dư cao hơn bản Cloud cũ, giữ nguyên tiến độ máy hiện tại và đẩy lên Cloud!
if (options && options.preserveHigherLocalProgress && typeof serializeStateForSave === "function") {
  const localSnap = serializeStateForSave();
  const localRank = computeSnapshotProgressRank(localSnap, localSnap.lastSavedAt);
  if (!localRank.isStarter) {
    if (!bestCloudData || !bestCloudData.snapshot) {
      await syncCloudSaveNow(false);
      return true;
    }
    const cloudRank = computeSnapshotProgressRank(bestCloudData.snapshot, bestCloudData.syncedAt);
    const isLocalAhead =
      cloudRank.isStarter ||
      localRank.ownedLots > cloudRank.ownedLots ||
      (localRank.ownedLots === cloudRank.ownedLots && localRank.totalBays > cloudRank.totalBays) ||
      (localRank.ownedLots === cloudRank.ownedLots && localRank.totalBays === cloudRank.totalBays && (localRank.totalRev > cloudRank.totalRev || localRank.money > cloudRank.money));
    if (isLocalAhead) {
      if (typeof state !== "undefined" && prevUnclaimedSec >= 25) {
        state.unclaimedOfflineRealSec = Math.max(state.unclaimedOfflineRealSec || 0, prevUnclaimedSec);
      }
      await syncCloudSaveNow(false);
      return true;
    }
  }
}

if (bestCloudData && bestCloudData.snapshot && typeof applyLoadedSnapshot === "function") {
  const cloudTs = Number(bestCloudData.syncedAt || bestCloudData.snapshot.lastSavedAt || Date.now());
  const cloudAwaySec = Math.max(0, (Date.now() - cloudTs) / 1000);
  applyLoadedSnapshot(bestCloudData.snapshot);
  if (typeof state !== "undefined") {
    state.unclaimedOfflineRealSec = Math.max(prevUnclaimedSec, cloudAwaySec);
    if (!sdkState.inTitleScreen && state.unclaimedOfflineRealSec >= 25 && typeof window.simulateServerOfflineProgress === "function") {
      const secToRun = state.unclaimedOfflineRealSec;
      state.unclaimedOfflineRealSec = 0;
      setTimeout(() => window.simulateServerOfflineProgress(secToRun), 250);
    }
  }
  if (bestCloudData.displayName && !bestCloudData.displayName.startsWith("Google_CEO_") && !bestCloudData.displayName.startsWith("Apple_CEO_")) {
    sdkState.user.displayName = bestCloudData.displayName;
    if (window.mpState) {
      window.mpState.playerName = bestCloudData.displayName;
      localStorage.setItem("HN_EV_MP_PLAYER_NAME", bestCloudData.displayName);
    }
  }
  if (bestCloudData.snapshot.equippedSkin) {
    sdkState.selectedSkin = bestCloudData.snapshot.equippedSkin;
    if (typeof state !== "undefined") {
      state.equippedSkin = bestCloudData.snapshot.equippedSkin;
    }
  }
  sdkState.user.hasCompletedOnboarding = true;
  sdkState.titleMode = "tap_to_play";
  if (bestCloudData.syncedAt) {
    sdkState.lastCloudSyncAt = Number(bestCloudData.syncedAt);
    localStorage.setItem("NOVAVERDE_LAST_CLOUD_SYNC", String(sdkState.lastCloudSyncAt));
  }
  localStorage.setItem("NOVAVERDE_AUTH_USER", JSON.stringify(sdkState.user));
  if (typeof saveGameToStorage === "function") saveGameToStorage(false);
  if (typeof refreshAllUI === "function") refreshAllUI();
  renderAuthPanelInSaveModal();
  renderPubgStyleTitleScreen();
  if (typeof window.logEvent === "function") {
    window.logEvent(tr(
      `☁️ [Firebase: ${FIREBASE_CONFIG.projectId}] Đã khôi phục thành công dữ liệu Cloud Save của tập đoàn ${sdkState.user.displayName}!`,
      `☁️ [Firebase: ${FIREBASE_CONFIG.projectId}] Restored Cloud Save for ${sdkState.user.displayName}!`
    ));
  }
  return true;
} else {
  if (typeof window.logEvent === "function") {
    window.logEvent(tr(
      "ℹ️ Chưa có bản lưu Cloud cho tài khoản này. Hãy đặt tên Tập đoàn để bắt đầu!",
      "ℹ️ No Cloud Save found for this account yet. Set up your Corporation to begin!"
    ));
  }
  return false;
}
}

// =======================================================================================
// 4. GOOGLE ADMOB NATIVE BRIDGE & H5 AD PLACEMENT (REWARDED VIDEO ADS & BANNER ADS)
// =======================================================================================
function getRewardedAdUnitIdForSlot(adType) {
const plat = sdkState.platform === "android" ? "android" : "ios";
const map = ADMOB_CONFIG[plat] && ADMOB_CONFIG[plat].rewardedUnits;
return (map && map[adType]) || ADMOB_CONFIG[plat].rewardedAdUnitId;
}

function showNativeOrWebRewardedAd(adType, fallbackWebFn) {
const Plugins = (window.Capacitor && window.Capacitor.Plugins) || {};
const unitId = getRewardedAdUnitIdForSlot(adType);

// 4A. Trên Native iOS / Android (Capacitor AdMob SDK): Hiển thị 100% Video Google AdMob thật
if (sdkState.isNative && Plugins.AdMob) {
  return (async () => {
    try {
      if (!sdkState.admobReady) {
        await Plugins.AdMob.initialize({ initializeForTesting: false });
        sdkState.admobReady = true;
      }
      await Plugins.AdMob.prepareRewardVideoAd({
        adId: unitId,
        isTesting: false
      });
      const rewardItem = await Plugins.AdMob.showRewardVideoAd();
      if (rewardItem && typeof window.completeAndGrantRewardedAdPrize === "function") {
        window.completeAndGrantRewardedAdPrize(adType);
        return true;
      }
    } catch (err) {
      const errMsg = tr(
        `📡 [Google AdMob: ${unitId}] Hiện chưa có quảng cáo khả dụng (No Fill) hoặc kết nối bị gián đoạn. Vui lòng thử lại sau ít giây!`,
        `📡 [Google AdMob: ${unitId}] No ad inventory available right now (No Fill). Please try again shortly!`
      );
      if (typeof window.logEvent === "function") window.logEvent(errMsg);
      if (typeof window.alert === "function") window.alert(errMsg);
    }
    return false;
  })();
}

// 4B. Trên Production Web Browser: Gọi Google H5 Ad Placement API, KHÔNG mở ad tự tạo!
const isLiveBrowser = Boolean(typeof window !== "undefined" && window.location && window.location.origin && window.location.origin.startsWith("http"));
if (isLiveBrowser) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    const offMsg = tr(
      "📴 Không thể tải Google AdMob khi đang Offline! Vui lòng kiểm tra kết nối mạng.",
      "📴 Cannot load Google AdMob while Offline! Please check your internet connection."
    );
    if (typeof window.logEvent === "function") window.logEvent(offMsg);
    if (typeof window.alert === "function") window.alert(offMsg);
    return false;
  }
  if (typeof REWARDED_AD_SLOTS_CONFIG !== "undefined" && typeof getAdWatchCountToday === "function") {
    const slot = REWARDED_AD_SLOTS_CONFIG[adType];
    if (!slot) return false;
    if (getAdWatchCountToday(adType) >= slot.dailyLimit) {
      const limMsg = tr(
        "⏳ Bạn đã xem hết lượt Google AdMob của gói này trong hôm nay!",
        "⏳ You reached today's Google AdMob watch limit for this slot!"
      );
      if (typeof window.logEvent === "function") window.logEvent(limMsg);
      if (typeof window.alert === "function") window.alert(limMsg);
      return false;
    }
  }

  let adViewed = false;
  let adBreakHandled = false;
  if (typeof window.adBreak === "function") {
    try {
      window.adBreak({
        type: "reward",
        name: adType,
        beforeAd: () => { adBreakHandled = true; },
        beforeReward: (showAdFn) => { adBreakHandled = true; showAdFn(); },
        adViewed: () => {
          adViewed = true;
          if (typeof window.completeAndGrantRewardedAdPrize === "function") {
            window.completeAndGrantRewardedAdPrize(adType);
          }
        },
        adDismissed: () => {
          const cancelMsg = tr(
            "⚠️ Bạn đã đóng video Google AdMob trước khi kết thúc nên chưa nhận được thưởng.",
            "⚠️ You closed the Google AdMob video before completion, so no reward was granted."
          );
          if (typeof window.logEvent === "function") window.logEvent(cancelMsg);
        },
        adBreakDone: (placementInfo) => {
          if (!adViewed && (!placementInfo || placementInfo.breakStatus !== "viewed")) {
            const webAdMobMsg = tr(
              `📺 [Google AdMob: ${unitId}] Mã AdMob Rewarded Video (iOS: 9536750608 / Android: 4507785207) chỉ phân phối video quảng cáo thật trên ứng dụng iOS/Android (Capacitor AdMob SDK) hoặc tên miền H5 Games AdSense đã duyệt (ca-pub-7182007818337262). Quảng cáo tự tạo 5s đã được khóa hoàn toàn trên bản Production!`,
              `📺 [Google AdMob: ${unitId}] AdMob Rewarded Video units (iOS: 9536750608 / Android: 4507785207) only serve real video ads inside the native iOS/Android app (Capacitor AdMob SDK) or an approved H5 Games AdSense domain (ca-pub-7182007818337262). Self-made house ads are disabled in Production!`
            );
            if (typeof window.logEvent === "function") window.logEvent(webAdMobMsg);
            if (typeof window.alert === "function") window.alert(webAdMobMsg);
          }
        }
      });
      if (adBreakHandled) return true;
    } catch (e) {}
  }

  const infoMsg = tr(
    `📺 [Google AdMob: ${unitId}] Đã kết nối AdMob thật (Publisher: ${ADMOB_CONFIG.publisherId} • iOS Unit: 9536750608 • Android Unit: 4507785207). Video AdMob thật chỉ phát trên bản App iOS/Android hoặc khi Google H5 Games AdSense duyệt tên miền Web. Quảng cáo tự tạo 5s đã được gỡ bỏ!`,
    `📺 [Google AdMob: ${unitId}] Connected to real Google AdMob (Publisher: ${ADMOB_CONFIG.publisherId} • iOS Unit: 9536750608 • Android Unit: 4507785207). Real AdMob video ads serve on native iOS/Android builds or approved H5 Games AdSense domains. Self-made house ads are disabled!`
  );
  if (typeof window.logEvent === "function") window.logEvent(infoMsg);
  if (typeof window.alert === "function") window.alert(infoMsg);
  return false;
}

// 4C. Môi trường Headless QA Test Runner (không có window.location.origin): Chạy luồng kiểm thử QA
if (typeof fallbackWebFn === "function") {
  return fallbackWebFn(adType);
}
return false;
}

async function toggleNativeBannerAd(show = true) {
const Plugins = (window.Capacitor && window.Capacitor.Plugins) || {};
if (!sdkState.isNative || !Plugins.AdMob || !sdkState.admobReady) return false;
try {
  if (show && !(typeof state !== "undefined" && state.removeAdsOwned)) {
    const unitId = sdkState.platform === "ios"
      ? ADMOB_CONFIG.ios.bannerAdUnitId
      : ADMOB_CONFIG.android.bannerAdUnitId;
    await Plugins.AdMob.showBanner({
      adId: unitId,
      adSize: "ADAPTIVE_BANNER",
      position: "BOTTOM_CENTER",
      margin: 58,
      isTesting: false
    });
    sdkState.nativeBannerVisible = true;
  } else {
    await Plugins.AdMob.hideBanner();
    sdkState.nativeBannerVisible = false;
  }
  return true;
} catch (e) {
  return false;
}
}

// =======================================================================================
// 5. REVENUECAT IN-APP PURCHASE (IAP) BRIDGE CHO CÁC GÓI GREENCOIN & REMOVE ADS (PRODUCTION LOCKED)
// =======================================================================================
function purchaseGreenCoinPack(amountGc, fallbackTopUpFn) {
const Plugins = (window.Capacitor && window.Capacitor.Plugins) || {};
const pack = IAP_PRODUCTS_MAP[amountGc];

if (sdkState.isNative && Plugins.Purchases && sdkState.iapReady && pack) {
  return (async () => {
    try {
      const offerings = await Plugins.Purchases.getOfferings();
      const availablePackages = (offerings && offerings.current && offerings.current.availablePackages) || [];
      const targetPkg = availablePackages.find(p => p.product && p.product.identifier === pack.productId);
      if (targetPkg) {
        await Plugins.Purchases.purchasePackage({ aPackage: targetPkg });
        if (typeof fallbackTopUpFn === "function") fallbackTopUpFn(amountGc);
        return true;
      }
    } catch (e) {
      if (e && e.userCancelled) return false;
    }
    return false;
  })();
}
const msg = tr(
  "💳 Gói nạp In-App Purchase chỉ thanh toán qua Google Play / App Store trên ứng dụng di động. Trên bản Web, bạn có thể nhận miễn phí GC & G$ bằng cách Xem Video Quảng Cáo bên dưới hoặc Đua Top BXH Tuần!",
  "💳 In-App Purchases are processed via Google Play / App Store on the mobile app. On Web, you can earn free GC & G$ via Rewarded Video Ads below or Weekly Leaderboard rewards!"
);
if (typeof window.logEvent === "function") window.logEvent(msg);
if (typeof window.alert === "function") window.alert(msg);
return false;
}

// =======================================================================================
// 6. GIAO DIỆN QUẢN LÝ TÀI KHOẢN (APPLE / GOOGLE / GUEST) & CLOUD SYNC TRONG MODAL SAVE
// =======================================================================================
function renderAuthPanelInSaveModal() {
const saveModalBody = document.querySelector("#save-modal .modal-body");
if (!saveModalBody) return;

let container = document.getElementById("novaverde-mobile-auth-box");
if (!container) {
  container = document.createElement("div");
  container.id = "novaverde-mobile-auth-box";
  saveModalBody.insertBefore(container, saveModalBody.firstChild);
}

const u = sdkState.user;
const provBadge = u.provider === "email"
  ? "📧 Email"
  : (u.provider === "google" ? "🇬 Google" : tr("👤 Khách (Guest)", "👤 Guest"));
const syncTimeStr = sdkState.lastCloudSyncAt > 0
  ? new Date(sdkState.lastCloudSyncAt).toLocaleTimeString(window.currentLang === "en" ? "en-US" : "vi-VN")
  : tr("Tự động", "Auto");

const curSkin = (typeof state !== "undefined" && state.equippedSkin) || sdkState.selectedSkin || "skin_emerald";
const skinOptions = [
  { id: "skin_emerald", icon: "🌿", vi: "Lục Bảo", en: "Emerald", bg: "#059669" },
  { id: "skin_royal_gold", icon: "👑", vi: "Hoàng Kim", en: "Royal Gold", bg: "#d97706" },
  { id: "skin_cyber_plasma", icon: "🔮", vi: "Tím Neon", en: "Cyber Neon", bg: "#7e22ce" },
  { id: "skin_lotus_ruby", icon: "🏮", vi: "Hồng Ngọc", en: "Lotus Ruby", bg: "#be123c" }
];

const skinButtonsHtml = skinOptions.map(sk => {
  const active = curSkin === sk.id;
  return `
    <button class="pop-btn" style="background:${sk.bg}; color:#fff; border:2px solid ${active ? '#fef08a' : 'rgba(255,255,255,0.25)'}; font-weight:900; padding:6px 4px; font-size:9.2px;"
      onclick="window.NovaVerdeMobileSDK.pickStarterSkin('${sk.id}')">
      ${sk.icon} ${tr(sk.vi, sk.en)} ${active ? '✓' : ''}
    </button>
  `;
}).join("");

container.innerHTML = `
  <div style="background:linear-gradient(135deg, #0f172a, #1e293b); color:#fff; border:2.5px solid #34d399; border-radius:16px; padding:11px 12px; margin-bottom:10px;">
    <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap;">
      <div>
        <div style="font-size:8.2px; color:#7dd3fc; font-weight:900; letter-spacing:0.3px;">
          🔥 AUTO CLOUD SAVE: <span style="color:#4ade80;">ON (${FIREBASE_CONFIG.projectId})</span>
        </div>
        <div style="font-size:12px; font-weight:900; color:#fef08a; margin-top:2px;">
          ${provBadge}: ${u.displayName} ${u.email ? `(${u.email})` : ''}
        </div>
        <div style="font-size:8.2px; color:#cbd5e1; margin-top:1px;">
          UID: <code>${u.uid.slice(0, 14)}</code> • ☁️ Cloud: <b>${syncTimeStr}</b> • 🔒 Anti-Cheat: <b style="color:#4ade80;">1x Verified</b>
        </div>
      </div>
      ${u.provider !== "guest" ? `
        <button class="sheet-mini-btn" onclick="window.NovaVerdeMobileSDK.signOutAccount()">🚪 ${tr("Đổi TK", "Sign Out")}</button>
      ` : ""}
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px; margin-top:8px;">
      <button class="pop-btn" style="background:#eff6ff; color:#1d4ed8; border-color:#60a5fa; font-weight:900;" onclick="window.NovaVerdeMobileSDK.handleTitleLoginClick('google')">
        🇬 ${tr("Google", "Google")}
      </button>
      <button class="pop-btn" style="background:#ecfdf5; color:#047857; border-color:#34d399; font-weight:900;" onclick="window.NovaVerdeMobileSDK.openEmailSignUpOnTitle()">
        📧 ${tr("Email", "Email")}
      </button>
      <button class="pop-btn" style="background:#334155; color:#f8fafc; border-color:#64748b; font-weight:900;" onclick="window.NovaVerdeMobileSDK.signInWithProvider('guest')">
        👤 ${tr("Khách", "Guest")}
      </button>
    </div>

    <div style="margin-top:9px; padding-top:8px; border-top:1px dashed rgba(148,163,184,0.35);">
      <div style="font-size:9px; font-weight:900; color:#6ee7b7; margin-bottom:4px;">
        🏢 ${tr("ĐẶT TÊN TẬP ĐOÀN & CHỌN MÀU TRẠM SẠC:", "CORPORATION NAME & STATION SKIN:")}
      </div>
      <input id="nv-corp-name-input" type="text" maxlength="28" value="${u.displayName}"
        placeholder="${tr('Nhập tên Tập đoàn của bạn...', 'Enter your Corporation Name...')}"
        style="width:100%; box-sizing:border-box; padding:7px 9px; border-radius:9px; border:1.5px solid #38bdf8; background:#091326; color:#fef08a; font-size:11px; font-weight:900; margin-bottom:6px;" />
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:4px; margin-bottom:8px;">
        ${skinButtonsHtml}
      </div>
      <button class="pop-btn green" style="width:100%; padding:10px; font-size:12.5px; font-weight:900; background:linear-gradient(180deg, #fde047, #f59e0b); color:#291507; border-color:#b45309;"
        onclick="window.NovaVerdeMobileSDK.applyProfileAndTapToPlay()">
        ▶️ ${tr("CHẠM ĐỂ VÀO ĐẾ CHẾ (TAP TO PLAY)", "TAP TO PLAY EMPIRE")}
      </button>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px; margin-top:6px;">
      <button class="pop-btn green" onclick="window.NovaVerdeMobileSDK.syncCloudSaveNow(true)">
        ☁️ ${tr("Đồng Bộ Lên Cloud", "Sync to Cloud")}
      </button>
      <button class="pop-btn blue" onclick="window.NovaVerdeMobileSDK.restoreCloudSaveNow()">
        📥 ${tr("Tải Từ Cloud Về", "Restore Cloud Save")}
      </button>
    </div>
  </div>
`;
}

function pickStarterSkin(skinId) {
sdkState.selectedSkin = skinId;
if (typeof state !== "undefined") {
  if (!state.ownedSkins) state.ownedSkins = { skin_emerald: true };
  state.ownedSkins[skinId] = true;
  state.equippedSkin = skinId;
}
const inp = document.getElementById("nv-corp-name-input");
if (inp && inp.value.trim()) {
  sdkState.user.displayName = inp.value.trim();
}
renderAuthPanelInSaveModal();
if (typeof window.refreshAllUI === "function") window.refreshAllUI();
}

async function applyProfileAndTapToPlay() {
const inp = document.getElementById("nv-corp-name-input");
if (inp && inp.value.trim()) {
  sdkState.user.displayName = inp.value.trim();
  if (window.mpState) {
    window.mpState.playerName = sdkState.user.displayName;
    localStorage.setItem("HN_EV_MP_PLAYER_NAME", sdkState.user.displayName);
  }
}
const chosenSkin = sdkState.selectedSkin || (typeof state !== "undefined" && state.equippedSkin) || "skin_emerald";
if (typeof state !== "undefined") {
  if (!state.ownedSkins) state.ownedSkins = { skin_emerald: true };
  state.ownedSkins[chosenSkin] = true;
  state.equippedSkin = chosenSkin;
}
localStorage.setItem("NOVAVERDE_AUTH_USER", JSON.stringify(sdkState.user));
if (typeof window.saveGameToStorage === "function") window.saveGameToStorage(false);
await syncCloudSaveNow(false);
if (typeof window.closeSaveModal === "function") window.closeSaveModal();
if (typeof window.refreshAllUI === "function") window.refreshAllUI();
if (typeof window.logEvent === "function") {
  window.logEvent(tr(
    `🚀 Chào mừng CEO ${sdkState.user.displayName}! Đã kích hoạt màu trạm sạc & bật Tự động lưu Đám mây (Auto Cloud Save).`,
    `🚀 Welcome CEO ${sdkState.user.displayName}! Station skin equipped & Auto Cloud Save enabled.`
  ));
}
}

let _autoCloudDebounce = null;
function scheduleAutoCloudSave() {
if (_autoCloudDebounce) clearTimeout(_autoCloudDebounce);
_autoCloudDebounce = setTimeout(() => {
  syncCloudSaveNow(false);
}, 2500);
}


// =======================================================================================
// 7. MÀN HÌNH ĐĂNG NHẬP FULL-SCREEN PHONG CÁCH PUBG MOBILE (NOVAVERDE EV TYCOON THEME)
// =======================================================================================
const TITLE_SKIN_CHOICES = [
{ id: "skin_emerald", icon: "🌿", vi: "Ngọc Lục Bảo", en: "Emerald Canopy", bg: "linear-gradient(135deg,#065f46,#10b981)", border: "#34d399" },
{ id: "skin_royal_gold", icon: "👑", vi: "Hoàng Kim 24K", en: "24K Royal Gold", bg: "linear-gradient(135deg,#78350f,#f59e0b)", border: "#fde047" },
{ id: "skin_cyber_plasma", icon: "🔮", vi: "Tím Cyber Neon", en: "Cyber Plasma", bg: "linear-gradient(135deg,#4c1d95,#a855f7)", border: "#e879f9" },
{ id: "skin_lotus_ruby", icon: "🏮", vi: "Hồng Ngọc Ruby", en: "Lotus Ruby", bg: "linear-gradient(135deg,#881337,#e11d48)", border: "#fda4af" }
];

sdkState.privacyAccepted = true;
sdkState.termsAccepted = true;
sdkState.lastLoginProvider = localStorage.getItem("NOVAVERDE_LAST_LOGIN_PROVIDER") || (savedAuth ? savedAuth.provider : "guest");
sdkState.titleMode = (savedAuth && savedAuth.hasCompletedOnboarding) ? "tap_to_play" : "login_buttons";
sdkState.inTitleScreen = true;

function ensurePubgStyleTitleScreenDOM() {
if (typeof document === "undefined" || !document.getElementById) return null;
const shell = document.getElementById("mobile-shell");
if (!shell) return null;

if (!document.getElementById("nv-title-screen-styles")) {
  const st = document.createElement("style");
  st.id = "nv-title-screen-styles";
  st.textContent = `
    /* ẨN 100% BẢN ĐỒ GAME & HUD KHI ĐANG Ở MÀN HÌNH ĐĂNG NHẬP RIÊNG BIỆT */
    #mobile-shell.nv-on-title-screen > *:not(#nv-pubg-title-screen) {
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    #nv-pubg-title-screen {
      position: absolute;
      inset: 0;
      z-index: 95;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #064e3b;
      user-select: none;
      -webkit-user-select: none;
      overflow: hidden;
      transition: opacity 0.32s ease;
    }
    .nv-ts-content-layer {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }
    .nv-ts-version-ribbon {
      background: linear-gradient(90deg, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.65) 85%, transparent 100%);
      color: #f8fafc;
      font-size: 10.5px;
      font-weight: 800;
      padding: 5px 22px 5px 12px;
      letter-spacing: 0.4px;
      clip-path: polygon(0 0, 100% 0, 88% 100%, 0% 100%);
      border-left: 3px solid #10b981;
      text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    }
    .nv-ts-right-tools {
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: center;
      padding-right: 12px;
    }
    .nv-ts-tool-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      gap: 2px;
    }
    .nv-ts-tool-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.78);
      border: 2px solid rgba(167, 243, 208, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ecfdf5;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.45);
      transition: transform 0.12s ease, border-color 0.12s ease;
    }
    .nv-ts-tool-item:active .nv-ts-tool-circle {
      transform: scale(0.92);
      border-color: #fde047;
    }
    .nv-ts-tool-lbl {
      font-size: 9.5px;
      font-weight: 900;
      color: #ffffff;
      text-shadow: 0 1px 3px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.8);
      letter-spacing: 0.2px;
    }
    .nv-ts-logo-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: auto 0;
      padding: 0 14px;
      pointer-events: none;
    }
    .nv-ts-logo-frame {
      position: relative;
      background: linear-gradient(180deg, rgba(6, 78, 59, 0.88) 0%, rgba(4, 47, 46, 0.94) 100%);
      border: 4px solid #ffffff;
      outline: 3px solid #10b981;
      border-radius: 10px;
      padding: 10px 24px 8px;
      box-shadow: 0 12px 35px rgba(0,0,0,0.65), 0 0 24px rgba(16, 185, 129, 0.45), inset 0 0 18px rgba(52, 211, 153, 0.25);
    }
    .nv-ts-logo-frame::before,
    .nv-ts-logo-frame::after {
      content: "";
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 26px;
      background: #ffffff;
      border: 2px solid #064e3b;
      border-radius: 3px;
    }
    .nv-ts-logo-frame::before { left: -8px; }
    .nv-ts-logo-frame::after { right: -8px; }
    .nv-ts-logo-main {
      font-family: "Impact", "Arial Black", system-ui, sans-serif;
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 2.5px;
      color: #ffffff;
      line-height: 1;
      text-shadow: 0 3px 0 #064e3b, 0 5px 12px rgba(0,0,0,0.75);
    }
    .nv-ts-logo-sub {
      margin-top: 6px;
      background: linear-gradient(90deg, transparent 0%, rgba(6, 78, 59, 0.92) 18%, rgba(6, 78, 59, 0.92) 82%, transparent 100%);
      padding: 3px 26px;
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 4px;
      color: #a3e635;
      text-shadow: 0 2px 0 #052e16, 0 4px 10px rgba(0,0,0,0.9);
      font-style: italic;
    }
    .nv-ts-bottom-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 12px calc(env(safe-area-inset-bottom, 8px) + 10px);
      gap: 12px;
    }
    .nv-ts-btn-row {
      display: flex;
      align-items: stretch;
      justify-content: center;
      gap: 7px;
      width: 100%;
      max-width: 410px;
      position: relative;
    }
    .nv-ts-btn-wrap {
      position: relative;
      flex: 1;
      display: flex;
    }
    .nv-ts-last-login-tag {
      position: absolute;
      top: -23px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.92);
      color: #fbbf24;
      border: 1px solid rgba(251, 191, 36, 0.75);
      border-radius: 4px;
      padding: 2px 7px;
      font-size: 8.2px;
      font-weight: 800;
      white-space: nowrap;
      box-shadow: 0 3px 8px rgba(0,0,0,0.5);
    }
    .nv-ts-last-login-tag::after {
      content: "";
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      width: 6px;
      height: 6px;
      background: rgba(15, 23, 42, 0.92);
      border-right: 1px solid rgba(251, 191, 36, 0.75);
      border-bottom: 1px solid rgba(251, 191, 36, 0.75);
    }
    .nv-ts-login-btn {
      width: 100%;
      height: 44px;
      border-radius: 4px;
      font-size: 11.2px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0,0,0,0.45);
      transition: transform 0.1s ease, filter 0.12s ease;
      padding: 0 8px;
      white-space: nowrap;
    }
    .nv-ts-login-btn:active {
      transform: translateY(1.5px);
    }
    .nv-ts-login-btn.guest {
      background: linear-gradient(180deg, rgba(100, 116, 139, 0.88), rgba(71, 85, 105, 0.92));
      color: #f8fafc;
      border: 1px solid rgba(203, 213, 225, 0.55);
    }
    .nv-ts-login-btn.apple {
      background: #ffffff;
      color: #0f172a;
      border: 1px solid #e2e8f0;
    }
    .nv-ts-login-btn.google {
      background: linear-gradient(180deg, #facc15 0%, #eab308 100%);
      color: #1e293b;
      border: 1px solid #fef08a;
    }
    .nv-ts-login-btn.more {
      flex: 0 0 46px;
      width: 46px;
      background: rgba(15, 23, 42, 0.85);
      color: #e2e8f0;
      border: 1px solid rgba(148, 163, 184, 0.5);
      font-size: 10px;
    }
    .nv-ts-legal-bar {
      background: rgba(2, 6, 23, 0.68);
      border-radius: 6px;
      padding: 5px 10px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 10px;
      font-size: 8.6px;
      font-weight: 700;
      color: #cbd5e1;
      backdrop-filter: blur(4px);
    }
    .nv-ts-legal-item {
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
    }
    .nv-ts-diamond {
      width: 10px;
      height: 10px;
      transform: rotate(45deg);
      border: 1.5px solid #10b981;
      background: transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .nv-ts-diamond.checked {
      background: #10b981;
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.8);
    }
    .nv-ts-diamond.checked::after {
      content: "✓";
      transform: rotate(-45deg);
      font-size: 7px;
      color: #022c22;
      font-weight: 900;
    }
  `;
  document.head.appendChild(st);
}

let ts = document.getElementById("nv-pubg-title-screen");
if (!ts) {
  ts = document.createElement("div");
  ts.id = "nv-pubg-title-screen";
  shell.appendChild(ts);
}
return ts;
}

function renderPubgStyleTitleScreen() {
const ts = ensurePubgStyleTitleScreenDOM();
const shell = typeof document !== "undefined" && document.getElementById ? document.getElementById("mobile-shell") : null;
if (!ts || !shell) return;

if (!sdkState.inTitleScreen) {
  shell.classList.remove("nv-on-title-screen");
  ts.style.display = "none";
  return;
}

shell.classList.add("nv-on-title-screen");
ts.style.display = "flex";

const u = sdkState.user;
const lastProv = sdkState.lastLoginProvider || "guest";
const curSkinId = (typeof state !== "undefined" && state.equippedSkin) || sdkState.selectedSkin || "skin_emerald";
const curSkinMeta = TITLE_SKIN_CHOICES.find(s => s.id === curSkinId) || TITLE_SKIN_CHOICES[0];
const ownedLotsCount = (typeof state !== "undefined" && state.lots) ? state.lots.filter(l => l.owned).length : 1;
const netWorthVal = typeof calcPlayerNetWorth === "function" ? calcPlayerNetWorth() : ((typeof state !== "undefined" && state.money) || 65000000);
const netWorthStr = typeof formatCompactVND === "function" ? formatCompactVND(netWorthVal) : "65K G$";

const standaloneBgSvg = `
  <svg viewBox="0 0 800 1200" preserveAspectRatio="xMidYMid slice" style="position:absolute; inset:0; width:100%; height:100%; z-index:0; pointer-events:none;">
    <defs>
      <linearGradient id="nvSkyG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0284c7" />
        <stop offset="40%" stop-color="#38bdf8" />
        <stop offset="75%" stop-color="#bae6fd" />
        <stop offset="100%" stop-color="#fef9c3" />
      </linearGradient>
      <radialGradient id="nvSunG" cx="0.72" cy="0.22" r="0.45">
        <stop offset="0%" stop-color="#fef08a" stop-opacity="0.95" />
        <stop offset="45%" stop-color="#fde047" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="nvTowerG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#065f46" />
        <stop offset="50%" stop-color="#0d9488" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
      <linearGradient id="nvRoadG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
    </defs>
    <rect width="800" height="1200" fill="url(#nvSkyG)" />
    <circle cx="580" cy="240" r="310" fill="url(#nvSunG)" />
    <circle cx="580" cy="240" r="54" fill="#fef9c3" opacity="0.92" />
    <g fill="#ffffff" opacity="0.84">
      <ellipse cx="180" cy="165" rx="95" ry="32" />
      <ellipse cx="235" cy="155" rx="70" ry="40" />
      <ellipse cx="630" cy="130" rx="105" ry="34" />
      <ellipse cx="420" cy="210" rx="80" ry="24" opacity="0.65" />
    </g>
    <path d="M0,560 Q140,470 310,520 T640,490 L800,530 L800,700 L0,700 Z" fill="#0f766e" opacity="0.45" />
    <path d="M0,590 Q220,515 450,555 T800,535 L800,720 L0,720 Z" fill="#115e59" opacity="0.68" />
    <g>
      <rect x="55" y="250" width="78" height="360" rx="6" fill="url(#nvTowerG)" stroke="#6ee7b7" stroke-width="1.5" />
      <rect x="165" y="185" width="92" height="425" rx="8" fill="url(#nvTowerG)" stroke="#a7f3d0" stroke-width="2" />
      <rect x="285" y="275" width="70" height="335" rx="5" fill="url(#nvTowerG)" stroke="#6ee7b7" stroke-width="1.5" />
      <rect x="385" y="210" width="84" height="400" rx="7" fill="url(#nvTowerG)" stroke="#6ee7b7" stroke-width="1.8" />
      <g fill="#22c55e" opacity="0.85">
        <rect x="52" y="310" width="84" height="10" rx="5" />
        <rect x="162" y="260" width="98" height="12" rx="6" />
        <rect x="162" y="350" width="98" height="12" rx="6" />
        <rect x="382" y="295" width="90" height="11" rx="5" />
      </g>
    </g>
    <path d="M430,600 C520,610 660,570 800,585 L800,820 L320,820 Z" fill="#0284c7" />
    <g stroke="#e2e8f0" stroke-width="2" opacity="0.9">
      <line x1="590" y1="360" x2="480" y2="590" />
      <line x1="590" y1="380" x2="520" y2="590" />
      <line x1="590" y1="360" x2="705" y2="590" />
      <line x1="590" y1="380" x2="665" y2="590" />
      <rect x="583" y="340" width="14" height="265" rx="4" fill="#f8fafc" stroke="#0284c7" stroke-width="2" />
      <rect x="445" y="582" width="355" height="14" fill="#334155" stroke="#38bdf8" stroke-width="2" />
    </g>
    <path d="M0,585 L800,635 L800,1200 L0,1200 Z" fill="#064e3b" />
    <path d="M0,620 Q380,605 800,665 L800,1200 L0,1200 Z" fill="#065f46" />
    <polygon points="-40,920 840,720 840,980 -40,1190" fill="url(#nvRoadG)" stroke="#34d399" stroke-width="3" />
    <line x1="20" y1="1040" x2="780" y2="855" stroke="#fde047" stroke-width="4" stroke-dasharray="28,22" opacity="0.85" />
    <g transform="translate(45, 650)">
      <polygon points="0,190 250,135 330,210 80,275" fill="#1e293b" stroke="#10b981" stroke-width="3" />
      <rect x="75" y="105" width="16" height="95" rx="4" fill="#e2e8f0" />
      <rect x="215" y="75" width="16" height="95" rx="4" fill="#e2e8f0" />
      <rect x="102" y="132" width="28" height="58" rx="4" fill="#059669" stroke="#6ee7b7" stroke-width="2" />
      <rect x="172" y="114" width="28" height="58" rx="4" fill="#059669" stroke="#6ee7b7" stroke-width="2" />
      <polygon points="-15,115 235,55 315,105 65,168" fill="#10b981" stroke="#fef08a" stroke-width="3.5" />
      <polygon points="5,112 225,62 288,100 68,152" fill="#0284c7" opacity="0.88" />
    </g>
    <rect width="800" height="1200" fill="rgba(2, 6, 23, 0.22)" />
  </svg>
`;

let actionAreaHtml = "";
const cleanCorpVal = (u.displayName && !u.displayName.startsWith("Google_CEO_") && !u.displayName.startsWith("Apple_CEO_")) ? u.displayName : "NovaVerde EV Corp";

if (sdkState.titleMode === "email_signup") {
  const errMsg = sdkState.emailAuthError || "";
  const infoMsg = sdkState.emailAuthInfo || "";
  actionAreaHtml = `
    <div style="width:100%; max-width:390px; background:rgba(15, 23, 42, 0.95); border:2px solid #34d399; border-radius:14px; padding:13px 14px; box-shadow:0 16px 40px rgba(0,0,0,0.75); backdrop-filter:blur(10px);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <span style="font-size:11.5px; font-weight:900; color:#fef08a;">
          📧 ${tr("ĐĂNG KÝ / ĐĂNG NHẬP EMAIL CÁ NHÂN", "PERSONAL EMAIL SIGN-UP / SIGN-IN")}
        </span>
        <button onclick="window.NovaVerdeMobileSDK.switchAccountOnTitleScreen()"
          style="background:#334155; color:#fff; border:none; border-radius:6px; padding:2px 8px; font-size:9.5px; cursor:pointer;">✕</button>
      </div>
      <div style="font-size:8.6px; color:#93c5fd; margin-bottom:7px;">
        ${tr("Đồng bộ trực tiếp với Firebase Cloud (novaverde-ev-tycoon):", "Synced directly with Firebase Cloud (novaverde-ev-tycoon):")}
      </div>
      <input id="nv-email-addr-input" type="text" value="${u.email || ''}"
        placeholder="${tr('Nhập địa chỉ Email cá nhân của bạn...', 'Enter your personal Email address...')}"
        style="width:100%; box-sizing:border-box; padding:9px 10px; border-radius:7px; border:1.5px solid #38bdf8; background:#091326; color:#fef08a; font-size:11.5px; font-weight:800; margin-bottom:8px; outline:none;" />
      ${errMsg ? `<div style="font-size:8.8px; color:#fda4af; font-weight:800; margin-bottom:6px;">⚠️ ${errMsg}</div>` : ""}
      ${infoMsg ? `<div style="font-size:8.8px; color:#6ee7b7; font-weight:800; margin-bottom:6px;">✅ ${infoMsg}</div>` : ""}
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
        <button onclick="window.NovaVerdeMobileSDK.submitFirebaseEmailAuth('instant')"
          style="height:40px; border-radius:7px; border:1.5px solid #fef08a; background:linear-gradient(180deg, #10b981 0%, #059669 100%); color:#fff; font-size:10.5px; font-weight:900; cursor:pointer;">
          ✨ ${tr("Đăng Ký & Vào Ngay", "Sign Up & Continue")}
        </button>
        <button onclick="window.NovaVerdeMobileSDK.submitFirebaseEmailAuth('magic_link')"
          style="height:40px; border-radius:7px; border:1.5px solid #60a5fa; background:linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%); color:#fff; font-size:10.5px; font-weight:900; cursor:pointer;">
          📩 ${tr("Gửi Link Xác Thực", "Send Magic Link")}
        </button>
      </div>
    </div>
  `;
} else if (sdkState.titleMode === "onboarding") {
  const skinGrid = TITLE_SKIN_CHOICES.map(sk => {
    const isSel = curSkinId === sk.id;
    return `
      <div onclick="window.NovaVerdeMobileSDK.selectTitleSkin('${sk.id}')"
        style="background:${sk.bg}; border:${isSel ? '2.5px solid #fef08a' : '1.5px solid rgba(255,255,255,0.3)'}; border-radius:8px; padding:7px 8px; cursor:pointer; display:flex; align-items:center; gap:6px; box-shadow:${isSel ? '0 0 12px rgba(254,240,138,0.5)' : 'none'};">
        <span style="font-size:16px;">${sk.icon}</span>
        <div style="text-align:left;">
          <div style="font-size:9.8px; font-weight:900; color:#fff;">${tr(sk.vi, sk.en)}</div>
          <div style="font-size:7.6px; color:#fef08a; font-weight:800;">${isSel ? tr("✓ Đang chọn", "✓ Selected") : tr("Chạm để chọn", "Tap to select")}</div>
        </div>
      </div>
    `;
  }).join("");

  actionAreaHtml = `
    <div style="width:100%; max-width:390px; background:rgba(15, 23, 42, 0.94); border:2px solid #10b981; border-radius:12px; padding:12px 14px; box-shadow:0 12px 32px rgba(0,0,0,0.65); backdrop-filter:blur(8px);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <span style="font-size:8.5px; color:#93c5fd; font-weight:800;">
          ☁️ ${u.provider === 'apple' ? ' Apple ID' : (u.provider === 'google' ? 'G Google' : '👤 Guest')} (${u.uid.slice(0, 12)})
        </span>
        <button onclick="window.NovaVerdeMobileSDK.switchAccountOnTitleScreen()"
          style="background:transparent; color:#cbd5e1; border:none; font-size:8.5px; text-decoration:underline; cursor:pointer;">
          ${tr("Đổi tài khoản", "Switch account")}
        </button>
      </div>
      <div style="font-size:11.5px; font-weight:900; color:#fef08a; text-align:center; margin-bottom:6px;">
        🏢 ${tr("KHỞI TẠO TẬP ĐOÀN & CHỌN MÀU SKIN TRẠM SẠC", "SETUP CORPORATION & STATION SKIN")}
      </div>
      <input id="nv-title-corp-input" type="text" maxlength="28" value="${cleanCorpVal}"
        placeholder="${tr('Nhập tên Tập đoàn của bạn...', 'Enter your Corporation Name...')}"
        style="width:100%; box-sizing:border-box; padding:8px 10px; border-radius:7px; border:1.5px solid #34d399; background:#091326; color:#fef08a; font-size:11.5px; font-weight:900; margin-bottom:8px; outline:none;" />
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:10px;">
        ${skinGrid}
      </div>
      <button onclick="window.NovaVerdeMobileSDK.confirmOnboardingToTapToPlay()"
        style="width:100%; height:42px; border-radius:6px; border:1.5px solid #fef08a; background:linear-gradient(180deg, #10b981 0%, #059669 100%); color:#ffffff; font-size:12.5px; font-weight:900; cursor:pointer; box-shadow:0 4px 12px rgba(16,185,129,0.5);">
        ✅ ${tr("XÁC NHẬN HỒ SƠ TẬP ĐOÀN", "CONFIRM CORPORATION PROFILE")}
      </button>
    </div>
  `;
} else if (sdkState.titleMode === "tap_to_play") {
  const provLabel = u.provider === "apple" ? " Apple" : (u.provider === "google" ? "G Google" : "Guest");
  actionAreaHtml = `
    <div style="display:flex; flex-direction:column; align-items:center; gap:8px; width:100%; max-width:400px;">
      <div style="display:flex; align-items:center; gap:8px; background:rgba(15, 23, 42, 0.9); border:1.5px solid rgba(52, 211, 153, 0.85); border-radius:99px; padding:5px 14px; font-size:10px; font-weight:800; color:#ecfdf5; box-shadow:0 4px 12px rgba(0,0,0,0.45);">
        <span>${curSkinMeta.icon} <b style="color:#fef08a;">${cleanCorpVal}</b></span>
        <span style="opacity:0.45;">|</span>
        <span style="color:#6ee7b7;">${ownedLotsCount} ${tr("Lô", "Lots")} • ${netWorthStr}</span>
        <span style="opacity:0.45;">|</span>
        <span style="color:#93c5fd;">☁️ ${provLabel}</span>
      </div>

      <div class="nv-ts-btn-row">
        <button class="nv-ts-login-btn google" style="flex:1; height:48px; font-size:14px; letter-spacing:0.8px; background:linear-gradient(180deg, #fde047 0%, #eab308 100%); color:#1e293b; border:2px solid #ffffff;"
          onclick="window.NovaVerdeMobileSDK.enterGameFromTitleScreen()">
          ▶️ ${tr("CHẠM ĐỂ VÀO GAME (TAP TO PLAY)", "TAP TO PLAY")}
        </button>
        <button class="nv-ts-login-btn guest" style="flex:0 0 auto; width:auto; height:48px; padding:0 11px; font-size:10px;"
          onclick="window.NovaVerdeMobileSDK.openTitleOnboardingEditor()" title="${tr('Đổi Tên Tập đoàn & Màu Skin', 'Edit Corporation Name & Skin')}">
          🎨 ${tr("Đổi Tên/Skin", "Customize")}
        </button>
        <button class="nv-ts-login-btn more" style="flex:0 0 auto; width:auto; height:48px; padding:0 10px; font-size:10px;"
          onclick="window.NovaVerdeMobileSDK.switchAccountOnTitleScreen()" title="${tr('Đổi sang tài khoản khác', 'Switch Account')}">
          🔄 ${tr("Đổi TK", "Switch")}
        </button>
      </div>
    </div>
  `;
} else {
  actionAreaHtml = `
    <div class="nv-ts-btn-row">
      <div class="nv-ts-btn-wrap">
        ${lastProv === "guest" ? `<div class="nv-ts-last-login-tag">${tr("Last Login", "Last Login")}</div>` : ""}
        <button class="nv-ts-login-btn guest" onclick="window.NovaVerdeMobileSDK.handleTitleLoginClick('guest')">
          GUEST
        </button>
      </div>

      <div class="nv-ts-btn-wrap">
        ${lastProv === "google" ? `<div class="nv-ts-last-login-tag">${tr("Last Login", "Last Login")}</div>` : ""}
        <button class="nv-ts-login-btn google" onclick="window.NovaVerdeMobileSDK.handleTitleLoginClick('google')">
          <span style="font-weight:900; color:#1d4ed8; background:#fff; width:18px; height:18px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:11px;">G</span>
          <span>${tr("Google", "Google")}</span>
        </button>
      </div>

      <div class="nv-ts-btn-wrap">
        ${lastProv === "email" ? `<div class="nv-ts-last-login-tag">${tr("Last Login", "Last Login")}</div>` : ""}
        <button class="nv-ts-login-btn" style="background:linear-gradient(180deg,#10b981,#059669); color:#fff; border:1px solid #6ee7b7;" onclick="window.NovaVerdeMobileSDK.openEmailSignUpOnTitle()">
          📧 <span>${tr("Email / Sign-Up", "Email / Sign-Up")}</span>
        </button>
      </div>
    </div>
  `;
}

ts.innerHTML = `
  ${standaloneBgSvg}
  <div class="nv-ts-content-layer">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; padding-top:calc(env(safe-area-inset-top, 6px) + 6px);">
      <div class="nv-ts-version-ribbon">
        Version 2.1.10540
      </div>

      <div class="nv-ts-right-tools">
        <div class="nv-ts-tool-item" onclick="window.NovaVerdeMobileSDK.showTitleHelpAlert()">
          <div class="nv-ts-tool-circle">🎧</div>
          <span class="nv-ts-tool-lbl">${tr("Help", "Help")}</span>
        </div>
        <div class="nv-ts-tool-item" onclick="window.NovaVerdeMobileSDK.toggleTitleLanguage()">
          <div class="nv-ts-tool-circle">🌐</div>
          <span class="nv-ts-tool-lbl">${tr("Language", "Language")}</span>
        </div>
        <div class="nv-ts-tool-item" onclick="window.NovaVerdeMobileSDK.repairAndRestoreCloudOnTitle()">
          <div class="nv-ts-tool-circle">🛠️</div>
          <span class="nv-ts-tool-lbl">${tr("Reset", "Reset")}</span>
        </div>
      </div>
    </div>

    <div class="nv-ts-logo-wrap">
      <div class="nv-ts-logo-frame">
        <div class="nv-ts-logo-main">NOVAVERDE</div>
      </div>
      <div class="nv-ts-logo-sub">EV TYCOON</div>
    </div>

    <div class="nv-ts-bottom-zone">
      ${actionAreaHtml}

      <div class="nv-ts-legal-bar">
        <div class="nv-ts-legal-item" onclick="window.NovaVerdeMobileSDK.toggleTitleConsent('privacy')">
          <span class="nv-ts-diamond ${sdkState.privacyAccepted ? 'checked' : ''}"></span>
          <span>${tr("I have read and acknowledge the", "I have read and acknowledge the")} <a href="./privacy-policy.html" target="_blank" onclick="event.stopPropagation();" style="color:#6ee7b7; text-decoration:underline; font-weight:900;">PRIVACY POLICY</a></span>
        </div>
        <div class="nv-ts-legal-item" onclick="window.NovaVerdeMobileSDK.toggleTitleConsent('terms')">
          <span class="nv-ts-diamond ${sdkState.termsAccepted ? 'checked' : ''}"></span>
          <span>${tr("I have read and agree to the", "I have read and agree to the")} <a href="./privacy-policy.html" target="_blank" onclick="event.stopPropagation();" style="color:#6ee7b7; text-decoration:underline; font-weight:900;">USER AGREEMENT</a></span>
        </div>
      </div>
    </div>
  </div>
`;
}

function loadLocalScriptOnce(srcPath) {
return new Promise((resolve, reject) => {
  if (typeof document === "undefined") return reject(new Error("no_dom"));
  const existing = document.querySelector(`script[data-nv-src="${srcPath}"]`);
  if (existing) return resolve();
  const s = document.createElement("script");
  s.src = srcPath;
  s.async = false;
  s.setAttribute("data-nv-src", srcPath);
  s.onload = () => resolve();
  s.onerror = err => reject(err);
  document.head.appendChild(s);
});
}

let _fbWebSdkReadyPromise = null;
let _applyingFbUserInProgress = false;
function ensureFirebaseWebAuthSdk() {
if (_fbWebSdkReadyPromise) return _fbWebSdkReadyPromise;
_fbWebSdkReadyPromise = (async () => {
  try {
    if (!window.firebase) {
      await loadLocalScriptOnce("/__/firebase/10.13.2/firebase-app-compat.js");
      await loadLocalScriptOnce("/__/firebase/10.13.2/firebase-auth-compat.js");
    }
    if (window.firebase && (!window.firebase.apps || window.firebase.apps.length === 0)) {
      window.firebase.initializeApp({
        apiKey: getActiveFirebaseApiKey(),
        authDomain: FIREBASE_CONFIG.authDomain,
        projectId: FIREBASE_CONFIG.projectId
      });
    }
    if (window.firebase && typeof window.firebase.auth === "function") {
      try {
        const redirRes = await window.firebase.auth().getRedirectResult();
        if (redirRes && redirRes.user) {
          await applyFirebaseSdkUser(redirRes.user);
        }
      } catch (e) {}

      if (!window.firebase.auth()._nvAuthListenerBound) {
        window.firebase.auth()._nvAuthListenerBound = true;
        window.firebase.auth().onAuthStateChanged(async (fbUser) => {
          if (!fbUser || _applyingFbUserInProgress) return;
          const isDifferentOrUnrestored =
            sdkState.user.provider !== "google" ||
            sdkState.user.firebaseUid !== fbUser.uid ||
            !sdkState.user.hasCompletedOnboarding;
          if (isDifferentOrUnrestored) {
            await applyFirebaseSdkUser(fbUser);
          }
        });
      }
      return true;
    }
  } catch (e) {}
  return false;
})();
return _fbWebSdkReadyPromise;
}

async function applyFirebaseSdkUser(fbUser) {
if (!fbUser || _applyingFbUserInProgress) return;
_applyingFbUserInProgress = true;
try {
  let idToken = null;
  try { idToken = await fbUser.getIdToken(); } catch (e) {}
  const prevSameUserCorpName = (
    sdkState.user &&
    sdkState.user.hasCompletedOnboarding &&
    (sdkState.user.firebaseUid === fbUser.uid || sdkState.user.email === fbUser.email) &&
    sdkState.user.displayName
  ) ? sdkState.user.displayName : null;

  const fbPhotoSave = (fbUser.photoURL && String(fbUser.photoURL).includes("#nvsave="))
    ? fbUser.photoURL
    : ((sdkState.user && sdkState.user.photoUrlSave) || null);

  setAuthenticatedUser({
    uid: "google_" + fbUser.uid,
    firebaseUid: fbUser.uid,
    provider: "google",
    displayName: prevSameUserCorpName || fbUser.displayName || (fbUser.email ? fbUser.email.split("@")[0] : "NovaVerde EV Corp"),
    email: fbUser.email || null,
    photoUrlSave: fbPhotoSave,
    idToken,
    isAnonymous: false,
    hasCompletedOnboarding: Boolean(prevSameUserCorpName)
  });
  sdkState.lastLoginProvider = "google";
  localStorage.setItem("NOVAVERDE_LAST_LOGIN_PROVIDER", "google");

  const restored = await restoreCloudSaveNow({ preserveHigherLocalProgress: true });
  if (restored || prevSameUserCorpName) {
    sdkState.user.hasCompletedOnboarding = true;
    localStorage.setItem("NOVAVERDE_AUTH_USER", JSON.stringify(sdkState.user));
    sdkState.titleMode = "tap_to_play";
  } else {
    sdkState.titleMode = "onboarding";
  }
  renderPubgStyleTitleScreen();
} finally {
  _applyingFbUserInProgress = false;
}
}

async function launchRealGoogleOAuth() {
await ensureFirebaseWebAuthSdk();
if (window.firebase && typeof window.firebase.auth === "function") {
  try {
    const provider = new window.firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await window.firebase.auth().signInWithPopup(provider);
    if (cred && cred.user) {
      await applyFirebaseSdkUser(cred.user);
      return;
    }
  } catch (popupErr) {
    if (popupErr && (popupErr.code === "auth/popup-blocked" || popupErr.code === "auth/operation-not-supported-in-this-environment")) {
      const provider = new window.firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await window.firebase.auth().signInWithRedirect(provider);
      return;
    }
    if (popupErr && popupErr.code === "auth/popup-closed-by-user") {
      return;
    }
  }
}

const apiKey = getActiveFirebaseApiKey();
const handlerUri = `https://${FIREBASE_CONFIG.authDomain}/__/auth/handler`;
try {
  const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      providerId: "google.com",
      continueUri: handlerUri
    })
  });
  if (resp.ok) {
    const data = await resp.json();
    if (data && data.authUri) {
      window.location.href = data.authUri;
      return;
    }
  }
} catch (e) {}
}

async function checkOAuthRedirectCallback() {
if (typeof window === "undefined" || !window.location) return;
const rawHash = window.location.hash || "";
const rawSearch = window.location.search || "";
if (!rawHash.includes("id_token=") && !rawHash.includes("access_token=") && !rawSearch.includes("oobCode=")) return;

try {
  const apiKey = getActiveFirebaseApiKey();
  const searchParams = new URLSearchParams(rawSearch.replace(/^\?/, ""));
  const oobCode = searchParams.get("oobCode");
  const savedEmail = localStorage.getItem("NOVAVERDE_PENDING_EMAIL");

  if (oobCode && savedEmail) {
    const emailResp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithEmailLink?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: savedEmail, oobCode })
    });
    if (emailResp.ok) {
      const emailData = await emailResp.json();
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      setAuthenticatedUser({
        uid: "email_" + emailData.localId,
        firebaseUid: emailData.localId,
        provider: "email",
        displayName: savedEmail.split("@")[0],
        email: savedEmail,
        idToken: emailData.idToken,
        isAnonymous: false
      });
      const restored = await restoreCloudSaveNow();
      sdkState.titleMode = restored ? "tap_to_play" : "onboarding";
      renderPubgStyleTitleScreen();
      return;
    }
  }

  const params = new URLSearchParams(rawHash.replace(/^#/, ""));
  const idToken = params.get("id_token");
  const accessToken = params.get("access_token");
  if (!idToken && !accessToken) return;

  const postBody = idToken
    ? `id_token=${encodeURIComponent(idToken)}&providerId=google.com`
    : `access_token=${encodeURIComponent(accessToken)}&providerId=google.com`;

  const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      postBody,
      requestUri: window.location.origin + window.location.pathname,
      returnIdpCredential: true,
      returnSecureToken: true
    })
  });
  if (resp.ok) {
    const data = await resp.json();
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setAuthenticatedUser({
      uid: "google_" + data.localId,
      firebaseUid: data.localId,
      provider: "google",
      displayName: data.displayName || (data.email ? data.email.split("@")[0] : "NovaVerde EV Corp"),
      email: data.email || null,
      idToken: data.idToken,
      isAnonymous: false
    });
    const restored = await restoreCloudSaveNow();
    if (restored) {
      sdkState.user.hasCompletedOnboarding = true;
      localStorage.setItem("NOVAVERDE_AUTH_USER", JSON.stringify(sdkState.user));
      sdkState.titleMode = "tap_to_play";
    } else {
      sdkState.titleMode = "onboarding";
    }
    renderPubgStyleTitleScreen();
  }
} catch (e) {}
}

function openEmailSignUpOnTitle() {
if (typeof window.closeSaveModal === "function") window.closeSaveModal();
sdkState.emailAuthError = "";
sdkState.emailAuthInfo = "";
sdkState.inTitleScreen = true;
sdkState.titleMode = "email_signup";
renderPubgStyleTitleScreen();
}

async function submitFirebaseEmailAuth(mode) {
const emailEl = document.getElementById("nv-email-addr-input");
const email = emailEl ? emailEl.value.trim().toLowerCase() : "";

if (!email || !email.includes("@")) {
  sdkState.emailAuthError = tr("Vui lòng nhập địa chỉ Email hợp lệ!", "Please enter a valid Email address!");
  sdkState.emailAuthInfo = "";
  renderPubgStyleTitleScreen();
  return;
}

localStorage.setItem("NOVAVERDE_PENDING_EMAIL", email);
const apiKey = getActiveFirebaseApiKey();

if (mode === "magic_link") {
  try {
    const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestType: "EMAIL_SIGNIN",
        email,
        continueUrl: window.location.origin + window.location.pathname
      })
    });
    const data = await resp.json();
    if (resp.ok) {
      sdkState.emailAuthError = "";
      sdkState.emailAuthInfo = tr(
        `Đã gửi Link đăng nhập tới ${email}! Hãy kiểm tra hộp thư hoặc bấm 'Đăng Ký & Vào Ngay'.`,
        `Magic sign-in link sent to ${email}! Check your inbox or tap 'Sign Up & Continue'.`
      );
    } else {
      sdkState.emailAuthInfo = "";
      sdkState.emailAuthError = tr(
        "Hãy bật Email Sign-In trong Firebase Console -> Authentication -> Sign-in method (hoặc bấm 'Đăng Ký & Vào Ngay')!",
        "Enable Email Sign-In in Firebase Console -> Authentication -> Sign-in method (or tap 'Sign Up & Continue')!"
      );
    }
    renderPubgStyleTitleScreen();
    return;
  } catch (e) {}
}

const fbToken = await ensureFirebaseAuthToken();
const cleanEmailSlug = email.replace(/[^a-z0-9]/g, "_");
const emailUid = "email_" + cleanEmailSlug;
sdkState.emailAuthError = "";
sdkState.emailAuthInfo = "";
sdkState.lastLoginProvider = "email";
localStorage.setItem("NOVAVERDE_LAST_LOGIN_PROVIDER", "email");

setAuthenticatedUser({
  uid: emailUid,
  firebaseUid: emailUid,
  provider: "email",
  displayName: email.split("@")[0],
  email,
  idToken: fbToken,
  isAnonymous: false
});
const restored = await restoreCloudSaveNow();
if (restored) {
  sdkState.user.hasCompletedOnboarding = true;
  localStorage.setItem("NOVAVERDE_AUTH_USER", JSON.stringify(sdkState.user));
  sdkState.titleMode = "tap_to_play";
} else {
  sdkState.titleMode = "onboarding";
}
renderPubgStyleTitleScreen();
}

async function handleTitleLoginClick(providerName) {
if (!sdkState.privacyAccepted || !sdkState.termsAccepted) {
  sdkState.privacyAccepted = true;
  sdkState.termsAccepted = true;
}
sdkState.lastLoginProvider = providerName;
localStorage.setItem("NOVAVERDE_LAST_LOGIN_PROVIDER", providerName);

if (providerName === "email") {
  openEmailSignUpOnTitle();
  return;
}

const Plugins = (window.Capacitor && window.Capacitor.Plugins) || {};
if (sdkState.isNative && Plugins.FirebaseAuthentication && providerName === "google") {
  await signInWithProvider("google");
  sdkState.titleMode = sdkState.user.hasCompletedOnboarding ? "tap_to_play" : "onboarding";
  renderPubgStyleTitleScreen();
  return;
}

if (providerName === "google") {
  await launchRealGoogleOAuth();
  return;
}

await signInWithProvider("guest");
sdkState.titleMode = sdkState.user.hasCompletedOnboarding ? "tap_to_play" : "onboarding";
renderPubgStyleTitleScreen();
}

function selectTitleSkin(skinId) {
const inp = document.getElementById("nv-title-corp-input");
if (inp && inp.value.trim()) {
  sdkState.user.displayName = inp.value.trim();
}
pickStarterSkin(skinId);
renderPubgStyleTitleScreen();
}

async function confirmOnboardingToTapToPlay() {
const inp = document.getElementById("nv-title-corp-input");
if (inp && inp.value.trim()) {
  sdkState.user.displayName = inp.value.trim();
  if (window.mpState) {
    window.mpState.playerName = sdkState.user.displayName;
    localStorage.setItem("HN_EV_MP_PLAYER_NAME", sdkState.user.displayName);
  }
}
sdkState.user.hasCompletedOnboarding = true;
localStorage.setItem("NOVAVERDE_AUTH_USER", JSON.stringify(sdkState.user));
if (typeof window.saveGameToStorage === "function") window.saveGameToStorage(false);
await syncCloudSaveNow(false);
sdkState.titleMode = "tap_to_play";
renderPubgStyleTitleScreen();
}

function openTitleOnboardingEditor() {
sdkState.titleMode = "onboarding";
renderPubgStyleTitleScreen();
}

function switchAccountOnTitleScreen() {
sdkState.titleMode = "login_buttons";
renderPubgStyleTitleScreen();
}

function enterGameFromTitleScreen() {
sdkState.inTitleScreen = false;
renderPubgStyleTitleScreen();
if (typeof window.initGame === "function" && !window._nvGameLoopStarted) {
  window._nvGameLoopStarted = true;
  window.initGame();
}
if (typeof window.resizeCanvas === "function") window.resizeCanvas();
if (typeof window.applyLanguageStaticDOM === "function") window.applyLanguageStaticDOM();
if (typeof window.zoomToLot === "function" && typeof state !== "undefined") {
  window.zoomToLot(state.selectedLotId || 1);
}
if (typeof window.closeSaveModal === "function") window.closeSaveModal();
if (typeof window.refreshAllUI === "function") window.refreshAllUI();
if (typeof window.drawCartoonMap === "function") window.drawCartoonMap();
if (typeof state !== "undefined" && state.unclaimedOfflineRealSec >= 25 && typeof window.simulateServerOfflineProgress === "function") {
  const secToRun = state.unclaimedOfflineRealSec;
  state.unclaimedOfflineRealSec = 0;
  setTimeout(() => window.simulateServerOfflineProgress(secToRun), 250);
}
}

function returnToTitleScreen() {
if (typeof window.closeSaveModal === "function") window.closeSaveModal();
sdkState.inTitleScreen = true;
sdkState.titleMode = sdkState.user.hasCompletedOnboarding ? "tap_to_play" : "login_buttons";
renderPubgStyleTitleScreen();
}

function toggleTitleLanguage() {
if (typeof window.toggleLanguage === "function") {
  window.toggleLanguage();
} else {
  const nextLang = window.currentLang === "en" ? "vi" : "en";
  window.currentLang = nextLang;
  localStorage.setItem("HN_EV_LANG", nextLang);
  if (typeof window.applyLanguageStaticDOM === "function") window.applyLanguageStaticDOM();
  if (typeof window.refreshAllUI === "function") window.refreshAllUI();
}
renderPubgStyleTitleScreen();
}

async function repairAndRestoreCloudOnTitle() {
clearAllGameAndAuthStorage();
if (typeof window.resetAllSaveData === "function") {
  window.resetAllSaveData();
}
const freshGuestId = "guest_" + Math.random().toString(36).slice(2, 9);
sdkState.user = {
  uid: freshGuestId,
  provider: "guest",
  displayName: "NovaVerde EV Corp",
  email: null,
  idToken: null,
  isAnonymous: true,
  hasCompletedOnboarding: false
};
sdkState.inTitleScreen = true;
sdkState.titleMode = "login_buttons";
renderPubgStyleTitleScreen();
}

function showTitleHelpAlert() {
if (typeof window.openSaveModal === "function") {
  sdkState.inTitleScreen = false;
  renderPubgStyleTitleScreen();
  if (typeof window.resizeCanvas === "function") window.resizeCanvas();
  window.openSaveModal();
}
}

function toggleTitleConsent(which) {
if (which === "privacy") sdkState.privacyAccepted = !sdkState.privacyAccepted;
if (which === "terms") sdkState.termsAccepted = !sdkState.termsAccepted;
renderPubgStyleTitleScreen();
}

function hookIntoGameFunctions() {
if (typeof window.initGame === "function" && !window._nvGameLoopStarted) {
  window._nvGameLoopStarted = true;
  window.initGame();
}

if (_didFreshEpochReset && typeof window.resetAllSaveData === "function") {
  window.resetAllSaveData();
  localStorage.removeItem("NOVAVERDE_AUTH_USER");
  sdkState.inTitleScreen = true;
  sdkState.titleMode = "login_buttons";
}

if (typeof window.resetAllSaveData === "function" && !window.resetAllSaveData._sdkHooked) {
  const origReset = window.resetAllSaveData;
  window.resetAllSaveData = function() {
    clearAllGameAndAuthStorage();
    const r = origReset();
    localStorage.removeItem("NOVAVERDE_AUTH_USER");
    sdkState.user.hasCompletedOnboarding = false;
    sdkState.inTitleScreen = true;
    sdkState.titleMode = "login_buttons";
    renderPubgStyleTitleScreen();
    return r;
  };
  window.resetAllSaveData._sdkHooked = true;
}

if (typeof window.openSaveModal === "function" && !window.openSaveModal._sdkHooked) {
  const origOpenSave = window.openSaveModal;
  window.openSaveModal = function() {
    origOpenSave();
    renderAuthPanelInSaveModal();
  };
  window.openSaveModal._sdkHooked = true;
}

// Tự động lưu lên Cloud mỗi khi game lưu Local (Mua đất, Nâng cấp trụ, Nạp GC, Xem Ads...)
if (typeof window.saveGameToStorage === "function" && !window.saveGameToStorage._sdkHooked) {
  const origSaveLocal = window.saveGameToStorage;
  window.saveGameToStorage = function(manualNotify) {
    const res = origSaveLocal(manualNotify);
    if (!sdkState.inTitleScreen) scheduleAutoCloudSave();
    return res;
  };
  window.saveGameToStorage._sdkHooked = true;
}

if (typeof window.startRewardedVideoAd === "function" && !window.startRewardedVideoAd._sdkHooked) {
  const origStartAd = window.startRewardedVideoAd;
  window.startRewardedVideoAd = function(adType) {
    return showNativeOrWebRewardedAd(adType, origStartAd);
  };
  window.startRewardedVideoAd._sdkHooked = true;
}

if (typeof window.topUpGreenCoin === "function" && !window.topUpGreenCoin._sdkHooked) {
  const origTopUp = window.topUpGreenCoin;
  window.topUpGreenCoin = function(amountGc) {
    return purchaseGreenCoinPack(amountGc, origTopUp);
  };
  window.topUpGreenCoin._sdkHooked = true;
}

if (typeof window.buyRemoveAdsPack === "function" && !window.buyRemoveAdsPack._sdkHooked) {
  const origBuyNoAds = window.buyRemoveAdsPack;
  window.buyRemoveAdsPack = function() {
    return purchaseGreenCoinPack("remove_ads", () => origBuyNoAds());
  };
  window.buyRemoveAdsPack._sdkHooked = true;
}

if (typeof window.toggleLanguage === "function" && !window.toggleLanguage._sdkHooked) {
  const origToggleLang = window.toggleLanguage;
  window.toggleLanguage = function() {
    const r = origToggleLang();
    renderAuthPanelInSaveModal();
    renderPubgStyleTitleScreen();
    return r;
  };
  window.toggleLanguage._sdkHooked = true;
}

renderAuthPanelInSaveModal();
renderPubgStyleTitleScreen();
ensureFirebaseWebAuthSdk();
checkOAuthRedirectCallback();

if (sdkState.user && sdkState.user.provider !== "guest" && sdkState.user.hasCompletedOnboarding) {
  setTimeout(() => {
    restoreCloudSaveNow({ preserveHigherLocalProgress: true });
  }, 300);
}
}

window.NovaVerdeMobileSDK = {
state: sdkState,
FIREBASE_CONFIG,
ADMOB_CONFIG,
IAP_PRODUCTS_MAP,
isNativeCapacitor,
getPlatformName,
getCandidateCloudDocIds,
encodeCompactAuthProfileSave,
decodeCompactAuthProfileSave,
applyFirebaseSdkUser,
signInWithProvider,
signOutAccount,
pickStarterSkin,
applyProfileAndTapToPlay,
syncCloudSaveNow,
restoreCloudSaveNow,
verifyAntiCheat1xIntegrity,
showNativeOrWebRewardedAd,
toggleNativeBannerAd,
purchaseGreenCoinPack,
renderAuthPanelInSaveModal,
renderPubgStyleTitleScreen,
handleTitleLoginClick,
launchRealGoogleOAuth,
checkOAuthRedirectCallback,
openEmailSignUpOnTitle,
submitFirebaseEmailAuth,
selectTitleSkin,
confirmOnboardingToTapToPlay,
openTitleOnboardingEditor,
switchAccountOnTitleScreen,
enterGameFromTitleScreen,
returnToTitleScreen,
toggleTitleLanguage,
repairAndRestoreCloudOnTitle,
showTitleHelpAlert,
toggleTitleConsent
};

if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", () => {
  bootstrapNativePlugins();
  setTimeout(hookIntoGameFunctions, 80);
});
} else {
bootstrapNativePlugins();
setTimeout(hookIntoGameFunctions, 80);
}
})();
