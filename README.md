# AI Exam Coach Beta

5-day MVP for an internal exam training pilot: civil law essay grading, English question generation, user records, admin review, and Zeabur deployment.

## Stack

- Next.js App Router
- Supabase Auth and PostgreSQL
- OpenAI API
- Tailwind CSS
- Zeabur deployment

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
3. Fill in Supabase and OpenAI environment variables.
4. Install and run:

```bash
npm install
npm run dev
```

## Zeabur

Use GitHub deployment.

- Build command: `npm run build`
- Start command: `npm run start`
- Add all variables from `.env.example` to Zeabur environment variables.

In Supabase Auth settings, set the site URL to the Zeabur domain and add redirect URLs:

```text
https://your-zeabur-domain/**
http://localhost:3000/**
```

