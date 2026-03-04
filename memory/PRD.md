# Benefills - Product Requirements Document

## Original Problem Statement
Replace the incorrect "System Status Monitor" codebase in the Emergent workspace with the correct "Benefills" e-commerce application from the GitHub repository `https://github.com/ishanshauryajaiswal/benefills-emergent` (apeksha branch) and get it running correctly.

## Application Overview
Benefills is an e-commerce platform selling thyroid-health-focused nut butters and bars (e.g., ThyroVibe). It targets users with thyroid health concerns, offering products based on real whole foods with adaptogens.

## Tech Stack
- **Frontend:** React, React Router v7, Tailwind CSS, Shadcn/UI, Lucide React
- **Backend:** FastAPI, Uvicorn
- **Database:** MongoDB (via Motor async driver)
- **Authentication:** JWT (python-jose, passlib, bcrypt)
- **Payments:** Razorpay
- **Shipping:** Shiprocket
- **Build Tool:** CRACO

## Core Features
- Homepage with hero section, typewriter header, Us vs Them section, testimonials, lifestyle section
- Product listing (Shop page)
- Product detail page
- Shopping cart (sidebar)
- User authentication (Login/Register)
- Checkout with Razorpay payment integration
- Order success page
- Coupon/discount codes
- Admin dashboard
- Static pages (Terms, Privacy, Returns, Payments & Delivery, Contact)

## DB Schema
- **Product:** id, name, price, description, image, category, stock
- **User:** id, name, email, password_hash, role
- **Order:** id, orderId, items, total, status, userId
- **Coupon:** id, code, discountPercentage, isActive

## Key API Endpoints
- `GET /api/` - Health check
- `GET/POST /api/products/` - Product CRUD
- `POST /api/auth/register`, `POST /api/auth/login`
- `GET/POST /api/orders/`
- `POST /api/payment/create-order`, `POST /api/payment/verify-signature`
- `GET /api/coupons/`
- Shiprocket integration endpoints

## Environment Variables (backend/.env)
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name
- `JWT_SECRET_KEY` - JWT signing secret
- `RAZORPAY_KEY_ID` - Razorpay API key (needs to be configured)
- `RAZORPAY_KEY_SECRET` - Razorpay secret (needs to be configured)
- `SHIPROCKET_EMAIL` - Shiprocket login email (needs to be configured)
- `SHIPROCKET_PASSWORD` - Shiprocket password (needs to be configured)

## What's Been Implemented
- **2026-03-04:** Successfully migrated codebase from System Status Monitor to Benefills e-commerce app. Source: `apeksha` branch of GitHub repo. Backend auto-seeds 4 products, 3 coupons, and admin user on startup. All services running.

## Prioritized Backlog
### P0 - Critical
- Configure Razorpay API keys for payment processing
- Configure Shiprocket credentials for shipping

### P1 - Important
- End-to-end testing of checkout flow
- Test coupon code application
- Test admin dashboard functionality

### P2 - Nice to Have
- Email notifications via Resend
- Order tracking integration
