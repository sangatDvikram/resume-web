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

# Create session (detached), single window "dev" with 4 panes:
#   ┌──────────┬──────────┐
#   │   api    │   web    │
#   ├──────────┼──────────┤
#   │   mcp    │  shell   │
#   └──────────┴──────────┘

# Pane 0 (top-left): api
psmux -f "$CONF" new-session -d -s "$SESSION" -n "dev" -c "$PROJECT_DIR"
psmux send-keys -t "$SESSION:dev.0" "yarn api" Enter

# Pane 1 (top-right): web — split right from pane 0
psmux split-window -t "$SESSION:dev.0" -h -c "$PROJECT_DIR"
psmux send-keys -t "$SESSION:dev.1" "yarn web" Enter

# Pane 2 (bottom-left): mcp — split down from pane 0
psmux split-window -t "$SESSION:dev.0" -v -c "$PROJECT_DIR"
psmux send-keys -t "$SESSION:dev.2" "yarn mcp" Enter

# Pane 3 (bottom-right): shell — split down from pane 1
psmux split-window -t "$SESSION:dev.1" -v -c "$PROJECT_DIR"

# Even out all pane sizes
psmux select-layout -t "$SESSION:dev" tiled

# Land on shell pane
psmux select-pane -t "$SESSION:dev.3"

[ "$1" = "--no-attach" ] && exit 0
exec psmux attach -t "$SESSION"
