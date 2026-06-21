#!/bin/bash

echo "Installing Trinity AI Framework..."
echo "------------------------------------"

npm install express

if [ -f "server.js" ]; then
    echo "[OK] Server file found."
else
    echo "[ERROR] server.js missing!"
    exit 1
fi

echo "------------------------------------"
echo "Trinity AI is ready to deploy!"
echo "Run: node server.js"
echo "Access: http://localhost:3000"
echo "------------------------------------"
