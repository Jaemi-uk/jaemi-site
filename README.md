# jaemi.uk

Static site for jaemi.uk (Jaemi Space), served by GitHub Pages behind Cloudflare. Every push to `main` goes live.

- `/` home: Jaemi Space (three spaces: Watch & Enjoy, Learn & Try, Discover & Shop)
- `/robots/` Mino robot buying guide
- `/games/XmasTnC/` Christmas giveaway rules
- `/tylos-labour/` internal staff-hours tool (password protected, not linked); main address tylos-labour.jaemi.uk

## Home page files

- `index.html` page content
- `assets/space.css` styles (mobile first)
- `assets/space.js` robot behaviour, giveaway auto-close and the HubSpot hook
- `assets/fonts/` self-hosted Space Grotesk and JetBrains Mono (SIL Open Font License)
- `assets/site.css` older light style still used by the giveaway rules page

## Switching things on later

- **HubSpot sign-up:** create the form in HubSpot, then paste its form ID into `JAEMI_SETTINGS.hubspot.formId` at the top of `assets/space.js`. Until then the sign-up stays marked "Not connected" and no HubSpot code loads. Add the HubSpot tracking code only together with a cookie-consent banner.
- **Channel three:** replace the "Channel three" card in `index.html` and the matching "System check" line.
- **Shop and learning:** the "On the workbench" blueprints (`#bench-shop`, `#bench-learn`, `#bench-join`) are the slots to replace once a platform is chosen.
- **Status labels:** pills use `pill-live`, `pill-build`, `pill-plan` or `pill-off`; System check lines use `data-state="on|build|off"`.
