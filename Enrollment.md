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
link manually.

**Yes, your Proton subscription can do this** — Proton has a feature called
[SMTP submission](https://proton.me/support/smtp-submission) that's built exactly for
this case (apps/servers sending mail programmatically), separate from Proton Mail
Bridge (which is only for desktop mail clients like Outlook and doesn't apply here).
It's included on all paid Proton plans that have a custom domain attached.

**One-time setup on the Proton side:**

1. If you haven't already, add `turbotonio.com` as a custom domain in Proton
   (**Settings → Go to settings → Domain names**) and verify it via the DNS records
   Proton gives you, then create an address on it to send from, e.g.
   `authentik@turbotonio.com`.
2. **Settings → All settings → Proton Mail → IMAP/SMTP → SMTP tokens → Generate token.**
   Name it something like `authentik-sauciety`, pick the `authentik@turbotonio.com`
   address, confirm with your account password. The token is shown once — copy it
   somewhere safe (it's not your Proton password, and there's no way to view it again
   later, only revoke and regenerate).

**Then on the Sauciety side**, add these environment variables to the
`authentik-server` (and `authentik-worker`) services in `docker-compose.prod.yml`:

```yaml
environment:
  AUTHENTIK_EMAIL__HOST: smtp.protonmail.ch
  AUTHENTIK_EMAIL__PORT: '587'
  AUTHENTIK_EMAIL__USERNAME: authentik@turbotonio.com
  AUTHENTIK_EMAIL__PASSWORD: ${AUTHENTIK_SMTP_TOKEN}
  AUTHENTIK_EMAIL__USE_TLS: 'true'
  AUTHENTIK_EMAIL__USE_SSL: 'false'
  AUTHENTIK_EMAIL__FROM: authentik@turbotonio.com
```

Put the SMTP token in `.env.prod` as `AUTHENTIK_SMTP_TOKEN=...`, same pattern as
`MONGO_ROOT_PASSWORD` — never commit it. Redeploy after adding these; no data is
affected, it only adds the ability to send mail.

(Any other SMTP provider works the same way if you'd rather not use Proton for this —
Gmail's `smtp-relay.gmail.com:587`, Mailgun, etc. — just swap the host/username/token.)

If you'd rather not deal with SMTP right now, you can skip this section entirely and
just copy the invite link Authentik generates, then send it yourself however you like
(WhatsApp, your own email client, etc.) — steps 1–3 below still work, you just do the
"send it to them" part manually instead of clicking "Send via Email" in step 3.

## 1. Create an enrollment flow (one-time setup)

This is the sequence of screens the invited person will see: enter a nickname, pick a
password, done. Authentik doesn't ship this pre-built for invitations, so it's built
once, then reused for every future invite.

In the admin interface: **Flows & Stages → Stages → Create**, create these five
(binding them to a flow is a separate step further down — creating a stage here just
makes it exist, it won't do anything until it's bound):

1. **Invitation stage** — this is what makes the flow invite-only. The important
   setting is right on this creation form: **"Continue flow without invitation"** —
   leave it **unchecked**. If it's checked, anyone who finds the flow's URL can
   self-enroll without ever having a valid invite token; unchecked means the flow
   refuses to continue past this stage without one.
2. **Prompt stage** — this is the actual form they'll see, but the fields themselves
   (confusingly, Authentik calls them "Prompts" too, distinct from the "Prompt stage"
   that groups them) are separate objects, not something you type directly into the
   stage. Create them first under **Flows & Stages → Prompts → Create**:
   - A field with key `username` (or `name`), type **Text**
   - A field with key `password`, type **Password**, plus a `password_repeat` field
     of the same type for confirmation
   - A field with key `email` — not shown in the form, but this is what lets the
     invite's target address land on the user record (see the invitation step
     below); create it even if you don't fill it in on every invite. Concretely,
     on this field's own creation form:
     - **Field Key**: `email`
     - **Label**: whatever, it won't be shown (e.g. `Email`)
     - **Type**: select **Hidden** from the dropdown
     - **Placeholder**: leave empty

   Then open the **Prompt stage** itself, where you'll see a dual list (Available /
   Selected) rather than a place to type field details directly — that's expected,
   just move the three fields you created above into "Selected".

   Honest caveat on the Hidden field specifically: Authentik's own docs note that a
   Hidden field normally takes its value from its **Placeholder**, and it's not fully
   confirmed here that the invitation's `fixed_data.email` (next section) reliably
   overrides that at runtime rather than just leaving it blank. Send yourself one
   test invite with `email: you@example.com` in Custom attributes and check
   **Directory → Users → (your test user)** afterward to confirm the email actually
   landed before relying on this for real invites.

3. **User Write stage** — leave defaults. This is what actually creates the account
   from whatever the Prompt stage collected.
4. **User Login stage** — optional, but recommended: logs them into Authentik right
   after enrolling instead of making them log in separately. Combined with the
   Redirect stage below, this means they land on Sauciety already authenticated —
   no separate login step at all.
5. **Redirect stage** — sends their browser to Sauciety once everything above is
   done. Set **Static target** to `https://sauciety.turbotonio.com/` (any other value
   than the special `ak-flow://...` format runs it in "static" mode, i.e. a fixed
   URL rather than handing off to another flow, which is what you want here).

Then **Flows & Stages → Flows → Create**:

- Name: e.g. `sauciety-invite-enrollment`
- Designation: **Enrollment**
- Once created, open it and go to its **Stage Bindings** tab, and bind the five
  stages you just created. Each binding asks for an **Order** — this is what
  actually determines the sequence (Authentik runs bindings lowest-first), so don't
  leave them all at `0`, give each one a distinct increasing number:
  1. Your Invitation stage — order `10`
  2. Your Prompt stage — order `20`
  3. Your User Write stage — order `30`
  4. Your User Login stage (if you added it) — order `40`
  5. Your Redirect stage — order `50`

**Don't attach any policies to these bindings.** Each stage binding has its own
**Policy / Group / User Bindings** sub-tab, and Authentik's policy picker there lists
its own internal system policies alongside yours (e.g. `default-oobe-prefill-user`,
`default-oobe-check-username`). Despite the generic-sounding names, those are only
meant for Authentik's own first-boot setup wizard (the one that creates `akadmin`) —
they assume context that only exists during that specific bootstrap and will throw
`KeyError: 'flow_plan'` or an `AnonymousUser has no attribute ...` error for anyone
enrolling through this flow if attached here. Leave every binding's policy list empty;
the Invitation stage alone is what gates the flow.

## 2. Create the invitation

**Directory → Invitations → New Invitation → "with Existing Enrollment Flow..."**,
then pick `sauciety-invite-enrollment` from step 1. Fill in:

- **Name**: anything (slug-style, e.g. `invite-cousin-marie`)
- **Expires**: how long the link stays valid (defaults to 48h — bump it up if you're
  inviting someone who won't check their email right away)
- **Single use**: leave checked, so the link can't be reused by someone else once your
  invitee has enrolled
- **Custom attributes**: this is where the recipient's email actually gets attached to
  them. It's not linked to the "Send via Email" address you'll type in the next step —
  those are two separate fields, so you're typing the same address twice.

  It's a raw text box, but it needs to be **strict JSON with both the key and the
  value quoted** — unquoted keys (`{email: "..."}`) or YAML-style block syntax
  (`email: cousin@example.com`) don't parse and silently produce garbage instead of
  an error. This is the form that actually works:

  ```json
  { "email": "cousin@example.com" }
  ```

  Either way, this fills the hidden `email` prompt field from step 1, and the User
  Write stage picks it up as the new user's email automatically, since `email` is one
  of the field keys it recognizes directly on the User model.

  Note this only sets it on the **Authentik** user record. Sauciety itself doesn't
  currently read email at all — `session.user.email` is deliberately left commented
  out in `src/auth.ts` — so this is purely for your own admin-side records (Directory →
  Users) unless you later wire that field through to Sauciety too.

## 3. Send it

The invitation wizard's last step offers **Send via Email** — enter their address
(same one as **Custom attributes** above), pick the default "Invitation" template,
send. This only works if you did step 0.

Without step 0, copy the generated invite URL instead (looks like
`https://auth.turbotonio.com/if/flow/sauciety-invite-enrollment/?itoken=...`) and send
it to them yourself.

## 4. The invite email is branded (already done)

`custom-templates/sauciety-invitation.html` exists in the repo — a Sauciety-branded
version of Authentik's default invitation email: cream page background, white card,
Playfair-Display-style serif heading, the site's terracotta `#cc5933` accent on the
button, and the Sauciety logo, styled to echo the home page's look (the small
line-flanked icon above the "Au Menu" heading). Both `authentik-server` and
`authentik-worker` mount `./custom-templates:/templates` — the fixed container path
Authentik reads custom templates from, no admin-UI upload option — in both
`docker-compose.local-authentik.yml` and `docker-compose.prod.yml`. Verified on the
local stack: it shows up as **"Custom Template: sauciety-invitation.html"** in the
invitation's Send-via-Email template picker, alongside the built-in ones. Nothing extra
to do on the Pi beyond the normal `git pull` + redeploy from `Migration.md` — the
mount and the template file come along with it.

**To actually use it**: when sending an invitation (step 3 above), the **Template**
field defaults to the built-in "Invitation" — change it to
**"Custom Template: sauciety-invitation.html"**.

**It's a full standalone HTML document, not an extension of Authentik's `base.html`
layout.** An earlier version extended Authentik's shared
[`base.html`](https://github.com/goauthentik/authentik/blob/main/authentik/stages/email/templates/email/base.html)
and only overrode its `content`/`sub_content` blocks, but that layout hardcodes a
"Powered by authentik" footer and a page background outside of those blocks — no way
to override either without abandoning `{% extends %}` entirely, which is what this
version does. Available variables: `{{ host }}`, `{{ url }}` (the accept-invite link —
keep this one, it's the whole point), and `{{ expires }}` (formatted with Django's
built-in `date` filter — **not** `naturaltime`, which needs `django.contrib.humanize`
in `INSTALLED_APPS` and isn't available in Authentik's Django setup; using it throws
`TemplateSyntaxError: Invalid filter: 'naturaltime'` and silently kills the whole
send). After editing, only the worker needs a restart to pick up the change — no
rebuild.

**The logo is a plain hosted `<img>` pointing at `https://sauciety.turbotonio.com/favicon.png`**
— not pulled from Authentik's Brand config, and not inlined as a base64 `data:` URI
either (that was tried first and rejected: several mail clients, notably Outlook,
strip `data:` URIs from HTML email entirely, rendering a broken-image icon even
though it looks fine in a browser). The `cid:logo` mechanism `base.html` normally
relies on attaches whatever PNG lives at the fixed in-container path
`web/dist/assets/icons/icon_left_brand.png` (see
[`stages/email/utils.py`](https://github.com/goauthentik/authentik/blob/main/authentik/stages/email/utils.py)) —
that's Authentik's own default admin-UI brand icon baked into the image, not
necessarily whatever's set as the "Turbo Tonio" brand's Logo in **System → Brands**;
there's no confirmed mechanism by which uploading a Brand logo overwrites that file —
so that path was skipped too. `static/favicon.png` in this repo (served by SvelteKit
at the app's root, so publicly reachable at that URL with no auth) happens to already
be byte-identical to `custom-data/media/public/branding/sauciety-logo.png`, which is
how the email template ended up pointing at it instead of adding a duplicate file. To
swap the logo image later: replace `static/favicon.png` (or point the template's
`<img src>` at wherever the new file is publicly hosted).

If you ever need to redo the `/data` mount from scratch (e.g. on the Pi): the
directory must be empty when `authentik-server` first starts against it, or the Files
page (**Customization → Files**) fails with "Configured file backend does not support
file management" — a known rough edge
([goauthentik/authentik#19546](https://github.com/goauthentik/authentik/issues/19546)).
Pre-populating `media/public/...` before first boot doesn't work around it; start
empty, let Authentik create the structure, upload after.

## 5. Give them access to Sauciety

**Group, not a custom stage.** Don't try to make the flow add users "to the app"
directly — there's no such thing as a generic stage for that, and reaching for one
would mean writing a custom expression policy for something Authentik already has a
clean, built-in path for: a group the application is bound to, plus a setting on the
User Write stage you already have to auto-add new enrollees to that group. Two
one-time pieces:

**a. Create a group and bind it to the Sauciety application**

1. **Directory → Groups → Create.** Name it something like `sauciety-users`.
2. **Applications → Applications**, open your Sauciety application, go to its
   **Policy / Group / User Bindings** tab, **Create or bind... → Bind a group**, pick
   `sauciety-users`.

   Worth knowing before you do this: **by default, an application with zero bindings
   is open to every Authentik user, not just people you've explicitly granted
   access.** If you've never touched this tab for Sauciety, anyone who's ever
   authenticated against this Authentik instance — for anything, not just
   Sauciety — currently has access to your recipes. Binding the group above is what
   actually makes access meaningful, not just an organizational nicety.

**b. Auto-add new enrollees to that group**

Open your `sauciety-invite-enrollment` flow's Stage Bindings, click into the **User
Write stage** binding, and set its **Create users group** field to `sauciety-users`.
From then on, anyone who completes this enrollment flow is automatically a member and
already has access the moment they finish — no separate step per invite.

## What they experience

They open the link, land on your Prompt stage, type in a nickname and password, and
their Authentik account exists — already in the `sauciety-users` group if you set up
step 4b. With the User Login + Redirect stages from step 1, that's the whole thing:
they never see a separate login screen, the flow logs them into Authentik and drops
them straight onto `sauciety.turbotonio.com`, already recognized by Authentik/Traefik's
forward-auth. Nothing on the Sauciety side needs to change — it already just trusts
whatever Authentik/Traefik hands it via `event.locals.auth()`.

## Sources

- [Invitations | authentik docs](https://docs.goauthentik.io/users-sources/user/invitations/)
- [Invitation stage | authentik docs](https://docs.goauthentik.io/add-secure-apps/flows-stages/stages/invitation/)
- [Email configuration | authentik docs](https://docs.goauthentik.io/install-config/email/)
- [SMTP submission | Proton support](https://proton.me/support/smtp-submission)
- [Custom domain with Proton Mail | Proton support](https://proton.me/support/custom-domain)
- [Manage applications | authentik docs](https://docs.goauthentik.io/add-secure-apps/applications/manage_apps/)
- [User write stage | authentik docs](https://docs.goauthentik.io/add-secure-apps/flows-stages/stages/user_write/)
- [Redirect stage | authentik docs](https://docs.goauthentik.io/add-secure-apps/flows-stages/stages/redirect/)
- [Prompt stage | authentik docs](https://docs.goauthentik.io/add-secure-apps/flows-stages/stages/prompt/)
- [Architecture | authentik docs](https://docs.goauthentik.io/core/architecture/)
- [default invitation.html template | authentik source](https://github.com/goauthentik/authentik/blob/main/authentik/stages/email/templates/email/invitation.html)
- [default base.html email layout | authentik source](https://github.com/goauthentik/authentik/blob/main/authentik/stages/email/templates/email/base.html)
- [Files | authentik docs](https://docs.goauthentik.io/customize/files/)
- [File picker values | authentik docs](https://docs.goauthentik.io/customize/file-picker/)
- [Errors when uploading icons | authentik docs](https://docs.goauthentik.io/troubleshooting/image_upload/)
- ["Configured file backend does not support file management" | authentik#19546](https://github.com/goauthentik/authentik/issues/19546)
