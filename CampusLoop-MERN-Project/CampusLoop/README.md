# CampusLoop — MERN Student Marketplace

A runnable starter project for a college-focused marketplace built with React, Express, Node.js, and MongoDB.

## Features
- Student registration and login with hashed passwords and JWT authentication
- Role-aware user model (`student`, `admin`)
- Create, browse, search, filter, edit, and delete listings
- Save/unsave listings
- Send purchase, exchange, or rental requests
- Listing owner can accept/reject requests
- Report listings
- Admin dashboard endpoints for listing/user moderation
- Responsive React UI
- Optional image URLs for listings

> This is a portfolio-ready starter, not a production-hardened marketplace. Email verification, real-time chat, hosted image uploads, automated tests, and deployment configuration are suitable next steps.

## Requirements
- Node.js 20+
- MongoDB local instance or MongoDB Atlas database

## 1. Configure backend
```bash
cd server
copy .env.example .env
npm install
```
Edit `server/.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.

For macOS/Linux, use `cp .env.example .env`.

## 2. Start backend
```bash
npm run dev
```
API defaults to `http://localhost:5000`.

## 3. Configure and start frontend
Open a second terminal:
```bash
cd client
npm install
copy .env.example .env
npm run dev
```
Open the URL printed by Vite (usually `http://localhost:5173`).

## Admin account
Register normally, then promote your account directly in MongoDB for local development:
```javascript
db.users.updateOne({ email: "your-email@example.com" }, { $set: { role: "admin" } })
```
Never expose an admin self-registration option in a public deployment.

## Main API routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/listings`
- `GET /api/listings/:id`
- `POST /api/listings`
- `PATCH /api/listings/:id`
- `DELETE /api/listings/:id`
- `GET /api/users/saved`
- `POST /api/users/saved/:listingId`
- `DELETE /api/users/saved/:listingId`
- `POST /api/requests`
- `GET /api/requests/mine`
- `GET /api/requests/received`
- `PATCH /api/requests/:id`
- `POST /api/reports`
- `GET /api/admin/summary`
- `GET /api/admin/listings`
- `PATCH /api/admin/listings/:id/status`

## Notes
- Passwords are hashed with bcrypt.
- JWT is stored in localStorage in this educational starter. For a production app, consider secure, httpOnly cookies and CSRF protections.
- Listings accept an optional image URL. Do not trust arbitrary uploads; use a managed image storage service and validate uploaded files if you add uploads.
- CORS is configured for the local Vite URL. Update `CLIENT_URL` for deployment.
