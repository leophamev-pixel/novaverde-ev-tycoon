/**
 * vite.config.js
 * Cấu hình Vite Dev Server (Hot Reload cổng 3000) & Build Pipeline xuất ra www/
 */
export default {
  root: ".",
  publicDir: "public",
  server: {
    port: 3000,
    open: false,
    cors: true
  },
  build: {
    outDir: "www",
    emptyOutDir: true
  }
};
