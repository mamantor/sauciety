# Inviting users to Sauciety without creating their account yourself

Yes — Authentik supports this natively via **Invitations**. You send someone a link by
email, they open it, pick their own nickname/username and password, and they're in.
You never touch their credentials. Everything below is done from the Authentik admin
GUI at `https://auth.turbotonio.com` (or `auth.localtest.me` locally) — no config files
to hand-edit except the one-time SMTP setup in step 1.

This instance is running Authentik `2025.12.4` (checked via `docker inspect`), which
supports everything below.

## 0. Prerequisite: Authentik needs to be able to send email itself

Right now neither `docker-compose.prod.yml` nor `docker-compose.local-authentik.yml`
configure SMTP, so Authentik can't send anything yet — you'd have to copy the invite
link manually. To let it send the email for you, add these environment variables to
the `authentik-server` (and `authentik-worker`) services in `docker-compose.prod.yml`:

```yaml
environment:
  AUTHENTIK_EMAIL__HOST: smtp.your-provider.com
  AUTHENTIK_EMAIL__PORT: '587'
  AUTHENTIK_EMAIL__USERNAME: your-smtp-username
  AUTHENTIK_EMAIL__PASSWORD: your-smtp-password
  AUTHENTIK_EMAIL__USE_TLS: 'true'
  AUTHENTIK_EMAIL__USE_SSL: 'false'
  AUTHENTIK_EMAIL__FROM: authentik@turbotonio.com
```

Put the password in `.env.prod` and reference it as `${AUTHENTIK_SMTP_PASSWORD}` rather
than hardcoding it, same pattern as `MONGO_ROOT_PASSWORD`. Any SMTP provider works
(Gmail's `smtp-relay.gmail.com:587`, Mailgun, your domain registrar's mail, etc.) — pick
whichever you already have credentials for. Redeploy after adding these; no data is
affected, it only adds the ability to send mail.

If you'd rather not deal with SMTP right now, you can skip this section entirely and
just copy the invite link Authentik generates, then send it yourself however you like
(WhatsApp, your own email client, etc.) — steps 1–3 below still work, you just do the
"send it to them" part manually instead of clicking "Send via Email" in step 3.

## 1. Create an enrollment flow (one-time setup)

This is the sequence of screens the invited person will see: enter a nickname, pick a
password, done. Authentik doesn't ship this pre-built for invitations, so it's built
once, then reused for every future invite.

In the admin interface: **Flows & Stages → Stages → Create**, create these three:

1. **Prompt stage** — add the fields you want them to fill in: a text field for
   `username` (or `name`, whatever you want displayed), and a password field for
   `password` (with a password-confirm field alongside it). This is the actual form
   they'll see.
2. **User Write stage** — leave defaults. This is what actually creates the account
   from whatever the Prompt stage collected.
3. **User Login stage** — optional, logs them straight into Sauciety right after
   enrolling instead of making them log in separately.

Then **Flows & Stages → Flows → Create**:

- Name: e.g. `sauciety-invite-enrollment`
- Designation: **Enrollment**
- Once created, open it and go to its **Stage Bindings** tab, and bind, in this order:
  1. An **Invitation stage** first (this is what makes the flow invite-only — leave
     "Continue flow without invitation" **unchecked**, otherwise anyone who finds the
     URL could self-enroll without an invite)
  2. Your Prompt stage
  3. Your User Write stage
  4. Your User Login stage (if you added it)

## 2. Create the invitation

**Directory → Invitations → New Invitation → "with Existing Enrollment Flow..."**,
then pick `sauciety-invite-enrollment` from step 1. Fill in:

- **Name**: anything (slug-style, e.g. `invite-cousin-marie`)
- **Expires**: how long the link stays valid (defaults to 48h — bump it up if you're
  inviting someone who won't check their email right away)
- **Single use**: leave checked, so the link can't be reused by someone else once your
  invitee has enrolled

## 3. Send it

The invitation wizard's last step offers **Send via Email** — enter their address,
pick the default "Invitation" template, send. This only works if you did step 0.

Without step 0, copy the generated invite URL instead (looks like
`https://auth.turbotonio.com/if/flow/sauciety-invite-enrollment/?itoken=...`) and send
it to them yourself.

## What they experience

They open the link, land on your Prompt stage, type in a nickname and password, and
their Authentik account exists. Next time they hit `sauciety.turbotonio.com` and sign
in via the existing "Connexion" button, Authentik/Traefik's forward-auth recognizes
them like any other user — nothing on the Sauciety side needs to change, since it
already just trusts whatever Authentik/Traefik hands it via `event.locals.auth()`.

## Sources

- [Invitations | authentik docs](https://docs.goauthentik.io/users-sources/user/invitations/)
- [Invitation stage | authentik docs](https://docs.goauthentik.io/add-secure-apps/flows-stages/stages/invitation/)
- [Email configuration | authentik docs](https://docs.goauthentik.io/install-config/email/)
