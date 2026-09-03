## Manual user provisioning steps
1. Create config dir: /mnt/data/obsidian-webtop/<username>/config
2. Copy compose template, fill in: container_name, port (next available), volume path
3. `docker compose -f <path> up -d`
4. Create CouchDB database for the user with a randomly generated url
5. Add Cloudflare Tunnel ingress rule for <username>.midascloud.net → localhost:<port>
6. `systemctl reload cloudflared`
7. Confirm LiveSync connects from the webtop's Obsidian instance
9. Run admin-cli.js, approve user, paste in vault link