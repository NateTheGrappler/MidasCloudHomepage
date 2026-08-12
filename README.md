
2026-08-03 19:36
Tags: [[Personal Projects]] [[Servers]] [[System Admin]] [[Guide]] [[Cloudflare]] [[The Cloud]] [[Homelab]] [[README]]

# Midascloud — Self-Hosted Personal Cloud

A personal cloud platform (files, notes sync, media, and a custom access portal) self-hosted on a Proxmox VM, reachable from the internet without any open inbound ports, using Cloudflare Tunnel. A home-lab project overview focused mostly on security and following proper DevOps and System Administration Principles, mostly a functional learning/portfolio project.

I built this project because I thought it would be useful to those in my family that would use it. It was generally tailored for a learning experience while in school that would teach me real infrastructure and deployment while also letting me tinker with security and probing as much as I would like. It let me host and organize a large portion of my media, like notes, videos, books, and photos. I was generally able to turn scrap material into something that helped me learn while providing a good service to those I care about.

But its not just for friends or family, anyone is welcome!!

---
## Homepage

The front door — a custom `p5.js` WEBGL scene: a 3 D gold cloud, made in blender, model, an orbiting star field made with basic random function and 3 D application of geometry. It renders randomly at each user refresh. And rotating info panels linking out to each service, showcasing an image, name, and small description of the service

![[Pasted image 20260812133540.png]]

On narrower view-ports the panels re-flow to become a sort of clean list, originally I tried to keep the architecture of the above photo, however I found this resolution to be cleaner and more elegant after feedback from users on mobile who wanted a list-like view:

![[Pasted image 20260812133549.png|369]]

---

## Architecture

```
Networking:

Internet 
--> 
Cloudflared Edge (TLS termination, access policies, the works)
-->
Cloudflare Tunnel (outbound-only, no portforwarding, no public IP, all traffic is handled through the tunnel)
->
cloudflared daemon (system service running as root, config location below)

The hardware specs are a simple ethernet connection running between server and router

---------------------------------------------------------------------------

Docker Containers / Infrastructure

homepage - basic nginx site (screenshot above) running on port :8080 serving from local host with a docker image that points over to /mnt/data/homepage on server drive

Several other docker containers with the same set up all running from a stack on the main ubuntu-server virtual machine in the /home/notrealusername repo so they are seperated from server drive, some include nextcloud:8081 portal:4000, webtops :3010 :3011..., more information below

---------------------------------------------------------------------------

Storage / Hardware

An oldschool dell hp that I repurposed and upgraded for a homelab set up, running an i3 cpu with 24 gb of ddr3 ram. The main proxmox hypervisor sits on a 500gb harddrive that hosts the ubuntu-server VM in which the cloudflare and above docker containers sit.

The main content is then stored in a 2bay chasis DAS connected to the server via USB (which was troubleshooted, see below), which houses a 2tb and 4tb drive for storing the server content and backing up said server content respectively
```

Generally there was a large focus in security and working with limitations in the project. The reason for the networking architecture is because at the time of this project I was working with a T-Mobile connection and so was forced to have GNAT restrictions. The back ups were also limited because I had to use fairly old spare parts I got for cheap at local thrift stores, I generally could not afford things like dynamic cloud storage or backups at a datacenter.

---
## Domains

All subdomains route through the single Cloudflare Tunnel defined in `/etc/cloudflared/config.yml`. Adding a new one is always: add an `ingress` block, `cloudflared tunnel route dns midascloud <hostname>`, restart the service.

| Subdomain                       | Service                                                                          | Access control                                                                                                                                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `midascloud.net`                | Homepage (nginx, static, p5.js)                                                  | Public, no auth, just landing page in pictured above images                                                                                                                                                     |
| `files.midascloud.net`          | Nextcloud                                                                        | Nextcloud login + approval-required registration                                                                                                                                                                |
| `sync.midascloud.net`           | CouchDB (Obsidian LiveSync backend)                                              | Per-user CouchDB auth, database-level `_security`                                                                                                                                                               |
| `<cryptic-slug>.midascloud.net` | Per-person web-top Obsidian container                                            | Cloudflare Access, one policy per person, requests need to be made per person as an individual container needs to be approved by admin and spun up for each request (process is automated somewhat with script) |
| `portal.midascloud.net`         | Custom registration/login portal for obsidian container                          | Custom auth (bcrypt), manual admin approval for the above mentioned obsidian note container, basically a custom login/authentication site since obsidian services did not provide one                           |
| `mc.midascloud.net`             | minecraft server information / homepage                                          | A very basic mine-craft server hosting only up to about 20 people, light modding, anyone is generally welcome to join if they would like                                                                        |
| `books.midascloud.net`          | Storage of `PDF` and `eupb3` files pertaining to free or purchased book material | This is where the calibre-web library sits for the server, it hosts a wide range of books gotten from project Gutenberg, alongside some purchased coding textbooks.                                             |

Most services are generally open to the public but with authentication from an admin. For things like next cloud or the obsidian vault custom log in page, a person can request to make an account with me and I would have to authenticate it, mainly did so to stop against bots or unknown users from hogging server resources. Otherwise, everything is generally accessible for free, someone can theoretically make as many requests as they would like, and view things like the minecraft server homepage and such easily as well.

---
## Services

**Homepage** — static nginx container serving a p5.js scene (`/mnt/data/homepage`). No backend, no auth. Info panels are data-driven (`informationPanelData` array), so adding a new service link later is just adding an object, not touching layout code, making it good for scaling if I ever want more services

**Nextcloud** - file storage + sync, MariaDB-backed. Admin account is management-only; personal files live under a separate personal account. Self-registration enabled (Registration app), requires admin approval per new account, default quota 15GB. `trusted_domains` includes `files.midascloud.net`. Currently is hosting about 10 active users

**CouchDB** - backend for Obsidian's Self-hosted LiveSync plugin. One database per person, one CouchDB user per person, each locked to their own database via a `_security` document. See `couchdb-admin-guide.md` for day-to-day operation (personal document, not included in repo, just for self-reference.)

**Webtop Obsidian** - `linuxserver/docker-obsidian`, one container per person, full desktop Obsidian streamed to the browser via KasmVNC. Each instance runs the LiveSync plugin internally, pointed at that person's CouchDB database - so this becomes just another synced device, not a separate system. This allows for obsidian vault syncing across a webpage, personal computer, or even a mobile device (I use obsidian for mostly all notes, including this readme)

**Portal app** - small Node/Express app that handles registration requests and, once a person is manually approved, redirects them straight to their webtop container's URL on login. Never touches Docker directly - provisioning stays a deliberate manual step due to the physical hardware consumption that one of these containers take, the portal app is just for simple redirection and request for provisioning

**Learning Experience:**
Overall, the hardest thing to really manage in on was having to set up a custom framework for the obsidian notes to work, everything else like next cloud, calibre, etc, came with their own UI for logging in, but the managing of obsidian allowed me the most control and was a great working experience for how to use node and interact with databases and authentication. I understand manual authentication like this is not a best field practice, however there was no other service provided here, so to get this to work the way I had envisioned I had to set up my own solution.

---
## Storage

2TB external USB drive, whole-disk pass-through from the Proxmox host into the VM, ext4, mounted at `/mnt/data` via `/etc/fstab` with `nofail,x-systemd.device-timeout=10`. The HDD is generally mounted via a docking station that is plugging into the bare metal hypervisor. I do eventually plan on purchasing another 4 Tb HDD for use with backups and further services for media storage as well. Host-level kernel quirk required for this specific enclosure (ASMedia UAS bug, <u>which was a terrible debug</u>):

```
GRUB_CMDLINE_LINUX_DEFAULT="quiet usb-storage.quirks=174c:55aa:u"
```

Folder layout under `/mnt/data`:

```
homepage/
nextcloud/
nextcloud-db/
obsidian-couchdb/
obsidian-couchdb-config/
obsidian-webtop/<username>/config/
obsidian-portal/   (future implementation)
calibre-web/
minecraft-hompage/ (future implementation)
jellyfin/
backup-staging/    (future implementation)
```

---
## Backups

***TO BE IMPLEMENTED when 4 TB HDD ARRIVES***

---
## Server access

SSH key-only (password auth disabled in `sshd_config`). Fallback if ever locked out: Proxmox web console (noVNC), independent of SSH. Generally secure due to the GNAT proxy that makes this project have to go through cloudflare so no actual traffic requests are visible from outside users to my home network. It also allows for a cleaner use of cloudflare certs and security principles as well.

## Scripts

Kept in `~/scripts` on the server, separate from the Docker stack folders (`~/*-stack/docker-compose.yml`) — operational tooling vs. what Docker needs to run a service.

| Script                   | Purpose                                           |
| ------------------------ | ------------------------------------------------- |
| `add-vault-user.sh`      | Create a CouchDB user + private database          |
| `add-webtop-user.sh`     | Create a new per-person webtop Obsidian container |
| `backup-midascloud.sh`   | Nightly restic backup, run by systemd timer       |

Consider version-controlling this folder in a private GitHub repo of your own, separate from any user's vault repo.

---
## Things to change or Generally Implement

- Generally I think finding a solution for back ups way earlier would be a good idea, it is a pretty large pain to have an already fairly full drive and then only start with back up solutions after it, I would rather have a small system architecture going and then go for backups
- I would also in the future probably like to change a portion of the system architecture where the DAS handles all of the server drive from a single USB port, because then if the Ubuntu-server instance is up while the drive is not plugged in, it would create empty directories for the data
- I would also try and see if I can make the whole thing more scalable whenever I would have a little bit more cash, something akin to server backups that are done cheaply to an outside cloud provider
- Lastly, I think the most important thing even, I would set up some different monitoring tools along the way, a lot of times have I had a container crash or silently fail and then I need to hand read logs to see what happened, which I why I want to eventually invest in something like Uptime Kuma or Portainer just so I know what goes on.

- Backup drive hardware
- Uptime Kuma
- Portainer 
- Minecraft server (`mc.midascloud.net`) 
- Custom registration/login portal 
- Cloudflare Access self-service request flow


----
## Stack

`Proxmox` `Ubuntu Server` `Docker` `Cloudflare Tunnel` `Cloudflare Access` `Nextcloud` `MariaDB` `CouchDB` `Obsidian LiveSync` `KasmVNC` `Node.js / Express` `bcrypt` `nginx` `p5.js` `restic` `systemd`