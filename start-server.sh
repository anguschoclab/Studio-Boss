kill $(lsof -t -i :8080) 2>/dev/null || true
npm run dev -- --host 0.0.0.0 > dev_server.log 2>&1 &
sleep 5
