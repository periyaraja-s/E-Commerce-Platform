# E-Commerce Platform

A full-stack e-commerce application built with React, Node.js, Express, and MongoDB. The project includes a customer storefront, admin workflows, product and category management, order handling, and Razorpay test-mode payment integration.

## Live Demo

- **Storefront:** https://e-commerce-platform-mocha-pi.vercel.app/
- **Products API:** https://e-commerce-platform-server.onrender.com/api/products
- **GitHub:** https://github.com/periyaraja-s/E-Commerce-Platform

> The payment integration is configured for Razorpay test mode. Do not use real payment details. The backend uses Render's free web service, which may sleep after inactivity; the first request after a period of inactivity can take longer while it wakes.

## Features

### Customer
- Browse products and categories
- Register, sign in, and manage an authenticated session
- Add products to cart
- Place orders and view order information
- Use Razorpay test-mode checkout

### Admin
- Admin-authenticated management area
- Manage products and categories
- View and manage orders
- Dashboard summary information

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, React Router, Axios, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs |
| Payments | Razorpay (test mode) |
| Frontend hosting | Vercel |
| API hosting | Render |

## Deployment Architecture

```text
Customer / Admin Browser
          |
          v
React + Vite frontend (Vercel)
          |
          | HTTPS API requests
          v
Node.js + Express REST API (Render)
          |
          v
MongoDB Atlas

Checkout -> Razorpay Test Mode
```

## Run Locally

### Requirements
- Node.js (LTS recommended)
- npm
- MongoDB Atlas database or a local MongoDB instance
- Razorpay test keys for payment testing

### 1. Clone the repository

```bash
git clone https://github.com/periyaraja-s/E-Commerce-Platform.git
cd E-Commerce-Platform
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` at the repository root and provide your own values:

```env
PORT=3000
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
VITE_API_URL=http://localhost:3000/api

ADMIN_NAME=Store Administrator
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=replace_with_a_strong_password
CUSTOMER_EMAIL=your_demo_customer_email
CUSTOMER_PASSWORD=replace_with_a_strong_password

RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
RAZORPAY_WEBHOOK_SECRET=
```

Never commit real credentials, database URIs, or payment secrets. Replace all example/default passwords before running the application.

### 3. Start the application

```bash
npm run dev
```

The development server starts at the configured local port. The Vite frontend is served through the backend development setup.

## Deployment Notes

### Frontend (Vercel)
- Framework: Vite
- Root directory: `client` if deploying the client workspace directly; if using the repository root, configure the workspace build command and output directory accordingly.
- Environment variable:
  - `VITE_API_URL=https://e-commerce-platform-server.onrender.com/api`
- Redeploy after changing Vite environment variables because they are embedded at build time.

### Backend (Render)
- Service type: Web Service
- Runtime: Node
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Set the backend environment variables in Render's Environment section. Do not place frontend-only `VITE_API_URL` there.

## Security & Demo Notes

- Use test credentials and test payment keys for demonstrations.
- Keep secrets in local environment files or hosting-provider environment settings, never in source control.
- Restrict database network access appropriately for your deployment.
- This repository is a portfolio/demo project; review and harden configuration, authorization, payment verification, and operational settings before production use.

## License

No license has been specified for this repository. Contact the repository owner before reusing the code.
