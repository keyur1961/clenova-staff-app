# Clenova Staff App (MVP · $0)

Offline-first staff + client portal for **Clenova Care Solutions Pty Ltd**  
ABN 90 703 402 528 · info.clenovacare@gmail.com · Brisbane

Inspired by CleanTasker. Runs entirely in the browser (localStorage + IndexedDB).  
No paid services.

## Features
- Role login: **Admin / Inspector / Cleaner / Client** (Staff PIN still works as cleaner)
- Property-type photo slots (1–5 bed, duplex, other/custom) with mandatory minimums + unlimited extras
- **Inspector**: assess booking, take required room photos, set agreed task list, submit inspection
- **Cleaner**: review inspector photos → matching arrival photos → tick tasks → matching completion photos
- Cleaner **cannot mark complete** while any arrival/completion photo or task is missing (lists exactly what’s missing)
- Timestamped **completion record** (who, tasks done, photo counts) visible to Admin & Client
- Check-in / check-out with optional GPS · timesheet · Admin create jobs / reset demo

## Demo PINs
| Role      | PIN  | Who |
|-----------|------|-----|
| Admin     | 1234 | Keyur / office |
| Staff     | 2222 | Demo cleaner (Priya) — same as Cleaner |
| Client    | 3333 | Demo client (Riverbend Aged Care) |
| Inspector | 4444 | Alex Inspector |
| Cleaner   | 5555 | Priya (cleaner role) |

## Run locally
```bash
cd /workspace/clenova-staff-app
python3 -m http.server 8765
# open http://127.0.0.1:8765
```

## Live
https://keyur1961.github.io/clenova-staff-app/  
Repo: https://github.com/keyur1961/clenova-staff-app

Spend: **$0**.
