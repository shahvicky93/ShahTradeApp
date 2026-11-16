#!/usr/bin/env bash
# ==============================================================================
# Kisan Ledger — Launch Script for Backend & Frontend
# ==============================================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export JAVA_HOME="/usr/lib/jvm/java-21-openjdk-amd64"
export PATH="$JAVA_HOME/bin:$PATH"

# Auto-load .env if present
if [ -f "$ROOT_DIR/.env" ]; then
    echo "🔑 Loading database credentials from .env..."
    export $(grep -v '^#' "$ROOT_DIR/.env" | xargs)
fi

echo "========================================================"
echo "🌾 Starting Kisan Ledger: Agricultural Trading System"
echo "========================================================"

echo ""
echo "[1/2] Launching Spring Boot Backend on http://localhost:8080 ..."
echo "      (Make sure your Supabase URL & password are set in application.properties)"
echo ""

# To run in background or separate terminals:
# cd "$ROOT_DIR" && ./mvnw spring-boot:run &

echo "[2/2] Launching React + Vite Frontend on http://localhost:5173 ..."
echo ""
echo "To start both simultaneously:"
echo "Terminal 1: cd $ROOT_DIR && ./mvnw spring-boot:run"
echo "Terminal 2: cd $ROOT_DIR/frontend && npm run dev"
echo ""
echo "Default Logins:"
echo "  • admin / admin123 (ADMIN)"
echo "  • user1 / user123 (USER)"
echo "  • user2 / user123 (USER)"
echo "  • user3 / user123 (USER)"
echo "========================================================"
