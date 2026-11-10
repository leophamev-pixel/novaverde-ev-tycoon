/**
 * src/config/env.js
 * Cấu hình Môi trường Tập trung (Bước 0.2 của Báo Cáo)
 */
const metaEnv = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};
const winEnv = (typeof globalThis !== "undefined" && globalThis.__NV_ENV__) ? globalThis.__NV_ENV__ : {};

function readCfg(k, defVal = "") {
  if (metaEnv && metaEnv[k] !== undefined && metaEnv[k] !== "") return metaEnv[k];
  if (winEnv && winEnv[k] !== undefined && winEnv[k] !== "") return winEnv[k];
  return defVal;
}

export const ENV_CONFIG = {
  IS_DEV: Boolean(
    metaEnv.DEV ||
    (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.search.includes("debug=1")))
  ),
  PROJECT_ID: readCfg("VITE_FIREBASE_PROJECT_ID", "novaverde-ev-tycoon"),
  ADMOB_PUB_ID: readCfg("VITE_ADMOB_PUBLISHER_ID", "pub-7182007818337262")
};
globalThis.ENV_CONFIG = ENV_CONFIG;
