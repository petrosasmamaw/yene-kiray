# 🏠 የኔ ኪራይ (Yene Kiray) — Multi-Category Rental Platform

A modern, high-end rental marketplace connecting property and vehicle owners with renters across Ethiopia and beyond.

---

## 🎨 Visual Identity & UI Design System
- **Color Palette:** Rich Amber Gold (`#F59E0B`, `#EAB308`), Pitch Black (`#050505`), Obsidian (`#0D0D0D`), and Crisp White (`#FFFFFF`).
- **Icons:** 100% SVG Vector icons via `lucide-react` (No emojis in the UI).
- **Layout:** Spacious, uncluttered, luxury feel with generous padding and subtle gold ambient glows.

---

## 🛠️ Technology Stack

| Component | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Redux Toolkit, Tailwind CSS, Lucide Icons, Socket.io-client, Axios |
| **Backend** | Node.js, Express, Socket.io, JWT, bcryptjs, Multer |
| **Database** | Neon Serverless PostgreSQL (`@neondatabase/serverless` & `pg`) |
| **Media Cloud** | Cloudinary (Direct & signed uploads for listing images and payment receipts) |

---

## 📁 Project Structure

```
yene-kiray/
├── server/
│   ├── config/
│   │   ├── db.js             # Neon PostgreSQL Connection Pool
│   │   └── cloudinary.js     # Cloudinary Media Configuration
│   ├── controllers/
│   │   ├── authController.js     # User registration (strictly role: user) & login
│   │   ├── listingController.js  # Rental listings CRUD & dynamic pay-to-post check
│   │   ├── paymentController.js  # User proof submissions (Telebirr / CBE)
│   │   ├── adminController.js    # Financial KPIs, approvals, user status & pricing
│   │   ├── categoryController.js # Categories management
│   │   └── chatController.js     # Real-time message storage
│   ├── middleware/
│   │   └── auth.js               # JWT protection & requireAdmin guard
│   ├── routes/                   # Modular REST API endpoints
│   ├── scripts/
│   │   ├── schema.sql            # Neon DB DDL schema & seed data
│   │   ├── initDb.js             # Runs schema.sql on Neon DB
│   │   └── seedAdmin.js          # TERMINAL-ONLY Super Admin creation script
│   ├── .env.example              # Template with demo keys
│   ├── .env                      # Local environment configuration
│   ├── package.json
│   └── server.js                 # Express + Socket.io Server
│
├── frontend/
│   ├── public/
│   │   ├── logo-badge.png        # Official 3D Amharic "የኔ" brand emblem badge
│   │   ├── logo.png              # High-res 3D brand logo
│   │   └── favicon.png           # App icon & favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Gold/black brand bar with role badges
│   │   │   ├── Footer.jsx        # Luxury footer with categories & trust badges
│   │   │   ├── ListingCard.jsx   # Spacious card with price badge & saved toggle
│   │   │   ├── ListingDetailModal.jsx # Multi-image gallery & contact
│   │   │   ├── PaymentModal.jsx  # Pay-to-Post instructions & proof submission
│   │   │   ├── ChatDrawer.jsx    # Real-time Socket.io chat slide-over
│   │   │   └── AuthModal.jsx     # Login / Register modal
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # Hero search, category picker, listings grid
│   │   │   ├── PostListingPage.jsx # Multi-field form with Cloudinary upload
│   │   │   ├── SavedPage.jsx     # Bookmarked rental items
│   │   │   ├── MyListingsPage.jsx# User's listings with approval status tracking
│   │   │   └── AdminDashboardPage.jsx # Financials, payment queue, user toggles
│   │   ├── services/
│   │   │   ├── api.js            # Axios client with JWT interceptor
│   │   │   └── socket.js         # Socket.io client singleton
│   │   ├── store/
│   │   │   ├── store.js          # Combined Redux Toolkit store
│   │   │   └── slices/           # authSlice, listingSlice, chatSlice, adminSlice
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── .env
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── workflow.md                   # Client-approved business specification
```

---

## 🚀 Getting Started

### 1. Backend Setup
1. Navigate to `/server`:
   ```bash
   cd server
   npm install
   ```
2. Configure `.env`:
   Open `server/.env` and replace the demo keys with your actual **Neon PostgreSQL** and **Cloudinary** credentials:
   - `DATABASE_URL`: Your Neon connection string
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `JWT_SECRET`
3. Initialize the Neon Database:
   ```bash
   npm run db:init
   ```
4. **Seed the Super Admin via Terminal:**
   ```bash
   npm run seed:admin
   ```
   *(Web registration is strictly locked to role="user". Only this terminal script can initialize administrative privileges!)*
5. Start the API & Realtime server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to `/frontend`:
   ```bash
   cd ../frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## 🔒 Security Highlights
- **Role-Based Auth (RBAC):** Admin endpoints (`/api/admin/*`) require `role === 'admin'`. Public signups are explicitly set to `user`.
- **Pay-to-Post Flow:** When Admin sets `pay_to_post_enabled = true`, listings enter `pending` state until Admin reviews payment and approves. When turned `false`, posts go live immediately for free.
- **Real-Time Online Chat:** Socket.io room scoping per conversation prevents cross-talk.
