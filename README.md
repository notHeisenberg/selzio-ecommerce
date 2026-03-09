# Selzio — Full-Stack E-Commerce Platform

> A feature-rich, production-ready e-commerce platform built with **Next.js 15**, **MongoDB**, and **Tailwind CSS**. Selzio supports full product & combo management, multi-step checkout, order tracking, wishlists, social authentication, real-time reviews, and a complete admin dashboard — all with a responsive, dark/light-mode UI.

🌐 **Live Demo:** [https://selzio.netlify.app](https://selzio.netlify.app) &nbsp;|&nbsp; 📁 **Repo:** [github.com/yourusername/selzio-ecommerce](https://github.com/yourusername/selzio-ecommerce)

---

## 🚀 Key Features

### 🛍️ Shopping & Product Discovery
- **Product Catalog** — Browseable product listings with image gallery, descriptions, and size/variant selection
- **Combo Deals** — Bundle products into combo offers with **size-based dynamic pricing** and configurable save amounts
- **Smart Filtering** — Filter by category, price range, size, color, and more using a dedicated filter sidebar
- **Search** — Instant product search with real-time results
- **Related Products** — Algorithmically surfaced related items on the product detail page
- **Top-Selling Section** — Homepage section showcasing best-performing products, server-rendered for performance

### 🛒 Cart & Checkout
- **Persistent Cart** — Cart state managed client-side with full add/remove/quantity controls
- **Multi-Step Checkout** — Structured checkout flow with dedicated sections:
  - Shipping address & shipping method selection
  - Order review with itemized summary
  - Payment method selection
  - Policy dialogs (returns, shipping terms)
- **Order Confirmation** — Post-checkout confirmation with confetti animation

### 📦 Order Management
- **Order History** — Full order list with status tracking per order line
- **Order Tracking** — Dedicated `/track-order` page for real-time order status lookup
- **Admin Order Controls** — Admin users can update order statuses directly from the dashboard

### 👤 User Account & Profile
- **Authentication** — Email/password sign-up + **Google & Facebook OAuth** via NextAuth.js
- **Profile Management** — Edit name, avatar, and account details
- **Wishlist** — Save and manage favourite products; synced to the database per user
- **Account Dashboard** — Tabbed interface covering:
  - Profile
  - Orders
  - Wishlist
  - Settings
  - Product Management (admin-only)

### 🔐 Admin Dashboard
- **Product Management** — Full CRUD for products: create, edit, delete, image upload via Cloudinary
- **Combo Management** — Create and manage combo deals with per-size discount configuration
- **Order Management** — View all orders; update fulfilment/payment status inline
- **Testimonials** — Manage customer testimonials displayed on the homepage
- **Role-Based Access** — Admin-only routes and UI sections protected by middleware

### 🎨 UI & Experience
- **Dark / Light Mode** — System-aware theme toggle powered by `next-themes`
- **Responsive Design** — Mobile-first layout with adaptive navbar, drawers, and grids
- **Animations** — Smooth page transitions and micro-interactions via **Framer Motion** & **GSAP**
- **AOS (Animate On Scroll)** — Section reveal animations
- **Radix UI Primitives** — Accessible dialogs, dropdowns, tabs, tooltips, and more
- **Rich Text Sections** — CMS-style rich text blocks on the homepage
- **Testimonials Carousel** — Auto-rotating customer review carousel

### ⭐ Reviews
- Submit star ratings and written reviews on product pages
- Review list rendered server-side for SEO; new reviews submitted via API

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Server Components) |
| **Language** | JavaScript (JSX) |
| **Styling** | Tailwind CSS v3, Radix UI, HeroUI |
| **Animation** | Framer Motion, GSAP, AOS |
| **Database** | MongoDB + Mongoose |
| **Auth** | NextAuth.js v4 (Credentials, Google, Facebook) |
| **Image Storage** | Cloudinary |
| **State Management** | TanStack React Query v5 |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Deployment** | Netlify (via `@netlify/plugin-nextjs`) |

---

## 📁 Project Structure

```
selzio-ecommerce/
├── src/
│   ├── app/                    # Next.js App Router pages & API routes
│   │   ├── (pages)/            # Store, Products, Combos, Cart, Checkout…
│   │   ├── account/            # User dashboard (profile, orders, wishlist)
│   │   ├── auth/               # Sign-in / sign-up pages
│   │   └── api/                # REST API routes
│   │       ├── auth/           # NextAuth + credentials endpoints
│   │       ├── products/       # Product CRUD
│   │       ├── combos/         # Combo CRUD with size pricing
│   │       ├── orders/         # Order creation & status management
│   │       ├── reviews/        # Review submission & retrieval
│   │       ├── wishlist/       # Wishlist add/remove/list
│   │       ├── users/          # User profile updates
│   │       ├── cloudinary/     # Image upload & management
│   │       └── testimonials/   # Testimonial CRUD
│   ├── components/             # Reusable React components
│   │   ├── home/               # Hero, categories, combos, testimonials sections
│   │   ├── product/            # Product card, detail, gallery
│   │   ├── combo/              # Combo card, detail
│   │   ├── checkout/           # Multi-step checkout sections
│   │   ├── account/            # Profile, orders, wishlist, settings tabs
│   │   ├── filters/            # Filter sidebar and controls
│   │   ├── layout/             # Navbar, footer, theme toggle
│   │   └── ui/                 # Shared primitives (buttons, modals, badges…)
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # MongoDB connection, utilities
│   ├── middleware/             # Auth & role-based route protection
│   └── utils/                  # Helper functions (price range, formatting…)
├── public/                     # Static assets
├── scripts/                    # DB index setup scripts
└── .env.local                  # Environment variables (not committed)
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18.x or later
- npm
- MongoDB Atlas (or local MongoDB)
- Google & Facebook OAuth credentials
- Cloudinary account

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/selzio-ecommerce.git
cd selzio-ecommerce
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# MongoDB
MONGODB_URI=your-mongodb-connection-string

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Set Up Database Indexes

```bash
npm run setup:indexes
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🚢 Production Deployment

This project is configured for **Netlify** deployment out of the box via `@netlify/plugin-nextjs`.

```bash
# Build for production
npm run build
```

1. Push to GitHub
2. Connect your repo to Netlify
3. Set all environment variables in the Netlify dashboard (update `NEXTAUTH_URL` to your production domain)
4. Deploy

> See [DEPLOYMENT_GUIDE_NETLIFY.md](./DEPLOYMENT_GUIDE_NETLIFY.md) for the full Netlify deployment walkthrough.

---

## 🔑 OAuth Setup

### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an **OAuth 2.0 Client ID** (Web Application)
3. Add Authorized Redirect URIs:
   - `http://localhost:3001/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google`

### Facebook
1. Go to [Facebook Developers](https://developers.facebook.com/) → Add **Facebook Login** product
2. Add OAuth Redirect URIs:
   - `http://localhost:3001/api/auth/callback/facebook`
   - `https://your-domain.com/api/auth/callback/facebook`

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack, port 3001) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run setup:indexes` | Add MongoDB indexes for performance |

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

This project is licensed under the **MIT License**.
