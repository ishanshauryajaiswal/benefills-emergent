# SKILL: Fix Empty Products / No Products Loading

## Symptom
- Home page "Our Products" section is empty
- `/shop` route shows no products
- Frontend loads but product cards are missing

## Root Cause (most common)
1. **Backend service is stopped** — no API to serve products
2. **MongoDB products collection is empty** — database was reset or container restarted with ephemeral storage

## Quick Diagnosis (run in order)

```bash
# Step 1: Check if services are running
sudo supervisorctl status all

# Step 2: Check if backend API returns products
curl -s "http://localhost:8001/api/products/"
```

- If services are STOPPED → go to Fix A
- If API returns `[]` (empty array) → go to Fix B
- If API returns products but UI is blank → go to Fix C

---

## Fix A: Services are stopped

```bash
sudo supervisorctl start all
sleep 5
sudo supervisorctl status all
```

If frontend throws `craco: not found`:
```bash
cd /app/frontend && yarn add @craco/craco
sudo supervisorctl restart frontend
```

---

## Fix B: Database is empty — re-seed

```bash
cd /app/backend && python seed_data.py
# Verify:
curl -s "http://localhost:8001/api/products/" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{len(d)} products loaded')"
```

Expected output: `4 products loaded`

---

## Fix C: API returns data but UI shows nothing

Check frontend `.env`:
```bash
cat /app/frontend/.env
# REACT_APP_BACKEND_URL should be set
```

Check browser console for CORS or network errors. Ensure `api.js` uses `process.env.REACT_APP_BACKEND_URL`.

---

## Permanent Protection Already in Place

`/app/backend/server.py` has an **auto-seed on startup** — if the products collection is empty when the backend starts, it automatically seeds 4 products + 3 coupons + admin user.

This means **after Fix A** (restarting services), Fix B is usually handled automatically.

---

## Seed Data Reference

| ID | Product | Price |
|----|---------|-------|
| 1  | Thyrovibe Seeds Boost Bar- pack of 7 | ₹410 |
| 2  | Thyrovibe Nut-ella Nut Butter | ₹650 |
| 3  | Thyrovibe nut butters- the duo pack | ₹1200 |
| 4  | Benefills Monthly Pack | ₹1900 |

Coupons: `FIRSTLOVE20` (20% off), `THYROCARE15` (15% off ≥₹1000), `FLAT100` (₹100 off ≥₹500)

Admin login: `admin@benefills.com` / `admin123`

---

## Time to fix: ~2 minutes
