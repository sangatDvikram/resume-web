#!/usr/bin/env bash
# Smoke-tests the running Next.js web app at localhost:3000.
# Usage: bash smoke.sh [BASE_URL]
# All routes verified on 2026-06-14 against live dev server.

BASE=${1:-http://localhost:3000}
PASS=0; FAIL=0

check() {
  local label=$1 url=$2 expected_status=${3:-200} grep_for=${4:-}
  local body status tmpfile
  tmpfile=$(mktemp)
  status=$(curl -s -o "$tmpfile" -w "%{http_code}" "$url")
  if [ "$status" != "$expected_status" ]; then
    echo "  FAIL  $label — expected HTTP $expected_status, got $status ($url)"
    FAIL=$((FAIL+1))
    rm "$tmpfile"
    return
  fi
  if [ -n "$grep_for" ] && ! grep -q "$grep_for" "$tmpfile"; then
    echo "  FAIL  $label — HTTP $status but missing '$grep_for' in body"
    FAIL=$((FAIL+1))
    rm "$tmpfile"
    return
  fi
  echo "  PASS  $label (HTTP $status)"
  PASS=$((PASS+1))
  rm "$tmpfile"
}

echo "=== Web smoke test: $BASE ==="

check "homepage"        "$BASE/"           200 "Vikram Sangat"
check "blog index"      "$BASE/blog"       200
check "projects index"  "$BASE/projects"   200
check "gallery"         "$BASE/gallery"    200
check "resume page"     "$BASE/resume"     200
check "robots.txt"      "$BASE/robots.txt"  200
check "revalidate 401"  "$BASE/api/revalidate" 405  # GET → 405 (POST-only route)
# Verify POST revalidate rejects bad secret
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/revalidate" \
  -H "Content-Type: application/json" -d '{"tags":["smoke"],"secret":"wrong"}')
if [ "$status" = "401" ]; then
  echo "  PASS  revalidate POST bad secret (401)"
  PASS=$((PASS+1))
else
  echo "  FAIL  revalidate POST bad secret — expected 401, got $status"
  FAIL=$((FAIL+1))
fi

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
