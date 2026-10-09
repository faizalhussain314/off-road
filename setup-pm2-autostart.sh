#!/bin/bash
# ==============================================================================
# Auto PM2 Startup & Watchdog Setup Script for MadProTek Servers
# Domains: adventure.madprotekcorp.com & madprotekcorp.com
# ==============================================================================

set -e

# Detect Node.js / NVM path
export PATH="/home/optimusinfinity/.nvm/versions/node/v20.20.2/bin:$PATH:/usr/local/bin:/usr/bin"
PM2_BIN="/home/optimusinfinity/madprotek/node_modules/pm2/bin/pm2"

if [ ! -f "$PM2_BIN" ]; then
  # Fallback to global pm2 or npx
  PM2_BIN=$(which pm2 2>/dev/null || echo "npx pm2")
fi

echo "==> Using PM2 binary: $PM2_BIN"

# 1. Navigate to adventure app and start/reload
if [ -d "/home/optimusinfinity/adventure.madprotekcorp.com" ]; then
  echo "==> Starting adventure.madprotekcorp.com (Port 3001)..."
  cd /home/optimusinfinity/adventure.madprotekcorp.com
  $PM2_BIN startOrReload ecosystem.config.cjs --update-env || $PM2_BIN start ecosystem.config.cjs
fi

# 2. Start madprotek main app if configured
if [ -d "/home/optimusinfinity/madprotek" ]; then
  echo "==> Checking madprotek main application..."
  cd /home/optimusinfinity/madprotek
  if [ -f "ecosystem.config.cjs" ]; then
    $PM2_BIN startOrReload ecosystem.config.cjs --update-env || $PM2_BIN start ecosystem.config.cjs
  elif [ -f "ecosystem.config.js" ]; then
    $PM2_BIN startOrReload ecosystem.config.js --update-env || $PM2_BIN start ecosystem.config.js
  fi
fi

# 3. Save the PM2 process list to disk (~/.pm2/dump.pm2)
echo "==> Saving current running processes to PM2 state file..."
$PM2_BIN save

# 4. Setup Cron @reboot and watchdog so apps restart automatically after server reboot
echo "==> Setting up automatic restart on system reboot via crontab..."
CRON_CMD="@reboot export PATH=\"/home/optimusinfinity/.nvm/versions/node/v20.20.2/bin:\$PATH\" && $PM2_BIN resurrect >> /home/optimusinfinity/pm2_reboot.log 2>&1"
WATCHDOG_CMD="*/5 * * * * export PATH=\"/home/optimusinfinity/.nvm/versions/node/v20.20.2/bin:\$PATH\" && $PM2_BIN resurrect >> /home/optimusinfinity/pm2_watchdog.log 2>&1"

# Read existing crontab
EXISTING_CRON=$(crontab -l 2>/dev/null || true)

NEW_CRON="$EXISTING_CRON"
if ! echo "$NEW_CRON" | grep -q "pm2 resurrect"; then
  NEW_CRON=$(printf "%s\n# PM2 Auto-Start on server reboot\n%s\n%s\n" "$NEW_CRON" "$CRON_CMD" "$WATCHDOG_CMD")
  echo "$NEW_CRON" | crontab -
  echo "==> Crontab auto-start rules installed successfully!"
else
  echo "==> Crontab rules already present."
fi

# 5. Check if systemd pm2 startup can be configured
if [ "$(id -u)" -eq 0 ]; then
  echo "==> Running system-level pm2 startup as root..."
  $PM2_BIN startup systemd -u optimusinfinity --hp /home/optimusinfinity
elif command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
  echo "==> Configuring systemd startup via sudo..."
  STARTUP_CMD=$($PM2_BIN startup systemd -u optimusinfinity --hp /home/optimusinfinity | grep "sudo env")
  if [ -n "$STARTUP_CMD" ]; then
    eval "$STARTUP_CMD"
  fi
fi

echo "=============================================================================="
echo "PM2 Status:"
$PM2_BIN status
echo "=============================================================================="
echo "All services successfully started and auto-start feature enabled!"
