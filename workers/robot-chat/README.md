# Robot chat: AI brain (not switched on yet)

The robot on jaemi.uk works today in **basic mode**: it answers from a short built-in list, on the visitor's own device, and sends nothing anywhere.

This folder is the optional **AI brain**: a small Cloudflare Worker that lets the robot answer anything about Jaemi Space using Claude.

## Switch it on (about 10 minutes)

1. Get an API key from https://console.anthropic.com (this costs money per message; set a monthly spending limit there first).
2. In this folder run:
   ```
   npx wrangler login
   npx wrangler secret put ANTHROPIC_API_KEY
   npx wrangler deploy
   ```
3. Wrangler prints an address like `https://jaemi-robot-chat.<you>.workers.dev`. Paste it into `chat.endpoint` at the top of `assets/space.js` and push.

## Before switching it on

- Add a rate-limiting rule for the Worker in the Cloudflare dashboard so nobody can run up your bill.
- Update the site's privacy wording: visitors' messages will then be sent to the Worker and to Anthropic to write replies.
- What the robot knows lives in `SYSTEM` in `src/index.js`. Update it when the shop, lessons or channels go live.
