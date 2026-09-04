
A small custom-built registration/login system for gating access to MidasCloud's per-person Obsidian webtop containers. Node/Express backend, React frontend, session-based auth, containerized and deployed behind the same Cloudflare Tunnel as the rest of the homelab.

Live at: [portal.midascloud.net](https://portal.midascloud.net/)

---

## Why this exists

Every other service in MidasCloud (Nextcloud, Calibre-web, Jellyfin, etc) ships with its own login system out of the box. I however had recently started using Obsidian for my College notes, and wanted a place to access them through a browser. Therefore, I found a way to spin up a container that hosts a small obsidian environment, where using a LiveSync plugin connected to a CouchDB database would allow me to sync my notes across devices. A main issue however was there was no easy connect to the vault site itself and the homepage

So, this exists as a way for someone who wants to view their obsidian notes through the web, to be *easily redirected to their correct vault after I set it up* based on just typing in a password and user.
It was a really great opportunity for a quality of life improvement and a way to expand on my full stack knowledge

---

## What it actually does

1. Someone registers with a username, email, and optional reason for wanting access
2. A temp password gets generated, hashed, stored, and emailed to them (via third party Resend API)
3. They log in immediately with that temp password and the user or email that they created
4. Once they've set a real password, they land in a "pending" state until I manually review and approve them, this is done for security reasons as the homelab operating this is small enough and there is real manual work in spinning up a container that I plan to automate somewhat with a script eventually
5. Approval happens through a small CLI script I run on the server (for now), and I provision their actual webtop container + CouchDB database by hand (since they are costly to run, hence the whole approval thing)
6. From then on, logging in redirects them straight to their own webtop automatically, easing hassle

---

## Architecture

```
Browser
  -->
Cloudflare Tunnel (same tunnel every other MidasCloud service uses)
  -->
nginx (serves the built React app, proxies /api/* to the backend)
  -->
Express (session auth, bcrypt, rate limiting on registration)
  -->
SQLite (better-sqlite3, one users table)
```

Frontend and backend are two separate Docker containers, built from their own Dockerfiles, brought up together with one `docker-compose.yml`. They talk to each other over the Compose network by service name, nginx proxies `/api/*` straight to the backend container, so from the outside it all looks like one origin. This way I did not need to worry about things like CORS issues for these requests, a real developmental benefit.

The back-end itself is really small and cleanly, only really querying it's own database of users on the `/mnt/data/portal/portal.db` database. Its only really for authentication of a user and then redirection, all of the sync up between the notes and gate-keeping is done by LiveSync and Cloudflare

---

## Bad Errors and Fixes

- Throughout this whole process, I had a drive end up dying on me which really sucked, all of the code was saved to github, but it means I had to rebuilt a lot of the infrastructure like the actual portal database and the CouchDB container as well. I had written seperate documentation on this, but it was still a decent setback

- Getting the Authentication to work through Cloudflare was also a known issue. The code itself worked well enough locally, but for changing the password a given session cookie is allocated to the user when they login and the database is queried to see if they need to change their password.
- This is done for security reasons so not just anyone can hit the `/changePWD` endpoint of the API whenever they want. So basically this cookie needs to be sent over from login to changePWD, but using Cloudflare, everything on the server's own network is done locally, and Cloudflare does the HTTPS encryption. 
- My session cookie is set to `secure: true` in production, which means the browser will only keep it if the request came in over real HTTPS. Cloudflare terminates TLS at the edge, but forwards the request to my server as plain HTTP internally. This is expected, but the nginx proxy actually sits between Cloudflare and Express, meaning it ended up getting the wrong header, and throwing away the cookie since it was not secure.
- This was eventually changed by setting `proxy_set_header X-Forwarded-Proto https;` instead of `$schema`
  
- Vault Provisioning is still something that has to be done manually by an admin, and although I could write a complex script for it, the simple `adminCLI.js` in the backend for database interaction is good enough for now given the volume of users that there is (only a couple thus far), which is run on server use `docker exec -it portal-backend node adminCLI.js`
- See `SettingUpNewUsers.md` inside of `/Back-End` for the few step process

---

## Future Add Ins If I get the Time

- A simple logout feature just because the cookies expire on their own, but it would be nice to give someone the option to unauth as well
- Rate limit the log in page as well, its not as much of an issue because it doesn't cause server side problems too much other than an attack surface for something like DoS, but its a small enough application that only really redirects

## Stack

`Node.js` `Express` `React` `Vite` `better-sqlite3` `bcryptjs` `express-session` `express-rate-limit` `Resend` `Docker` `nginx` `Cloudflare Tunnel`
