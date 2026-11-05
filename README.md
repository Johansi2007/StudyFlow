# StudyFlow – Online Starter

React + Vite + Supabase starter with email/password registration, login, per-user flashcards and tasks.

## Requirements
- Node.js LTS
- A Supabase project with the `flashcards` and `tasks` tables and RLS policies

## Setup
1. Extract this ZIP.
2. Open the extracted folder in VS Code or a terminal.
3. Copy `.env.example` to `.env.local`.
4. Set `VITE_SUPABASE_URL` to the project URL (without `/rest/v1/`) and `VITE_SUPABASE_ANON_KEY` to the Supabase **Publishable** key.
5. Run `npm install` and then `npm run dev`.
6. Open the local URL printed by Vite.

Never put a Supabase Secret key or service_role key in this frontend project. Do not commit `.env.local` to GitHub.

## Included
- Sign up, sign in, sign out
- User-owned flashcards and tasks
- RLS-protected database access

## Not included yet
- Weekly free-tier time limit enforcement
- Payments / Premium subscriptions
- Real AI homework helper or image uploads
- Production deployment, legal pages, privacy workflows

These need additional server-side implementation and testing before public launch. Payment and legal setup should be handled with a parent/guardian if the project owner is under 18.
