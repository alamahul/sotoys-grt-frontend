# SOTOYS GRT — Frontend

E-commerce platform for **SOTOYS GARUT** (toko online mainan anak). Built with React 19, Vite 8, TypeScript, and Tailwind CSS v4.

## Features

### Public
- Product catalog with search, category filter, and sorting
- Product detail page with reviews
- Cart & wishlist management (Context-based)
- 3-step checkout: address → courier selection → confirmation
- Order tracking with interactive timeline
- Promo, FAQ, shipping info, terms, privacy, returns pages

### Customer Dashboard
- Order history & detail tracking
- Wishlist management
- Return requests & return tracking
- Notifications
- Profile & address book management

### Admin Panel
- Sales analytics with interactive charts (Recharts)
- Order management & payment verification
- Product catalog & stock management
- User management
- Settings & system logs

### Platform
- PWA (Progressive Web App) with offline support
- Custom animated cursor & background icons
- Toast & alert notification system (SweetAlert2)
- QR code scanner (html5-qrcode)
- PDF invoice export (jsPDF)
- Live chat button
- Express mock server with auth, OTP, shipping, and product APIs
- Auto-cancellation scheduler for unpaid orders

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Icons | Lucide React |
| Charts | Recharts |
| Notifications | SweetAlert2 |
| Animation | Motion |
| PWA | vite-plugin-pwa |
| PDF | jsPDF + jspdf-autotable |
| QR | html5-qrcode |
| Metadata | react-helmet-async |
| Server | Express (dev/mock API) |
| Runtime | tsx |

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Shared components (Header, Footer, HeroCarousel, ProductCard, etc.)
│   ├── context/            # React contexts (Auth, Cart, Wishlist, Toast, Alert)
│   ├── data/               # Static/mock data
│   ├── hooks/              # Custom hooks
│   ├── layouts/            # CustomerLayout & AdminLayout
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin dashboard, orders, products, analysis
│   │   ├── customer/       # Customer dashboard, orders, profile, returns
│   │   └── info/           # FAQ, Shipping, Terms, Privacy, Returns
│   ├── App.tsx             # Routes & providers
│   ├── config.ts           # App configuration
│   ├── main.tsx            # Entry point + PWA SW registration
│   ├── types.ts            # TypeScript types
│   └── index.css           # Global styles + Tailwind
├── server.ts               # Express mock API server (auth, products, shipping, orders, OTP)
├── .env.example            # Environment variable template
├── vite.config.ts          # Vite + PWA + Tailwind plugin config
├── tsconfig.json
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+

### Commands

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start dev server (Vite + Express mock API on port 3000)
npm run dev

# Type check
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `DATABASE_URL` | PostgreSQL connection string |
| `MIDTRANS_SERVER_KEY` | Midtrans server key |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Midtrans client key |
| `MIDTRANS_IS_PRODUCTION` | Midtrans environment flag |
| `NEXT_PUBLIC_APP_URL` | Application base URL |
| `NEXT_PUBLIC_APP_NAME` | Application name |

## Routes

### Public
`/`, `/catalog`, `/product/:id`, `/cart`, `/checkout`, `/tracking`, `/login`, `/register`, `/about`, `/promo`, `/faq`, `/shipping`, `/terms`, `/privacy`, `/returns`

### Customer (Protected)
`/customer/dashboard`, `/customer/orders`, `/customer/orders/:id`, `/customer/return/:orderId`, `/customer/returns`, `/customer/notifications`, `/customer/profile`, `/wishlist`

### Admin (Protected)
`/admin`, `/admin/orders`, `/admin/orders/:id`, `/admin/products`, `/admin/products/:id`, `/admin/analysis`, `/admin/settings`, `/admin-sotoys-grt/login`

## License

Apache-2.0
