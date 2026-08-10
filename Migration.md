# Upgrading prod's Authentik to 2026.5.6

This mirrors exactly what was done and verified on the local stack (`docker-compose.local-authentik.yml`, currently running `2026.5.6` with no issues) — same image, same kind of restart, just on the Pi against the real database. Do these from the directory on the Pi where `docker-compose.prod.yml` lives, in order.

## 0. Why

`2025.12.4` (what prod runs now) predates the invitation wizard's "Send via Email" step, added in `2026.5`. That's the only reason for this — nothing broken needs fixing.

## 1. Back up the Authentik database first

Non-negotiable before touching prod, even though you're confident — this costs seconds and gives you a real rollback path if anything goes wrong. This uses the `authentik-db` **service** name (not a container name, which varies), so it works regardless of what Compose ends up calling the container:

```bash
docker compose -f docker-compose.prod.yml exec -T authentik-db \
  pg_dump -U authentik authentik > authentik-backup-$(date +%Y%m%d-%H%M%S).sql
```

Confirm it's not empty before continuing:

```bash
ls -la authentik-backup-*.sql
```

## 2. Bump the image version

Open `docker-compose.prod.yml` and change both occurrences (the `authentik-server` and `authentik-worker` services) from:

```yaml
image: ghcr.io/goauthentik/server:2025.12.4
```

to:

```yaml
image: ghcr.io/goauthentik/server:2026.5.6
```

Or from the shell:

```bash
sed -i 's|ghcr.io/goauthentik/server:2025.12.4|ghcr.io/goauthentik/server:2026.5.6|g' docker-compose.prod.yml
grep "goauthentik/server:" docker-compose.prod.yml   # should show 2026.5.6 twice
```

## 3. Pull the new image

```bash
docker compose -f docker-compose.prod.yml pull authentik-server authentik-worker
```

## 4. Recreate the two containers

Only `authentik-server` and `authentik-worker` need to restart — everything else (Postgres, Redis, the app, Mongo, Traefik) is untouched:

```bash
docker compose -f docker-compose.prod.yml up -d
```

Compose will report `Recreate` only for those two; everything else should say `Running` unchanged.

## 5. Verify

```bash
docker compose -f docker-compose.prod.yml ps authentik-server authentik-worker
docker compose -f docker-compose.prod.yml logs authentik-server --tail 50
docker compose -f docker-compose.prod.yml logs authentik-worker --tail 50
```

Both should show `healthy` and no error-level lines (a one-time `ak_groups is deprecated` warning is expected and harmless — that's authentik's own internal code, not yours).

Then, in a browser:

- `https://auth.turbotonio.com` loads and you can log into the admin UI.
- `https://sauciety.turbotonio.com` still requires login as before (forward-auth didn't get silently disabled) — this is the one thing worth actually checking by eye, since 2026.5 changed a default-access flag (`core_default_app_access`) that could theoretically affect this.
- Directory → Invitations → New Invitation now shows the **Send via Email** step.

## If something goes wrong: rollback

```bash
sed -i 's|ghcr.io/goauthentik/server:2026.5.6|ghcr.io/goauthentik/server:2025.12.4|g' docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d
```

If the database itself got migrated into a broken state (unlikely, but the reason step 1 exists), restore the dump:

```bash
cat authentik-backup-<timestamp>.sql | docker compose -f docker-compose.prod.yml exec -T authentik-db \
  psql -U authentik authentik
```
