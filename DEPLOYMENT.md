# ScamCheck KH — Deployment Guide (Private Alpha)

Step-by-step instructions to deploy ScamCheck KH for private alpha testing.

---

## A. Overview

ScamCheck KH is made of three parts:

| Part | What it is | Where it runs |
| :--- | :--- | :--- |
| **Frontend** | React + TypeScript SPA (Vite, Tailwind) | Served by the Node/Express server |
| **App server** | Express server (`server.ts`) that serves the SPA **and** hosts the `/api/check` endpoint (rule-based analyzer + optional Gemini explanation) | **DigitalOcean** (App Platform or Droplet) |
| **Backend data** | Convex (reports, feedback, lessons, scam checks, admin queries) | Convex Cloud |

Key facts:
- The **rule-based scam analyzer** makes every decision (risk score, level, detected type, signals). It runs server-side inside `/api/check`.
- **Gemini** is used **only** to reword explanations, and **only if** `GEMINI_API_KEY` is set. Without it, the app uses built-in bilingual fallback explanations.
- **Convex** stores reports/feedback and powers the admin pages, protected server-side by `ADMIN_PASSCODE`.

> ⚠️ **Architecture note — this app needs a Node host (which DigitalOcean provides).**
> The browser calls a **same-origin** endpoint `POST /api/check` (see `src/App.tsx`).
> That endpoint is provided by the Express server in `server.ts`, **not** by Convex
> and **not** by static files. A **static-only** host would return 404 for
> `/api/check`. DigitalOcean App Platform / Droplet runs the Express server, so the
> frontend and `/api/check` are served from the same origin and everything works.

---

## B. Local development

```bash
# 1. Install dependencies
npm install

# 2. Start Convex in a SEPARATE terminal (keep it running while testing)
npx convex dev

# 3. Start the app (Express server + Vite middleware) in another terminal
npm run dev
```

- The app runs on **http://localhost:3000**.
- `npx convex dev` must be running for backend features (reports, feedback, admin pages) to work locally. It also auto-generates `convex/_generated/`.
- The scam checker and `/api/check` work as soon as `npm run dev` is running, even without Convex or Gemini configured.

---

## C. Environment variables

There are **three different places** env vars live. Putting a secret in the wrong place is a security risk.

### 1. Frontend (safe to expose — bundled into the browser)
```env
# .env.local (local) and the host's frontend env (production)
VITE_CONVEX_URL=<your_convex_url>      # e.g. https://your-project.convex.cloud
```
Optional frontend hint (not used for authorization):
```env
VITE_ADMIN_EMAIL=<admin_email>         # only shown on the admin gate screen
```

### 2. App server / DigitalOcean (server-side secrets)
```env
# Set on the DigitalOcean app that runs server.ts (NOT in VITE_ vars)
GEMINI_API_KEY=<your_gemini_api_key>   # optional; enables AI-worded explanations
NODE_ENV=production
# PORT is injected automatically by DigitalOcean App Platform.
# The server reads process.env.PORT and falls back to 3000 locally.
```
`GEMINI_API_KEY` is the exact name the code reads (`process.env.GEMINI_API_KEY` in `server.ts`).

### 3. Convex server (admin secret)
```bash
# Set on Convex — never in the frontend
npx convex env set ADMIN_PASSCODE <strong_admin_passcode>
```

### 🔒 Security rules (do not skip)
- ✅ `VITE_CONVEX_URL` is safe to expose — it is frontend config, not a secret.
- ❌ **Do NOT** put `ADMIN_PASSCODE` in frontend / Vercel env vars. It belongs only in Convex (`npx convex env set`).
- ❌ **Do NOT** expose `GEMINI_API_KEY` (or any API key) in a `VITE_` variable — `VITE_` vars are bundled into the public browser code.
- ❌ **Do NOT** commit `.env.local`. It is already in `.gitignore`.
- 🔁 **Rotate weak passcodes** (e.g. `12345678`) to a strong value before private alpha:
  ```bash
  npx convex env set ADMIN_PASSCODE <strong_random_value>
  ```
  No code change is needed — testers just type the new value on the admin gate.

---

## D. Convex deployment

```bash
# Validate schema + functions first (compiles convex/ and pushes to dev)
npx convex dev --once

# Deploy Convex functions to your production deployment
npx convex deploy
```

- Run `npx convex dev --once` before deploying to catch schema/function errors early.
- After deploying, confirm `ADMIN_PASSCODE` is set on the **production** Convex deployment (env vars are per-deployment):
  ```bash
  npx convex env list           # verify ADMIN_PASSCODE exists
  npx convex env set ADMIN_PASSCODE <strong_admin_passcode>
  ```
- Copy the production Convex URL into your frontend `VITE_CONVEX_URL`.

---

## E. Frontend / app deployment to DigitalOcean

The app ships as a single Node/Express server that serves the React SPA **and**
the `/api/check` endpoint. DigitalOcean runs this directly. Two options:

### Option 1 (recommended): DigitalOcean App Platform

A managed PaaS — push to GitHub, DigitalOcean builds and runs it.

1. **Push the repo to GitHub** (ensure `.env.local` is NOT committed — it's gitignored).
2. In DigitalOcean: **Create → Apps → connect your GitHub repo**.
3. DigitalOcean detects Node. Configure the **Web Service** component:
   - **Build command:** `npm run build`
   - **Run command:** `npm run start`
   - **HTTP port:** `3000` (the server also honors the injected `PORT` env var).
   - **Instance:** Basic is fine for private alpha.
4. **Environment variables** (App-level → "Encrypted" for secrets):
   - `VITE_CONVEX_URL` = your **production** Convex URL (needed at build time).
   - `GEMINI_API_KEY` = your Gemini key (optional; mark **Encrypted**).
   - `NODE_ENV` = `production`.
   - ❌ Do **NOT** add `ADMIN_PASSCODE` here — it lives only on Convex.
5. **Deploy.** DigitalOcean builds (`npm run build`) and starts (`npm run start`).
6. Open the app URL and run the smoke tests in Section G.

> Note: `VITE_CONVEX_URL` is read at **build time** (it is compiled into the
> frontend bundle). If you change it, trigger a rebuild/redeploy.

### Option 2: DigitalOcean Droplet (manual VM)

For full control on an Ubuntu Droplet:

```bash
# On the Droplet (Ubuntu), install Node 20+ and pm2
sudo apt update && sudo apt install -y nodejs npm
sudo npm install -g pm2

# Clone and build
git clone <your-repo-url> scamcheck-kh && cd scamcheck-kh
npm install

# Provide build-time + runtime env (do NOT commit this file)
printf 'VITE_CONVEX_URL=%s\nGEMINI_API_KEY=%s\nNODE_ENV=production\n' \
  "https://your-project.convex.cloud" "<optional_gemini_key>" > .env.local

npm run build

# Run with pm2 (restarts on crash/reboot)
NODE_ENV=production pm2 start "npm run start" --name scamcheck-kh
pm2 save && pm2 startup
```

Then put **Nginx** in front as a reverse proxy to the app on port 3000, and add
HTTPS with Let's Encrypt (Certbot):

```nginx
server {
  server_name your-domain.example;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.example
```

> Security: open only ports 80/443 (and 22 for SSH) in the DigitalOcean firewall.
> Keep the app on `127.0.0.1:3000` behind Nginx — do not expose 3000 publicly.

---

## F. Pre-deployment verification

Run all of these locally. **All must pass before deploying.**

```bash
npm run test:alpha                  # private alpha analyzer dataset (expect all pass)
npx tsx src/analyzer.examples.ts    # analyzer example tests (expect ALL EXAMPLES PASSED)
npm run lint                        # tsc --noEmit, 0 errors
npm run build                       # vite build + server bundle, no errors
```

Also confirm:
- `npx convex dev --once` completes with no schema errors.
- `ADMIN_PASSCODE` is set on the production Convex deployment and is not a weak value.
- `VITE_CONVEX_URL` points to the production Convex URL.

---

## G. Post-deployment smoke tests

### Public app
- [ ] Home page loads with no console errors.
- [ ] Khmer / English toggle changes all visible text.
- [ ] Scam checker returns a result for a pasted message.
- [ ] Result page shows: risk level, risk score, detected type, confidence, warning signals, reasons, and safe next steps.
- [ ] Recent Checks (History) saves a **sanitized preview only** (no full message).
- [ ] Report Scam submits successfully and shows the success screen.
- [ ] Feedback (Correct / Not correct) submits successfully.

### Admin (hidden routes)
- [ ] `/admin/reports` requires the passcode.
- [ ] `/admin/feedback` requires the passcode.
- [ ] `/admin/insights` requires the passcode.
- [ ] A wrong passcode is rejected ("Incorrect passcode.").
- [ ] The correct passcode unlocks all three tabs.
- [ ] Report status update (reviewing / resolved) works.
- [ ] Delete report works.
- [ ] Feedback list loads.
- [ ] Insights load (summaries, top scam types, warning signals, recent incorrect feedback).

### Privacy
- [ ] OTP values are masked in stored previews.
- [ ] PIN values are masked.
- [ ] Passwords are masked.
- [ ] Card / bank / ID-like numbers are masked.
- [ ] The full pasted message is **not** stored anywhere.
- [ ] Reports and feedback store only sanitized previews / comments.

---

## H. Troubleshooting

| Symptom | Likely cause | Fix |
| :--- | :--- | :--- |
| App loads but admin pages show "Convex is not configured" | `VITE_CONVEX_URL` missing/wrong | Set `VITE_CONVEX_URL` to the production Convex URL and rebuild. |
| Admin/reports/feedback do nothing or error | Convex functions not deployed | Run `npx convex deploy` (and `npx convex dev --once` to validate). |
| Admin gate always rejects the correct passcode | `ADMIN_PASSCODE` missing on Convex | `npx convex env set ADMIN_PASSCODE <value>` on the **production** deployment. |
| "Incorrect passcode." for everyone | Passcode mismatch between what testers type and Convex `ADMIN_PASSCODE` | Reset it via `npx convex env set ADMIN_PASSCODE <value>` and share the new value securely. |
| Reports or feedback not saving | Convex not reachable, or functions out of date | Check `VITE_CONVEX_URL`, redeploy Convex, check browser console for errors. |
| Scam checker spins / fails to return a result | `/api/check` not reachable | Make sure the app runs via `npm run start` on DigitalOcean (App Platform run command or pm2 on a Droplet); the Express server must be running. |
| Explanation text looks generic / not AI-worded | `GEMINI_API_KEY` not set on the server | Optional — set `GEMINI_API_KEY` in the DigitalOcean app env. Rule-based fallback still works. |
| App restarts or won't bind to a port on App Platform | Port mismatch | Server reads `process.env.PORT` (App Platform injects it); set the component HTTP port to `3000` or leave the injected `PORT`. |
| Gemini errors in logs but results still show | Gemini quota/network failure | Expected — the server falls back to built-in bilingual explanations automatically. |

---

*This tool gives safety guidance only. It is not a final legal, banking, or police decision. Always verify with official sources.*
