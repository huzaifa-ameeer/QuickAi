# Quick.ai

AI-powered content creation SaaS. Generate articles, blog titles, images, remove backgrounds/objects, and review resumes — with Clerk authentication, a free tier, and a premium plan.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, Clerk (`@clerk/react`), React Router, react-markdown
- **Backend:** Node.js, Express 5, Clerk (`@clerk/express`), Neon (PostgreSQL)
- **AI APIs:** Google Gemini (articles/titles/resume review), Clipdrop (image generation, background & object removal)
- **Storage:** Cloudinary (image uploads, with automatic base64 fallback)

## Project Structure

```
├── client/               # React + Vite frontend
│   ├── src/
│   │   ├── components/   # Navbar, Sidebar, ResultPanel, UpgradePrompt, etc.
│   │   ├── pages/        # Home, Dashboard, and AI tool pages
│   │   └── config/api.js # API client + useApi hook
└── server/               # Express backend
    ├── configs/          # db (Neon), cloudinary, schema.sql
    ├── controllers/      # aiController (all AI + CRUD logic)
    ├── middlewares/      # auth (Clerk + plan/free-usage check)
    └── routes/           # aiRoutes
```

## Features

- **AI Article Writer** — free tier (10 uses), premium unlimited
- **Blog Title Generator** — free tier (10 uses), premium unlimited
- **AI Image Generation** — premium only
- **Background Removal** — premium only
- **Object Removal** — premium only
- **Resume Reviewer** — free tier (10 uses), premium unlimited
- **Community** — browse published creations, like/unlike
- **Dashboard** — history, delete, plan & usage tracking
- **Plans** — Clerk-hosted pricing table (premium = `plan: premium` permission)

## Setup

### 1. Prerequisites

- Node.js 20+
- A Clerk app with:
  - A **publishable key** and **secret key**
  - A `premium` plan permission/session claim so the backend can detect premium users
  - A Clerk-hosted **PricingTable** configured with your plans (used on the home page)
- A Neon (PostgreSQL) database
- A Google Gemini API key
- A Clipdrop API key
- Cloudinary credentials (optional — if missing, generated images are stored as base64)

### 2. Configure environment

```bash
cp server/.env.example server/.env   # add your real values
cp client/.env.example client/.env   # add VITE_CLERK_PUBLISHABLE_KEY
```

### 3. Install dependencies

```bash
npm run install-all
```

### 4. Create the database schema

Run `server/configs/schema.sql` against your Neon database (creates the `creations` table).

### 5. Run in development

```bash
npm run dev
```

- Frontend: http://localhost:5173 (proxies `/api` to the backend)
- Backend: http://localhost:3000

## Deploy (production)

1. Build the frontend:
   ```bash
   npm run build
   ```
   This outputs the static site to `client/dist`.

2. Start the server:
   ```bash
   npm start
   ```
   The Express server detects `client/dist` and serves it automatically, including the SPA fallback, so a single process serves both the API and the app.

### Deploying the server

- Set all environment variables listed in `server/.env.example` (use the production values for each provider).
- Make sure `client/dist` exists before starting (run `npm run build`).
- Any Node hosting works (Render, Railway, Fly.io, Vercel serverless with a Node adapter, etc.). For serverless, note that `client/dist` must be included in the deploy artifact.

## API Reference

All routes are under `/api/ai` and require a `Authorization: Bearer <session-token>` header (or the Clerk cookie when using the frontend proxy).

| Method | Endpoint                  | Auth  | Description                                  |
| ------ | ------------------------- | ----- | -------------------------------------------- |
| GET    | `/api/ai/creations`       | user  | Current user's creations + plan + free usage |
| GET    | `/api/ai/community`       | user  | Published creations with authors & likes     |
| POST   | `/api/ai/generate-article`| free  | Generate article (`{ prompt, length }`)      |
| POST   | `/api/ai/generate-blog-title` | free | Generate blog titles (`{ prompt }`)       |
| POST   | `/api/ai/generate-image`  | premium | Generate image (`{ prompt, publish }`)     |
| POST   | `/api/ai/remove-background` | premium | Remove background (multipart `image`)     |
| POST   | `/api/ai/remove-object`   | premium | Remove object (multipart `image` + `object`) |
| POST   | `/api/ai/review-resume`   | free   | Review resume (multipart `resume` PDF)       |
| POST   | `/api/ai/like`            | user   | Toggle like (`{ creationId }`)               |
| DELETE | `/api/ai/creations/:id`   | user   | Delete own creation                          |
