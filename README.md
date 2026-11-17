# Amazing Grace Digital Sport Management System

A responsive sporting management app with a Google Sheets data store and a Google Apps Script API. The frontend is plain HTML, CSS, and JavaScript; no build step is required. Its identity features an original shield logo and the verse “But by the grace of God I am what I am” — 1 Corinthians 15:10. The About page is available before and after sign-in and introduces the system, its benefits, scoring checks, athletics imagery, potential digital services, and developers.

## Set up Google Sheets and Apps Script

1. Create a Google spreadsheet for the system.
2. Open **Extensions → Apps Script** from that spreadsheet and replace the editor contents with `Code.gs` from this project.
3. Run `doGet` once from the Apps Script editor and authorize the requested spreadsheet permissions. The app creates its sheets and column headers automatically. The `Sessions` sheet stores login sessions; user passwords are salted and hashed.
5. Select **Deploy → New deployment → Web app**. Choose **Execute as: Me** and allow access to **Anyone** so the hosted frontend can call the API. Copy the deployed web app URL.
6. Paste the URL into `apiUrl` in [config.js](./config.js).
7. Serve the project folder from a static web host (or a local web server); open `index.html` and create the first account. When the Users sheet has no user records, that account is automatically assigned the **Master Admin** role and approved, regardless of the role selected in the form. Later users keep their selected role and await approval.

Apps Script deployments use a versioned snapshot. After changing `Code.gs`, create a new deployment version or update the existing deployment before testing. The public certificate page used by QR codes is included in `doGet`; existing deployments must be updated before new QR links will resolve.

## Running and offline use

- In VS Code, open this project folder (`C:\Users\hp\Desktop\SPOT MANAGMNT SYSTM`) and start Live Server from this folder's root `index.html`. The Amazing Grace Digital sign-in page is the expected entry point; the included Live Server workspace settings select this root page. If a different app appears, Live Server is serving another folder or an old browser tab.
- Use `http://localhost` or an HTTPS host, not `file://`; browsers require a web origin for service workers and offline storage.
- The app is installable as a PWA from HTTPS or localhost. Install is available on the sign-in/registration screen and in the dashboard. Browsers that support native installation show their install prompt after the user presses the button; on iPhone/iPad, use Safari's **Share → Add to Home Screen**. If the browser does not report installed state, its install controls may remain visible because browsers do not expose a universal install-detection API.
- The first-visit install suggestion can be dismissed; the Install app button remains available until an installation is detected. In installed mode, the app opens in a standalone app window. Use an updated browser for the best cross-platform experience.
- Sign in while online at least once on each browser/device. The app caches its shell, photos, developer portraits, and that account's dashboard data locally. The cached workspace is not shown offline because the system must verify its global open/closed state with Apps Script.
- Supported scoring, house, setup-list, certificate, school-settings, and print-history changes are saved locally during network timeouts and sync when the app reconnects. A live Apps Script status check is now required before the workspace can be opened; if the server cannot be reached, the workspace is blocked so a global shutdown cannot be bypassed offline. Pending saved changes remain on the device until access is restored.
- Deletions and other destructive actions show an in-app Yes/No confirmation before they proceed.
- Certificate QR codes link to a public certificate page served by the deployed Apps Script API. Scanning requires internet access, and certificates created offline must sync before their links can be looked up. The QR lookup returns only the matching certificate record, not the full dashboard.
- Offline data and queued changes are stored in that browser's local IndexedDB and are not shared across browsers or devices until sync succeeds.

## Features

- Splash/login screen and registration with name, email, username, password confirmation, and role.
- Master Admin approval, denial, and deletion of accounts.
- Users can update their username and password and upload a profile picture from the profile controls. Common browser-readable image formats of different dimensions are centered and resized to fit the profile-image storage limit; source files are limited to 20 MB and 40 megapixels. The resulting JPEG is stored in the Users sheet.
- House setup supports four default form rows and up to ten rows per save; house names are required, descriptions are optional, and admins can assign each house a scoreboard color.
- House descriptions are shown beneath each house name on the Live Score page.
- Master Admins can manage the school name, motto, address, logo, and meet title, then choose a starting design from 20 certificate styles with distinct edge designs and colorways. New certificates cycle through the styles so consecutive certificates have different designs. Admins can preview the selected design before saving it. The provided trophy photo and school-logo watermark are included, and every certificate has a red unique number, a QR link to its public certificate page, and a school/year seal. Position colors distinguish the top ten places. The date and School Authority label sit in opposite bottom corners. The scanned certificate embeds the same trophy photo and reproduces the certificate design, with Save as PNG and Print actions. Printing stays in the current app tab and prints one certificate per A4 landscape page.
- House color names such as Yellow, Blue, Orange, or Mauve automatically select a matching color in the admin form; admins can still use the color picker to adjust it.
- The app opens in a high-contrast off-white light theme with dark text and softly colored panels. The theme toggle switches between light and dark appearance on desktop and mobile and remembers the selection.
- The system starts open unless a Master Admin has turned it off. From the Admin control panel, a Master Admin can turn it off for every user. The shutdown state is stored in Apps Script, all sessions are revoked, and users see a dedicated closed-system page even after reloading or reopening the app. To turn it on again, an approved Master Admin enters a username and password on that page; everyone else must sign in again. The app polls the server every five seconds and blocks workspace access whenever the server cannot verify that the system is open.
- The top bar stays pinned while scrolling. Its navigation toggle collapses the desktop sidebar and opens a vertical mobile drawer with a dimmed backdrop; the X control closes it.
- The About page can be opened from the sign-in and registration screen or the dashboard navigation. It explains the season workflow, server-side scoring checks, point-history review, and accuracy limitations. Athletics photos illustrate the sporting context; original website and app screen mockups describe possible client-specific services and are not presented as completed project evidence. Developer portraits appear as centered, bordered circles, with biographies and contact links. The developers are final-year BSc (Hons) Software Engineering with Multimedia students at Limkokwing University.
- Admin-managed categories, events, point values, and numeric positions; each list accepts up to ten values per save.
- Event names accept letters, numbers, or combinations such as `200M`, `200 M`, and `200 Meters`; points and positions remain whole-number fields.
- Score entry requires an award or a zero status for every house. Non-zero point values must be unique within an event; zero is permitted for multiple houses.
- House leaderboard, results, a color-backed Live Score scoreboard that refreshes every 15 seconds while open, point history, and searchable/filterable athlete certificates.
- Certificate forms start with two athlete rows and share a category/event across the submitted athletes. Each certificate has a view/print/PNG export action; house-filtered or all-house certificate and recipient-list batches can be printed in the current app tab, with confirmed batches tracked by type and scope and resettable by a Master Admin. After the print dialog closes, confirm whether the output printed or saved successfully; browsers do not expose that result to the app.
- Role checks are enforced by the Apps Script API, not only by the frontend. Only Master Admins can manage users, setup lists, houses, or clear scoring history.
- Offline write replay uses the Apps Script `Mutations` sheet for idempotency. The updated `Code.gs` must be deployed before offline changes can be synchronized safely.
- After any `Code.gs` changes, update the Apps Script deployment. The global system on/off controls and public certificate QR pages require the current backend version.

## Background photos

The slideshow cycles through ten locally stored running and track photos in `photo/`. They are sourced from Pexels and are free to use under the [Pexels license](https://www.pexels.com/license/); attribution is optional.
Photos change every five seconds.

The About page also includes the two developer portraits supplied for this project. They are stored locally in `photo/` and are included in the offline app cache.

- [athletics-01.jpg — African marathon runner](https://www.pexels.com/photo/african-man-running-a-marathon-18178318/)
- [athletics-02.jpg — marathon runner](https://www.pexels.com/photo/a-man-running-at-a-marathon-12736376/)
- [athletics-03.jpg — runners on track](https://www.pexels.com/photo/men-running-on-track-field-5961847/)
- [athletics-04.jpg — track sprinters](https://www.pexels.com/photo/sprinters-on-a-running-track-19787364/)
- [athletics-05.jpg — women's marathon](https://www.pexels.com/photo/women-running-in-race-18752819/)
- [athletics-06.jpg — women's track race](https://www.pexels.com/photo/women-running-on-track-19613736/)
- [athletics-07.jpg — marathon runners](https://www.pexels.com/photo/foggy-marathon-race-with-two-leading-runners-29840320/)
- [athletics-08.jpg — athletes racing](https://www.pexels.com/photo/two-athletes-competing-in-intense-race-38137157/)
- [athletics-09.jpg — relay runner](https://www.pexels.com/photo/young-athlete-running-on-track-in-mexico-city-38563822/)
- [athletics-10.jpg — cross-country marathon](https://www.pexels.com/photo/runners-during-the-marathon-18408904/)

## Notes

- Keep the spreadsheet and Apps Script project private to trusted administrators. Anyone with the deployed URL can submit a registration request; the first person to register on an empty Users sheet becomes the approved Master Admin.
- Certificate QR links are public by design: anyone with a certificate or its QR code can view that certificate's details. Do not put confidential information in certificate fields.
- This is a starter application. Deploy it over HTTPS and test with a non-production spreadsheet before using it for official results.
