#!/usr/bin/env bash
# Runs on the VPS, streamed over SSH by .github/workflows/deploy-app.yml:
#   ssh vps "bash -s -- activate <deploy_path> <release_id>" < deploy/release.sh
#   ssh vps "bash -s -- rollback <deploy_path> <release_id>" < deploy/release.sh
#
# activate: unpack incoming/<release_id>.tar.gz into releases/<release_id>,
#           point `current` at it, restart PM2, health-check, keep 3 releases.
#           If the health check fails it restores the previous release.
# rollback: the release passed the local health check but failed the public
#           smoke test; point `current` back at the previous release.
set -euo pipefail

ACTION="${1:?action required (activate|rollback)}"
DEPLOY_PATH="${2:?deploy path required}"
RELEASE_ID="${3:?release id required}"

APP_NAME="techlumous-app"
KEEP_RELEASES=3
HEALTH_URL="http://127.0.0.1:3000/login"

RELEASES="$DEPLOY_PATH/releases"
CURRENT="$DEPLOY_PATH/current"
NEW_RELEASE="$RELEASES/$RELEASE_ID"
TARBALL="$DEPLOY_PATH/incoming/$RELEASE_ID.tar.gz"

log() { echo "[release] $*"; }
fail() { echo "[release] ERROR: $*" >&2; exit 1; }

command -v pm2 >/dev/null || fail "pm2 not found in PATH for $(whoami)"
command -v curl >/dev/null || fail "curl not found in PATH"

# Atomic swap: build the new symlink beside the old one, then rename over it.
point_current_to() {
  ln -sfn "$1" "$CURRENT.tmp"
  mv -Tf "$CURRENT.tmp" "$CURRENT"
}

start_app() {
  pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
  pm2 start "$(readlink -f "$CURRENT")/ecosystem.config.cjs"
}

healthy() {
  for _ in $(seq 1 30); do
    if curl -fsS -o /dev/null --max-time 5 "$HEALTH_URL"; then
      return 0
    fi
    sleep 2
  done
  return 1
}

restore() {
  local previous="$1"
  if [ -n "$previous" ] && [ -d "$previous" ]; then
    log "Restoring previous release $(basename "$previous")"
    point_current_to "$previous"
    start_app
    if healthy; then
      pm2 save
      log "Previous release is serving again"
    else
      log "Previous release is also unhealthy, check: pm2 logs $APP_NAME"
    fi
  else
    log "No previous release to restore; stopping the app"
    pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
    rm -f "$CURRENT"
  fi
}

prune() {
  local active
  active="$(readlink -f "$CURRENT")"
  ls -1 "$RELEASES" | sort -r | tail -n +"$((KEEP_RELEASES + 1))" |
    while read -r old; do
      [ "$RELEASES/$old" = "$active" ] && continue
      log "Removing old release $old"
      rm -rf "${RELEASES:?}/$old"
    done
}

case "$ACTION" in
  activate)
    [ -f "$DEPLOY_PATH/shared/.env" ] || fail "$DEPLOY_PATH/shared/.env is missing"
    [ -f "$TARBALL" ] || fail "$TARBALL not found"

    mkdir -p "$NEW_RELEASE"
    tar -xzf "$TARBALL" -C "$NEW_RELEASE"
    rm -f "$TARBALL"

    previous="$(readlink -f "$CURRENT" 2>/dev/null || true)"

    log "Activating $RELEASE_ID"
    point_current_to "$NEW_RELEASE"
    start_app

    if healthy; then
      pm2 save
      prune
      log "Release $RELEASE_ID is live"
      exit 0
    fi

    log "Health check failed for $RELEASE_ID; last log lines:"
    pm2 logs "$APP_NAME" --nostream --lines 50 || true
    restore "$previous"
    rm -rf "$NEW_RELEASE"
    exit 1
    ;;

  rollback)
    previous="$(ls -1 "$RELEASES" | sort | grep -vx "$RELEASE_ID" | tail -n 1 || true)"
    restore "${previous:+$RELEASES/$previous}"
    rm -rf "$NEW_RELEASE"
    log "Rolled back from $RELEASE_ID"
    ;;

  *)
    fail "unknown action $ACTION"
    ;;
esac
