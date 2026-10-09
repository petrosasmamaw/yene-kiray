#!/bin/bash
ports=(3000 5000 4000 5173)

for port in "${ports[@]}"; do
  echo "Checking port $port..."
  pids=$(netstat -ano | grep -E ":$port[[:space:]]" | awk '{print $NF}' | sort -u)
  if [ -z "$pids" ]; then
    echo "  No process found on port $port."
  else
    for pid in $pids; do
      if [ "$pid" != "0" ] && [ -n "$pid" ]; then
        echo "  Terminating PID $pid on port $port..."
        taskkill //F //PID "$pid" 2>&1 || true
      fi
    done
  fi
done

echo "Done checking and clearing ports."
