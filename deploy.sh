#!/bin/bash
set -e
cd /home/madprote/adventure.madprotekcorp.com

echo "==> 1. Pulling latest code from GitHub..."
# Prevent runtime data changes (e.g. new registrations) from blocking git pull
git stash -- data/ 2>/dev/null || true
git pull origin main

# Ensure critical Passenger .htaccess is always intact
if [ ! -f .htaccess ]; then
  git checkout -- .htaccess 2>/dev/null || true
fi

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
