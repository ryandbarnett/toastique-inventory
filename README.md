# Toastique Inventory (tiny-core MVP)

Minimal juice batch tracker for Toastique. Focuses on **active batches**, **expires-in days**, and **create-by-multiples** of a default batch. Internals use liters; UI shows **qt (L)**.

## Tech
- Node 18+, Express
- SQLite (better-sqlite3)
- Plain HTML/CSS/JS (no framework)

## Quick start
```bash
npm install
npm run dev
# app: http://localhost:3000
# health: http://localhost:3000/health
