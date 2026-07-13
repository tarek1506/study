# Deploying to Cloudflare Pages

This project is a Vite React app, so Cloudflare Pages can deploy it directly.

## Build settings

Use these settings in Cloudflare Pages:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`
- Node.js version: `24` or latest available

## Environment variables

Add these variables in Cloudflare Pages > Settings > Environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Use the same values from your local `.env.local` file. Do not upload `.env.local`.

## Supabase URL settings

After Cloudflare gives you a Pages URL, add it in Supabase:

1. Open Supabase Dashboard.
2. Go to Authentication > URL Configuration.
3. Set Site URL to your Cloudflare Pages URL.
4. Add your Cloudflare Pages URL to Redirect URLs.

For example:

```text
https://your-project.pages.dev
https://your-project.pages.dev/**
```

## SPA routing

`public/_redirects` is included so routes like `/profile` and `/courses/:id` work after refresh.