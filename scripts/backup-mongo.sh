#!/usr/bin/env bash
set -euo pipefail

# Dumps the sauciety Mongo container to a gzip archive on the host and
# prunes backups older than RETENTION_DAYS. Meant to run via cron on the
# host running docker-compose.prod.yml.

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="${BACKUP_DIR:-/home/pi/backups/mongo}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"

timestamp="$(date +%Y%m%d-%H%M%S)"
dest="$BACKUP_DIR/sauciety-$timestamp.archive.gz"
tmp="$dest.tmp"

cd "$REPO_DIR"

# Password is read from the mongo container's own env (MONGO_INITDB_ROOT_PASSWORD),
# so this script never needs to touch .env/.env.prod itself.
docker compose -f "$COMPOSE_FILE" exec -T mongo sh -c \
  'mongodump --archive --gzip --username root --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin' \
  > "$tmp"

mv "$tmp" "$dest"
echo "Backup written to $dest ($(du -h "$dest" | cut -f1))"

find "$BACKUP_DIR" -name 'sauciety-*.archive.gz' -mtime "+$RETENTION_DAYS" -delete
