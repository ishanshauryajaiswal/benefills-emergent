# Benefills – Deployment & Configuration Guide

## Overview

Benefills is a thyroid-health e-commerce platform built with:
- **Frontend:** React (CRA + CRACO), Tailwind CSS, Shadcn/UI
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **Payments:** Razorpay (Live)
- **Shipping:** Shiprocket
- **Analytics:** PostHog, Meta Pixel
- **Hosting:** Emergent Native Deployment (Kubernetes)

---

## Environment Variables

### Backend (`/app/backend/.env`)

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
JWT_SECRET=c2a599d9fefb2317343e09001add0bb158efb4962cad933222144785e2460148
JWT_SECRET_KEY=c2a599d9fefb2317343e09001add0bb158efb4962cad933222144785e2460148
RAZORPAY_KEY_ID=rzp_live_SMjOhRqxySQ4KQ
RAZORPAY_KEY_SECRET=XUQSLkcu9L0H6ZmZQn2xlDm2
RAZORPAY_WEBHOOK_SECRET=bf_9c7d2e1f4a8b6d0c3e5f7a1b9d2c4e6f8a0b3c5d7e9f1a2b4c6d8e0f2a4c6
SHIPROCKET_EMAIL=apeksha14j@gmail.com
SHIPROCKET_PASSWORD=tXFYS!D!VLj0CHN@YzUL4eZ72Mn!f3Vr
```

### Frontend (`/app/frontend/.env`)

```env
REACT_APP_BACKEND_URL=https://payment-confirmed-3.preview.emergentagent.com
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

> **Note:** `REACT_APP_BACKEND_URL` is baked into the frontend bundle at build time. In production deployment, this points to the live backend URL automatically configured by the Emergent platform.

---

## Razorpay Configuration

| Setting | Value |
|---|---|
| Mode | **Live** |
| Key ID | `rzp_live_SMjOhRqxySQ4KQ` |
| Key Secret | `XUQSLkcu9L0H6ZmZQn2xlDm2` |
| Webhook URL | `https://benefills.com/api/payments/webhook` |
| Webhook Secret | `bf_9c7d2e1f4a8b6d0c3e5f7a1b9d2c4e6f8a0b3c5d7e9f1a2b4c6d8e0f2a4c6` |

### Razorpay Dashboard Setup
1. Log in to [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Go to **Settings → Webhooks**
3. Add webhook:
   - **URL:** `https://benefills.com/api/payments/webhook`
   - **Secret:** `bf_9c7d2e1f4a8b6d0c3e5f7a1b9d2c4e6f8a0b3c5d7e9f1a2b4c6d8e0f2a4c6`
   - **Events to enable:** `payment.captured`, `payment.failed`

---

## Shiprocket Configuration

| Setting | Value |
|---|---|
| Email | `apeksha14j@gmail.com` |
| Password | `tXFYS!D!VLj0CHN@YzUL4eZ72Mn!f3Vr` |
| API Base URL | `https://apiv2.shiprocket.in/v1/external` |

---

## Analytics

### PostHog (Session Recording & Analytics)
- **Project Key:** `phc_xAvL2Iq4tFmANRE7kzbKwaSqp1HJjN7x48s3vr0CMjs`
- **Host:** `https://us.i.posthog.com`
- Configured in `/app/frontend/public/index.html`

### Meta Pixel (Facebook Ads)
- **Pixel ID:** `1335832275226509`
- Configured in `/app/frontend/src/utils/metaPixel.js`
- Events tracked: `InitiateCheckout`, `Purchase`

---

## Production Domain

- **Live URL:** `https://benefills.com`
- **Preview URL:** `https://payment-confirmed-3.preview.emergentagent.com`
- **GitHub Repo:** `https://github.com/ishanshauryajaiswal/benefills-emergent`
- **Active Branch:** `apeksha`

---

## Deployment Steps (Emergent Platform)

1. Make code changes in the Emergent workspace
2. Click **Deploy** button in the Emergent chat UI
3. Wait ~10–15 minutes for the build and deployment to complete
4. Verify at `https://benefills.com`

> **Important:** After any change to `/app/backend/.env`, a redeployment is required for the new env vars to take effect in production.

---

## Auto-Seeded Data (on fresh DB)

On first startup with an empty database, the backend auto-seeds:
- **4 Products:** Thyrovibe Seeds Boost Bar, Thyrovibe Nut-ella Nut Butter, Thyrovibe nut butters duo, Benefills Monthly Pack
- **3 Coupons:** (see `seed_data.py`)
- **1 Admin User**

---

## Admin Access

The admin dashboard is available at `/admin` (requires admin credentials seeded on startup — check `backend/seed_data.py` for the default admin email/password).

---

## Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/` | Health check |
| GET | `/api/products/` | List all products |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/orders/` | Create order |
| GET | `/api/orders/` | List orders |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify-payment` | Verify Razorpay signature |
| POST | `/api/payments/webhook` | Razorpay webhook handler |
| GET | `/api/coupons/` | List active coupons |
| POST | `/api/coupons/validate` | Validate coupon code |

---

## Known Issues & Fixes Applied

| Issue | Fix |
|---|---|
| "body stream already read" on payment | Replaced `fetch` with `axios` in `useRazorpay.js` (PostHog session recording was intercepting native fetch) |
| 500 on order creation | Fixed `OrderCreate` model to include `paymentId` and `paymentStatus` fields |
| Razorpay client with null keys | Made client lazy-initialized inside route handler |
| Wrong codebase deployed | Correct Benefills code from `apeksha` branch used |
| `.env` not deployed to production | Removed `*.env` patterns from `.gitignore` so credentials are included in deployments |

---

## Service Management (Local/Preview)

```bash
# Check service status
sudo supervisorctl status

# Restart backend only
sudo supervisorctl restart backend

# Restart frontend only
sudo supervisorctl restart frontend

# Restart all
sudo supervisorctl restart all

# View backend error logs
tail -f /var/log/supervisor/backend.err.log
```

---

## Tech Stack Versions

| Package | Version |
|---|---|
| Python | 3.11 |
| FastAPI | 0.110.1 |
| React | 19.0.0 |
| Motor (MongoDB async) | 3.3.1 |
| Razorpay Python SDK | 2.0.0 |
| react-router-dom | 7.5.1 |
