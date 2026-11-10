/**
 * scripts/dev-server.mjs
 * Máy chủ Phát triển Địa phương (Local Dev Server) kèm Hot Reload tự động (Bước 0.3 của Báo cáo)
 * - Chạy tại: http://localhost:3000 (hoặc ?debug=1 để bật sẵn Debug Overlay)
 * - Tự động theo dõi thay đổi trong src/ và public/ để làm mới trình duyệt tức thì (SSE Hot Reload)
 */

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT) || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

const sseClients = new Set();

function watchDirectoryRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  try {
    fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      for (const res of sseClients) {
        try {
          res.write(`data: reload\n\n`);
        } catch (e) {}
      }
    });
  } catch (e) {}
}

watchDirectoryRecursive(path.join(ROOT_DIR, "src"));
watchDirectoryRecursive(path.join(ROOT_DIR, "public"));

const HOT_RELOAD_SNIPPET = `
<script>
  (function() {
    try {
      const es = new EventSource("/__nv_hot_reload");
      es.onmessage = function(ev) {
        if (ev.data === "reload") {
          console.log("🔄 [NovaVerde Hot Reload] Phát hiện thay đổi mã nguồn, đang tải lại...");
          window.location.reload();
        }
      };
    } catch (e) {}
  })();
</script>
`;

const server = http.createServer((req, res) => {
  const cleanUrl = (req.url || "/").split("?")[0];

  if (cleanUrl === "/__nv_hot_reload") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    });
    res.write("data: connected\n\n");
    sseClients.add(res);
    req.on("close", () => sseClients.delete(res));
    return;
  }

  let relPath = cleanUrl === "/" ? "/index.html" : cleanUrl;
  let targetPath = path.join(ROOT_DIR, relPath);

  if (!fs.existsSync(targetPath) || fs.statSync(targetPath).isDirectory()) {
    const publicFallback = path.join(ROOT_DIR, "public", relPath);
    if (fs.existsSync(publicFallback) && !fs.statSync(publicFallback).isDirectory()) {
      targetPath = publicFallback;
    } else {
      targetPath = path.join(ROOT_DIR, "index.html");
    }
  }

  try {
    const ext = path.extname(targetPath).toLowerCase();
    const mime = MIME_TYPES[ext] || "application/octet-stream";
    if (ext === ".html") {
      let html = fs.readFileSync(targetPath, "utf8");
      if (!html.includes("/__nv_hot_reload")) {
        html = html.replace("</body>", `${HOT_RELOAD_SNIPPET}\n</body>`);
      }
      res.writeHead(200, { "Content-Type": mime, "Cache-Control": "no-store" });
      res.end(html);
    } else {
      const data = fs.readFileSync(targetPath);
      res.writeHead(200, { "Content-Type": mime, "Cache-Control": "no-store" });
      res.end(data);
    }
  } catch (err) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log("===================================================================");
  console.log(`🚀 NOVAVERDE MODULAR DEV SERVER ĐANG CHẠY (HOT RELOAD BẬT)`);
  console.log(`👉 Mở trình duyệt: http://localhost:${PORT}`);
  console.log(`🛠️  Chế độ Debug:   http://localhost:${PORT}/?debug=1 (hoặc bấm Ctrl+D)`);
  console.log("===================================================================");
});
