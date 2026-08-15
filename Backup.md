# Backing up the Mongo database

Backups are done with `scripts/backup-mongo.sh`, run nightly via cron on the Pi.

## What the script does

1. `cd`s into the repo and runs `docker compose -f docker-compose.prod.yml exec -T mongo
mongodump --archive --gzip` inside the running `mongo` container — this dumps every
   collection (including the recipe documents' embedded image `Binary` data) into a
   single gzip archive on stdout.
2. The DB password is **not** read from `.env`/`.env.prod` by the script — it reuses
   `MONGO_INITDB_ROOT_PASSWORD`, which is already set inside the mongo container's own
   environment. The script only ever needs `docker compose exec` access, nothing else.
3. The archive is first written to a `.tmp` file, then renamed to its final name once
   the dump finishes — so a crash or a killed run never leaves a corrupt file at the
   expected filename.
4. Any backup older than `RETENTION_DAYS` (default 14) is deleted at the end of the run.

## Where backups are stored

On disk at `$BACKUP_DIR` (default `/home/pi/backups/mongo`), one file per run, named:

```
sauciety-<YYYYMMDD-HHMMSS>.archive.gz
```

Both `BACKUP_DIR` and `RETENTION_DAYS` can be overridden via environment variables when
invoking the script (see the crontab line below).

**Caveat:** backups currently live only on the Pi's own disk/SD card. If the Pi itself
dies or the card corrupts, the backups go with it. Worth adding an `rclone`/`rsync` step
to copy the latest archive to a second location (NAS, another disk, cloud storage) —
not yet done.

## Cron schedule

Installed via `crontab -e` (not a file under `/etc/cron.d`), nightly at 3:15am:

```
15 3 * * * BACKUP_DIR=/home/pi/backups/mongo /home/pi/sauciety/scripts/backup-mongo.sh >> /home/pi/backups/mongo/backup.log 2>&1
```

Adjust the repo path (`/home/pi/sauciety`) if it differs on the actual Pi. Check the
job is installed with `crontab -l`, and check `cron`/`crond` is actually running with
`systemctl status cron`.

## Restoring from a backup

```bash
cd /path/to/sauciety   # wherever docker-compose.prod.yml lives
docker compose -f docker-compose.prod.yml exec -T mongo mongorestore \
  --archive --gzip \
  --username root --password "$MONGO_ROOT_PASSWORD" \
  --authenticationDatabase admin \
  < /home/pi/backups/mongo/sauciety-<timestamp>.archive.gz
```

`$MONGO_ROOT_PASSWORD` here must be set in your shell (it's the same value as
`MONGO_ROOT_PASSWORD` in `.env`) — unlike the backup script, `mongorestore` is invoked
from the host shell via `docker compose exec`, not from inside the container, so it
doesn't automatically inherit `MONGO_INITDB_ROOT_PASSWORD`.

By default `mongorestore` merges into existing collections rather than wiping them
first. To fully replace current data with the backup's contents, add `--drop` to the
command above — this deletes each collection before restoring it, so only do this
intentionally.
