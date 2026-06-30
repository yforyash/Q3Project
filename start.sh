#!/bin/bash

echo "=== 1. Clearing old port conflicts ==="
kill -9 $(lsof -t -i :5001 -i :5173 -i :5174 -i :5175 -i :5176) 2>/dev/null
sleep 1

echo "=== 2. Starting Backend Server (Port 5001) ==="
cd backend
node server.js > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
sleep 2

echo "=== 3. Starting Frontend Vite (Port 5173) ==="
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "=========================================="
echo "🚀 Both servers are running successfully!"
echo "- Backend: http://localhost:5001"
echo "- Frontend: http://localhost:5173"
echo "=========================================="
echo "Keep this terminal tab open while testing."
echo "Press Ctrl+C to stop both servers."

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
