#!/bin/bash
set -e
cd /home/madprote/adventure.madprotekcorp.com

echo "==> 1. Pulling latest code from GitHub..."
# Backup live registration data before syncing
cp data/registrations.json data/registrations.json.bak 2>/dev/null || true

# Cleanly sync with origin/main to prevent any local conflicts or merge aborts
git fetch origin main
git reset --hard origin/main

# Restore live registration data
cp data/registrations.json.bak data/registrations.json 2>/dev/null || true

# Ensure critical Passenger .htaccess is always intact
if [ ! -f .htaccess ]; then
  git checkout -- .htaccess 2>/dev/null || true
fi
chmod +x deploy.sh 2>/dev/null || true

echo "==> 2. Activating Node.js 20 environment..."
source /home/madprote/nodevenv/adventure.madprotekcorp.com/20/bin/activate

echo "==> 3. Building Next.js application..."
export RAYON_NUM_THREADS=1
export NEXT_CPU_COUNT=1
export UV_THREADPOOL_SIZE=1
export NEXT_DIST_DIR=.next_prod
npx next build

echo "==> 4. Restarting Application..."
mkdir -p tmp && touch tmp/restart.txt
pkill -f "lsnode.*adventure.madprotekcorp.com" 2>/dev/null || true

echo "==> 5. Cleaning cache to preserve disk space..."
rm -rf /home/madprote/.npm /home/madprote/.cache 2>/dev/null || true

echo "=================================================="
echo "DEPLOYMENT SUCCESSFUL! Site is LIVE."
echo "=================================================="
