# How It Works — MidasCloud Portal

(temporary document made with AI just for personal use so I do not forget)

This document outlines the account request → approval → access architecture for the
MidasCloud Portal.

## Overview

The portal is split into three pieces:

- **Front-End/** — React app, handles UI and talks to the backend via `fetch`
- **Back-End/** — Express app (`server.js`), handles all routes, auth logic, and
  Discord notifications
- **db.js** — opens/creates the SQLite database (`better-sqlite3`) and exports a `db`
  object; contains no query logic of its own

## Account Request Flow

1. A visitor submits a request via the frontend: username, email, and an optional
   reason.
2. This hits `POST /api/request-account` on the backend.
3. The backend inserts a new row into the `users` table with `status: "pending"`.
4. The backend fires a notification to Discord (via webhook) so the admin sees the
   new request in real time.

## Approval Flow

1. The admin approves the request out-of-band (Discord message, admin panel — TBD).
2. The approval action hits a protected endpoint (e.g. `POST /api/approve/:id`),
   gated behind a shared secret/admin token so only the admin can trigger it.
3. On approval, the backend:
   - Generates a cryptographically random default password
     (`crypto.randomBytes`, not `Math.random`)
   - Hashes it with `bcrypt.hash()` — the plaintext is never stored
   - Updates the user's row: `status: "approved"`, `password: <hash>`,
     `hasDefaultPwd: true`
   - Sends the user their username + one-time plaintext password (Discord DM/email —
     TBD)

## Login Flow

1. User submits username + password via the frontend to `POST /api/login`.
2. Backend looks up the user by username, then runs `bcrypt.compare()` against the
   stored hash.
3. On success, the backend responds with JSON — it does **not** redirect
   server-side:
   ```json
   { "success": true, "mustChangePassword": true }
   ```
4. **React reads `mustChangePassword` from the response and handles navigation
   client-side** (e.g. via React Router), routing first-time users to a
   change-password screen.

## First Login / Password Change Flow

1. User is prompted to set a real password.
2. `POST /api/change-password` hashes the new password with `bcrypt.hash()`,
   overwrites the stored hash, and flips `hasDefaultPwd` back to `false`.
3. User now has full access to the portal.

## Access / Redirect

Once authenticated with a real password, the user is directed to their vault,
served via a Cloudflare Tunnel pointed at `localhost:3000`.

## Notes / Open Items

- Admin-approval endpoint auth mechanism (shared token vs. session-based) — TBD
- Discord webhook wiring for both the request-notification and password-delivery
  steps — TBD
- CORS setup between frontend and backend subdomains — not yet implemented