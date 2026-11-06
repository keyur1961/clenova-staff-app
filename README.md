# Clenova Staff App (MVP · $0)

Offline-first staff + client portal for **Clenova Care Solutions Pty Ltd**  
ABN 90 703 402 528 · info.clenovacare@gmail.com · Brisbane

Inspired by CleanTasker. Runs entirely in the browser (localStorage + IndexedDB).  
No paid services. Nothing is published without Keyur's OK.

## Features
- Role login: **Admin / Staff / Client** with demo PINs
- Jobs list + detail
- Staff **check-in / check-out** (timestamp + optional GPS)
- **Before / after** photo uploads (stored in IndexedDB)
- **Inspection checklists** (pass / fail + notes)
- **Client portal** — own jobs, photos, inspection results
- **Timesheet** summary (hours from check-in → check-out)
- Admin: create jobs, reset demo data

## Demo PINs
| Role   | PIN  | Who |
|--------|------|-----|
| Admin  | 1234 | Keyur / office |
| Staff  | 2222 | Demo cleaner (Priya) |
| Client | 3333 | Demo client (Riverbend Aged Care) |

## Run locally
```bash
cd /workspace/clenova-staff-app
python3 -m http.server 8765
# open http://127.0.0.1:8765
```

Or open `index.html` directly in a browser (geolocation may need http/https).

## Host live for free (needs Keyur OK)
1. Push this folder to a GitHub repo under **keyur1961**
2. Enable **GitHub Pages** (Settings → Pages → Deploy from main `/` or `/docs`)
3. Share the Pages URL with staff/clients
4. Later: replace PINs + localStorage with a real backend when ready

Spend: **$0**. Do not create accounts or publish without approval.

## Live (GitHub Pages)
https://keyur1961.github.io/clenova-staff-app/

Demo PINs are for try-out only (in-app). Do not use for real client data.
