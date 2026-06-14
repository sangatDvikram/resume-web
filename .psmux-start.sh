#!/usr/bin/env bash
# Portfolio CMS — psmux session launcher
# Usage: bash .psmux-start.sh [--no-attach]

PROJECT_DIR="/d/Projects/resume-web"
SESSION="portfolio"
CONF="$PROJECT_DIR/.psmux.conf"

# Already inside psmux — bail
[ -n "$TMUX" ] && exit 0

# Session exists — just attach
if psmux has-session -t "$SESSION" 2>/dev/null; then
  [ "$1" = "--no-attach" ] && exit 0
  exec psmux attach -t "$SESSION"
fi

# Create session (detached), window 1: api
psmux -f "$CONF" new-session -d -s "$SESSION" -n "api" -c "$PROJECT_DIR"
psmux send-keys -t "$SESSION:api" "yarn api" Enter

# Window 2: web
psmux new-window -t "$SESSION" -n "web" -c "$PROJECT_DIR"
psmux send-keys -t "$SESSION:web" "yarn web" Enter

# Window 3: mcp
psmux new-window -t "$SESSION" -n "mcp" -c "$PROJECT_DIR"
psmux send-keys -t "$SESSION:mcp" "yarn mcp" Enter

# Window 4: shell (interactive, starts at project root)
psmux new-window -t "$SESSION" -n "shell" -c "$PROJECT_DIR"

# Land on shell window
psmux select-window -t "$SESSION:shell"

[ "$1" = "--no-attach" ] && exit 0
exec psmux attach -t "$SESSION"
