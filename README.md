# Clivo Shop

Swipe-driven social shopping prototype migrated from Firebase to Supabase and prepared for Vercel.

## Stack

- React 19 + Vite
- Tailwind CSS 4
- Framer Motion
- Supabase Auth, Postgres, RLS, and Realtime
- Vercel-ready static deployment

## Supabase

The app uses:

- `clivo_shop_state` for each signed-in guest's cart, likes, and followed stores.
- `clivo_shop_listings` for seller-created products.
- Row Level Security for ownership controls.
- Supabase Realtime for state/listing refreshes.

The migration is included at `supabase/migrations/001_clivo_shop.sql`.

### Required Auth setting

Enable **Anonymous Sign-Ins** in the Supabase project's Authentication settings. The app creates an anonymous authenticated user so cart and social state can be protected by RLS.

## Environment

Optional overrides:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

This repository contains a browser-safe Supabase publishable-key fallback for the connected project. No Supabase secret/service-role key is included.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm install
npm run build
```

## Vercel

Import the GitHub repository `SE-66/TESY` as a new Vercel project. Vite should be detected automatically. The default build command is `npm run build` and output directory is `dist`.

Do not attach this code to the existing `nextjs-boilerplate` Vercel project; that project is a separate production app.
