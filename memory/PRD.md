# Benefills - Product Requirements Document

## Original Problem Statement
E-commerce platform for thyroid health products (Benefills). User needed the correct codebase deployed, Razorpay payment integration fixed for production, and Shiprocket shipping configured.

## Core Requirements
- React frontend + FastAPI backend + MongoDB
- Razorpay live payment integration
- Shiprocket shipping integration
- PostHog analytics + Meta Pixel tracking
- Admin dashboard at /admin
- Guest checkout supported

## What's Been Implemented
- [x] Correct Benefills codebase deployed
- [x] Razorpay payment flow (create-order, verify-payment, webhook)
- [x] Shiprocket shipping API integration
- [x] Cart persistence with localStorage
- [x] Coupon system (3 seeded coupons)
- [x] Auto-seed products on empty DB
- [x] DEPLOYMENT.md with all credentials
- [x] Fixed: body stream already read error (fetch -> axios)
- [x] Fixed: 500 on payment (lazy Razorpay client init, OrderCreate model)
- [x] Fixed: .env files not deployed to production (removed *.env from .gitignore)

## Production Credentials (in backend/.env)
- Razorpay: Live keys configured
- Shiprocket: Email/password configured
- Webhook: benefills.com/api/payments/webhook

## Architecture
- Frontend: React 19, Tailwind CSS, Shadcn/UI, Axios
- Backend: FastAPI, Motor (async MongoDB), Pydantic
- Auth: JWT
- Payments: Razorpay SDK
- Shipping: Shiprocket REST API
- Analytics: PostHog, Meta Pixel

## Key Files
- /app/backend/routes/payments.py - Razorpay payment routes
- /app/backend/routes/orders.py - Order management
- /app/backend/routes/shiprocket.py - Shipping integration
- /app/frontend/src/hooks/useRazorpay.js - Frontend payment hook
- /app/frontend/src/context/CartContext.js - Cart with localStorage persistence
- /app/frontend/src/pages/Checkout.jsx - Checkout page

## Pending Items
- P0: User must REDEPLOY to push .gitignore fix to production (Razorpay keys will be included after redeploy)
- P1: User must whitelist production domain (benefills.com) in Razorpay Dashboard > Accounts & Settings > Business Website Details

## Backlog
- None identified
