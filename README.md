# Interview Prep Tracker + Analytics Dashboard

A full-stack web app to log LeetCode/interview practice, track streaks, and view simple analytics (solves by difficulty + minutes logged). Built with Next.js + Supabase and deployed on Vercel.

## Live App
- https://interview-prep-tracker-vercel.vercel.app/login

## Features
- Email/password authentication (Supabase Auth)
- Log solves (problem slug, difficulty, minutes, date, notes)
- Dashboard stats (streak, minutes logged, difficulty breakdown)
- Create + delete entries
- Per-user data isolation via Supabase Row Level Security (RLS)

## Tech Stack
- Next.js (App Router) + TypeScript
- Supabase (Postgres, Auth, RLS)
- Vercel

## Local Development

### 1) Install
- npm install

### 2) Add environment variables
Create a file named `.env.local` in the project root and add:

NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL  
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

### 3) Run
- npm run dev

Open: http://localhost:3000

## Deployment (Vercel)
This project is deployed on Vercel. In the Vercel dashboard, set these environment variables for Production/Preview:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Then deploy/redeploy.

## Database & RLS Policies
RLS policies are saved in:
- `supabase/rls.sql`

These policies enforce per-user access for the `submissions` table:
- users can SELECT only their rows
- users can INSERT only rows where `user_id = auth.uid()`
- users can DELETE only their rows

If delete ever “does nothing”, it’s usually missing the DELETE policy (RLS).
