# jaemi.uk

Static site for jaemi.uk (Jaemi Space), served by GitHub Pages behind Cloudflare. Every push to `main` goes live.

- `/` home: Jaemi Space (three spaces: Watch & Enjoy, Learn & Try, Discover & Shop)
- `/robots/` Mino robot buying guide
- `/games/XmasTnC/` Christmas giveaway rules
- `/tylos-labour/` internal staff-hours tool (password protected, not linked); main address tylos-labour.jaemi.uk

## Home page files

- `index.html` page content
- `assets/space.css` styles (mobile first)
- `assets/space.js` robot behaviour (lift-off to the corner, chat), giveaway auto-close and the HubSpot hook. All settings sit in `JAEMI_SETTINGS` at the top.
- `workers/robot-chat/` optional AI brain for the robot chat (Cloudflare Worker, not deployed; see its README)
- `assets/fonts/` self-hosted Space Grotesk and JetBrains Mono (SIL Open Font License)
- `assets/site.css` older light style still used by the giveaway rules page

## Switching things on later

- **HubSpot sign-up:** create the form in HubSpot, then paste its form ID into `JAEMI_SETTINGS.hubspot.formId` at the top of `assets/space.js`. Until then the sign-up stays marked "Not connected" and no HubSpot code loads. Add the HubSpot tracking code only together with a cookie-consent banner.
- **Robot chat AI:** deploy `workers/robot-chat`, then paste its address into `JAEMI_SETTINGS.chat.endpoint`. Until then the robot runs in basic mode on the visitor's device.
- **Clocked Out Cat:** add the channel link to `JAEMI_SETTINGS.links.cat`, and swap the "Coming soon" pill on its card in `index.html` for Watch/Subscribe buttons.
- **Shop and learning:** the rows marked "Coming soon" in Learn & Try and Discover & Shop are the public teasers; replace them when each part opens.
- **Status labels:** pills use `pill-live`, `pill-soon` or `pill-off`.
