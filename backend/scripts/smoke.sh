#!/usr/bin/env bash
#
# Smoke test for the Kebele Zero API.
# Exercises every route group against a RUNNING server + database, including
# role-based access control (a plain user must be blocked from admin routes).
#
# Usage:
#   npm run smoke                       # uses defaults below
#   BASE_URL=http://localhost:4000 MONGODB_URI=mongodb://localhost:27017/kebele-zero-dev npm run smoke
#
# Requires: a running backend (npm start) and its MongoDB, plus python3 + curl.
# Exits non-zero if any check fails.

set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:4000}"
API="$BASE_URL/api"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/kebele-zero-dev}"

PASS=0; FAIL=0
ck()  { if [ "$2" = "$3" ]; then printf '  \033[32m✓\033[0m %-34s %s\n' "$1" "$2"; PASS=$((PASS+1));
        else printf '  \033[31m✗\033[0m %-34s got %s, expected %s\n' "$1" "$2" "$3"; FAIL=$((FAIL+1)); fi; }
# Return exactly one clean 3-digit HTTP status. Some macOS curl builds emit a
# duplicated code line (e.g. "400 400") on connection reuse; keeping only digits
# and taking the last 3 guarantees a single token that never word-splits.
st()  { curl -s --no-keepalive -o /dev/null -w "%{http_code}" "$@" 2>/dev/null | tr -dc '0-9' | tail -c 3; }
jg()  { python3 -c "import sys,json;d=json.load(sys.stdin);print(d$1)" 2>/dev/null; }
auth(){ echo "Authorization: Bearer $1"; }
CT="Content-Type: application/json"

# ── Preflight ────────────────────────────────────────────────────────────────
if [ "$(st "$BASE_URL/health")" != "200" ]; then
  echo "✗ Server not reachable at $BASE_URL — start it with 'npm start' first."
  exit 1
fi
echo "Smoke testing $API"
echo

ts=$(date +%s%N)

# ── Two accounts: one admin, one plain user ──────────────────────────────────
EADMIN="smoke_admin_${ts}@kebele.test"
EUSER="smoke_user_${ts}@kebele.test"

RA=$(curl -s -X POST "$API/auth/register" -H "$CT" \
  -d "{\"username\":\"smkadm${ts}\",\"email\":\"$EADMIN\",\"password\":\"pass1234\"}")
ADMIN_ID=$(echo "$RA" | jg "['user']['_id']")

# Promote to admin directly in the DB (no admin-bootstrap endpoint by design).
( cd "$BACKEND_DIR" && node -e "
  const m=require('mongoose'); m.set('strictQuery',true);
  m.connect('$MONGODB_URI').then(async()=>{
    await require('./src/models/User').findByIdAndUpdate('$ADMIN_ID',{role:'admin'});
    await m.disconnect();
  }).catch(e=>{console.error(e.message);process.exit(1)});
" )
ATOK=$(curl -s -X POST "$API/auth/login" -H "$CT" \
  -d "{\"email\":\"$EADMIN\",\"password\":\"pass1234\"}" | jg "['token']")

UTOK=$(curl -s -X POST "$API/auth/register" -H "$CT" \
  -d "{\"username\":\"smkusr${ts}\",\"email\":\"$EUSER\",\"password\":\"pass1234\"}" | jg "['token']")

if [ -z "$ATOK" ] || [ -z "$UTOK" ]; then
  echo "✗ Could not obtain tokens (admin or user). Aborting."
  exit 1
fi

# ── Auth ─────────────────────────────────────────────────────────────────────
# NOTE: capture the status into a variable first. A double-quoted JSON body with
# a shell variable nested inside "$( ... )" gets re-split at commas, mangling the
# request — assigning to a var avoids that.
echo "── Auth"
LGOOD=$(st -X POST "$API/auth/login" -H "$CT" -d "{\"email\":\"$EUSER\",\"password\":\"pass1234\"}")
ck "POST /auth/login (good)"  "$LGOOD" "200"
LBAD=$(st -X POST "$API/auth/login" -H "$CT" -d "{\"email\":\"$EUSER\",\"password\":\"nope\"}")
ck "POST /auth/login (bad)"   "$LBAD" "401"
ck "GET  /auth/me (auth)"     "$(st "$API/auth/me" -H "$(auth "$UTOK")")" "200"
ck "GET  /auth/me (no auth)"  "$(st "$API/auth/me")" "401"
ck "POST /auth/logout"        "$(st -X POST "$API/auth/logout" -H "$(auth "$UTOK")")" "200"

# ── Points ───────────────────────────────────────────────────────────────────
echo "── Points"
ck "GET /points/leaderboard"          "$(st "$API/points/leaderboard")" "200"
ck "GET /points/leaderboard?gameType" "$(st "$API/points/leaderboard?gameType=checkers")" "200"
ck "PUT /points/game (win)"           "$(st -X PUT "$API/points/game" -H "$CT" -H "$(auth "$UTOK")" -d '{"game":"checkers","result":"win"}')" "200"
ck "PUT /points/game (invalid)"       "$(st -X PUT "$API/points/game" -H "$CT" -H "$(auth "$UTOK")" -d '{"game":"poker","result":"win"}')" "422"

# ── Forum ────────────────────────────────────────────────────────────────────
echo "── Forum"
POST=$(curl -s -X POST "$API/forum/posts" -H "$CT" -H "$(auth "$UTOK")" -d '{"title":"Smoke Post","content":"smoke content body","category":"general"}')
PID=$(echo "$POST" | jg "['_id']")
ck "POST   /forum/posts"          "$([ -n "$PID" ] && echo 201 || echo ERR)" "201"
ck "GET    /forum/posts"          "$(st "$API/forum/posts")" "200"
ck "GET    /forum/posts/:id"      "$(st "$API/forum/posts/$PID")" "200"
ck "GET    /forum/posts/:id 404"  "$(st "$API/forum/posts/64f1234567890abcdef12345")" "404"
ck "POST   comment"               "$(st -X POST "$API/forum/posts/$PID/comments" -H "$CT" -H "$(auth "$UTOK")" -d '{"content":"nice"}')" "201"
ck "GET    comments"              "$(st "$API/forum/posts/$PID/comments")" "200"
ck "GET    /forum/categories"     "$(st "$API/forum/categories")" "200"
ck "DELETE /forum/posts/:id"      "$(st -X DELETE "$API/forum/posts/$PID" -H "$(auth "$UTOK")")" "200"

# ── Content: events / products / radio / media / about ───────────────────────
echo "── Content"
EV=$(curl -s -X POST "$API/events" -H "$CT" -H "$(auth "$ATOK")" -d '{"title":"Smoke Event","startDate":"2025-12-01T10:00:00Z","category":"cultural"}')
EID=$(echo "$EV" | jg "['_id']")
ck "POST   /events (admin)"   "$([ -n "$EID" ] && echo 201 || echo ERR)" "201"
ck "GET    /events"           "$(st "$API/events")" "200"
ck "GET    /events/:id"       "$(st "$API/events/$EID")" "200"
ck "PUT    /events/:id"       "$(st -X PUT "$API/events/$EID" -H "$CT" -H "$(auth "$ATOK")" -d '{"title":"Smoke Event 2"}')" "200"
ck "DELETE /events/:id"       "$(st -X DELETE "$API/events/$EID" -H "$(auth "$ATOK")")" "200"

PRD=$(curl -s -X POST "$API/products" -H "$CT" -H "$(auth "$ATOK")" -d '{"name":"Smoke Product","price":9.99,"stockQuantity":3}')
PRID=$(echo "$PRD" | jg "['_id']")
ck "POST   /products (admin)" "$([ -n "$PRID" ] && echo 201 || echo ERR)" "201"
ck "PUT    /products/:id"     "$(st -X PUT "$API/products/$PRID" -H "$CT" -H "$(auth "$ATOK")" -d '{"price":5}')" "200"
ck "DELETE /products/:id"     "$(st -X DELETE "$API/products/$PRID" -H "$(auth "$ATOK")")" "200"

MD=$(curl -s -X POST "$API/media" -H "$CT" -H "$(auth "$UTOK")" -d '{"title":"Smoke Media","type":"image","url":"https://x.com/i.jpg"}')
MID=$(echo "$MD" | jg "['_id']")
ck "POST   /media (auth)"     "$([ -n "$MID" ] && echo 201 || echo ERR)" "201"
ck "GET    /media"            "$(st "$API/media")" "200"
ck "DELETE /media/:id"        "$(st -X DELETE "$API/media/$MID" -H "$(auth "$UTOK")")" "200"

RD=$(curl -s -X POST "$API/radio" -H "$CT" -H "$(auth "$ATOK")" -d '{"name":"Smoke Radio","youtubeId":"abc","category":"music"}')
RID=$(echo "$RD" | jg "['_id']")
ck "POST   /radio (admin)"    "$([ -n "$RID" ] && echo 201 || echo ERR)" "201"
ck "DELETE /radio/:id"        "$(st -X DELETE "$API/radio/$RID" -H "$(auth "$ATOK")")" "200"

ck "GET /about"               "$(st "$API/about")" "200"
ck "PUT /about/:section"      "$(st -X PUT "$API/about/mission" -H "$CT" -H "$(auth "$ATOK")" -d '{"content":"our mission"}')" "200"

# ── Payment requests / settings / social / transactions ──────────────────────
echo "── Payment requests, settings, social, transactions"
PQ=$(curl -s -X POST "$API/payment-requests" -H "$CT" -H "$(auth "$UTOK")" -d '{"userEmail":"x@y.com","userName":"X","itemType":"product","itemId":"a","itemName":"B","itemPrice":10,"quantity":1,"totalAmount":10,"paymentMethod":"cash"}')
PQID=$(echo "$PQ" | jg "['_id']")
ck "POST /payment-requests"        "$([ -n "$PQID" ] && echo 201 || echo ERR)" "201"
ck "GET  /payment-requests"        "$(st "$API/payment-requests" -H "$(auth "$UTOK")")" "200"
ck "PUT  /payment-requests status" "$(st -X PUT "$API/payment-requests/$PQID/status" -H "$CT" -H "$(auth "$ATOK")" -d '{"status":"approved"}')" "200"

ck "GET  /settings"                "$(st "$API/settings")" "200"
ck "PUT  /settings (admin)"        "$(st -X PUT "$API/settings" -H "$CT" -H "$(auth "$ATOK")" -d '{"siteName":"Smoke"}')" "200"

SL=$(curl -s -X POST "$API/social-links" -H "$CT" -H "$(auth "$ATOK")" -d '{"platform":"twitter","label":"T","url":"https://t.co/x"}')
SLID=$(echo "$SL" | jg "['_id']")
ck "POST   /social-links (admin)"  "$([ -n "$SLID" ] && echo 201 || echo ERR)" "201"
ck "PUT    /social-links/:id"      "$(st -X PUT "$API/social-links/$SLID" -H "$CT" -H "$(auth "$ATOK")" -d '{"label":"T2"}')" "200"
ck "DELETE /social-links/:id"      "$(st -X DELETE "$API/social-links/$SLID" -H "$(auth "$ATOK")")" "200"

TX=$(curl -s -X POST "$API/transactions" -H "$CT" -H "$(auth "$UTOK")" -d '{"amount":42}')
TXID=$(echo "$TX" | jg "['_id']")
ck "POST   /transactions (auth)"   "$([ -n "$TXID" ] && echo 201 || echo ERR)" "201"
ck "GET    /transactions (admin)"  "$(st "$API/transactions" -H "$(auth "$ATOK")")" "200"
ck "DELETE /transactions/:id"      "$(st -X DELETE "$API/transactions/$TXID" -H "$(auth "$ATOK")")" "200"

# ── Admin / Cloudinary ───────────────────────────────────────────────────────
echo "── Admin & Cloudinary"
ck "GET    /admin/stats (admin)"   "$(st "$API/admin/stats" -H "$(auth "$ATOK")")" "200"
ck "GET    /admin/users (admin)"   "$(st "$API/admin/users" -H "$(auth "$ATOK")")" "200"
# Cloudinary delete: 200 if configured server-side, 503 if not — accept either.
CLD=$(st -X DELETE "$API/cloudinary/kebele/nonexistent" -H "$(auth "$ATOK")")
ck "DELETE /cloudinary (200 or 503)" "$([ "$CLD" = "200" ] || [ "$CLD" = "503" ] && echo ok || echo "$CLD")" "ok"
ck "GET    /unknown route (404)"   "$(st "$API/does-not-exist")" "404"

# ── RBAC: a plain user must be blocked from every admin/moderator route ───────
echo "── RBAC (plain user must be 403)"
ck "POST /events (user)"           "$(st -X POST "$API/events" -H "$CT" -H "$(auth "$UTOK")" -d '{"title":"x","startDate":"2025-01-01"}')" "403"
ck "POST /products (user)"         "$(st -X POST "$API/products" -H "$CT" -H "$(auth "$UTOK")" -d '{"name":"x","price":1}')" "403"
ck "POST /radio (user)"            "$(st -X POST "$API/radio" -H "$CT" -H "$(auth "$UTOK")" -d '{"name":"x"}')" "403"
ck "PUT  /payment status (user)"   "$(st -X PUT "$API/payment-requests/$PQID/status" -H "$CT" -H "$(auth "$UTOK")" -d '{"status":"approved"}')" "403"
ck "PUT  /settings (user)"         "$(st -X PUT "$API/settings" -H "$CT" -H "$(auth "$UTOK")" -d '{"siteName":"x"}')" "403"
ck "GET  /transactions (user)"     "$(st "$API/transactions" -H "$(auth "$UTOK")")" "403"
ck "GET  /admin/stats (user)"      "$(st "$API/admin/stats" -H "$(auth "$UTOK")")" "403"
ck "POST /social-links (user)"     "$(st -X POST "$API/social-links" -H "$CT" -H "$(auth "$UTOK")" -d '{"platform":"x","label":"x","url":"x"}')" "403"
ck "DELETE /cloudinary (user)"     "$(st -X DELETE "$API/cloudinary/x" -H "$(auth "$UTOK")")" "403"

echo
echo "──────────────────────────────────────────────"
printf "  PASSED: %s   FAILED: %s\n" "$PASS" "$FAIL"
echo "──────────────────────────────────────────────"
[ "$FAIL" -eq 0 ] || exit 1
