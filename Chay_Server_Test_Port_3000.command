#!/bin/bash
export PATH="$HOME/.gemini/users/user2/node-lts/bin:$PATH"
cd "$HOME/.gemini/users/user2/novaverde-modular"
echo "🚀 Đang khởi động NovaVerde Modular Dev Server tại http://localhost:3000 ..."
open "http://localhost:3000"
node scripts/dev-server.mjs
