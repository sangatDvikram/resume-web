#!/usr/bin/env bash
# Smoke-tests the running API at localhost:3001.
# Usage: bash smoke.sh [BASE_URL]
# All commands in this script were verified against the live API on 2026-06-14.

BASE=${1:-http://localhost:3001}
PASS=0; FAIL=0

check() {
  local label=$1 url=$2 expected_status=${3:-200}
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$status" = "$expected_status" ]; then
    echo "  PASS  $label ($status)"
    PASS=$((PASS+1))
  else
    echo "  FAIL  $label — expected $expected_status, got $status ($url)"
    FAIL=$((FAIL+1))
  fi
}

echo "=== API smoke test: $BASE ==="

check "health"          "$BASE/v1/health"
check "resume"          "$BASE/v1/resume/default"
check "blog list"       "$BASE/v1/blog"
check "projects list"   "$BASE/v1/projects"
check "gallery albums"  "$BASE/v1/gallery/albums"
check "blog tags"       "$BASE/v1/blog/tags"
check "auth 401"        "$BASE/v1/auth/me" 401

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
