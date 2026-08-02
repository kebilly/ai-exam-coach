# AI Exam Coach

AI Exam Coach is an internal exam-practice platform designed for postal promotion exam preparation. It combines civil law essay grading, English practice generation, member access control, usage limits, learning records, and an admin dashboard into a deployable MVP.

The project focuses on showing how LLM applications can be turned into a controlled learning product rather than a simple chatbot demo.

## Project Goals

- Help learners practice civil law essay answers with structured grading feedback.
- Generate English practice questions aligned with internal exam preparation needs.
- Preserve learning records for review and follow-up practice.
- Restrict formal usage to approved members through admin activation or invite codes.
- Prevent uncontrolled API usage through server-side authorization and daily limits.
- Provide a portfolio-ready example of AI product planning, LLM workflow design, backend access control, and deployment readiness.

## Core Features

### Civil Law Essay Grading

- Supports civil law essay answer submission.
- Grades by structured dimensions such as issue spotting, legal authority, reasoning, subsumption, consistency, and conclusion.
- Uses a configurable civil-law grading standard.
- Separates scoring, feedback, schema validation, and legacy frontend adaptation.
- Includes regression tests and diagnostic scripts for grading calibration.
- Supports OCR upload for handwritten answer recognition.

### English Practice

- Generates English practice questions with Chinese explanations.
- Uses seed question-bank patterns to avoid overly long or expensive generation.
- Supports formal member-only usage with daily limits.
- Records user attempts and correctness.

### Member Access Control

- Users can register and log in through Supabase Auth.
- Formal practice APIs require approved member or admin status.
- Admin can activate/deactivate users.
- Admin can generate one-time invite codes.
- Invite codes are stored as hashes, not plaintext.
- Unapproved users cannot call formal OpenAI-backed APIs.

### Admin Dashboard

- View users, roles, plans, and usage summaries.
- Activate or deactivate formal access.
- Promote or demote admin role.
- Generate and disable invite codes.
- View civil law, English, and AI usage records by user.
- Filter records by user.
- Delete individual practice or usage records when needed.

## Architecture Overview

```text
Next.js App Router
  |
  |-- Client Pages
  |     |-- Home
  |     |-- Login / Register
  |     |-- Dashboard
  |     |-- Civil Law Practice
  |     |-- English Practice
  |     |-- History
  |     |-- Admin
  |
  |-- API Routes
        |-- /api/law/grade
        |-- /api/law/ocr
        |-- /api/english/generate
        |-- /api/english/submit
        |-- /api/profile/unlock
        |-- /api/admin/*
        |
        |-- Auth / Usage / OpenAI / Supabase services

Supabase
  |-- Auth
  |-- PostgreSQL
  |-- Row Level Security

OpenAI API
  |-- Civil law grading
  |-- OCR support
  |-- English question generation
```

## Civil Law Grading Design

The civil law grading module is located in:

```text
src/lib/civil-law-grading/
```

Key files:

```text
config.ts          grading dimensions, weights, caps, and version settings
schema.ts          structured JSON grading output schema
service.ts         grading workflow and scoring engine
prompts.ts         LLM prompt layers
anchors.ts         high/mid/low anchor answers
legacy-adapter.ts  maps structured grading JSON to existing frontend cards
```

The scoring flow emphasizes:

- question-specific rubric selection
- element-level subsumption evaluation
- importance-weighted element scoring
- programmatic total score calculation
- score caps for major defects
- deduction tracking
- regression diagnostics

This design prevents the model from freely inventing final scores and makes grading behavior easier to test and calibrate.

## Security and Access Control

The project separates browser-safe configuration from server-only secrets.

Public browser variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
```

Server-only variables:

```text
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
OPENAI_MODEL
```

Formal APIs enforce:

- valid logged-in Supabase session
- member/admin access
- daily usage limits
- server-side API calls only
- no client-side OpenAI key exposure

Sensitive files are ignored by Git:

```text
.env.local
.env
.next
node_modules
backups
output
```

Additional GitHub safety notes are documented in:

```text
docs/github-security-check-notes.md
```

## Database

Database schema and hardening SQL are in:

```text
supabase/schema.sql
supabase/security-hardening.sql
```

Main tables:

```text
user_profiles
law_submissions
english_exercises
usage_logs
member_invite_codes
```

The database supports:

- user profile and role/plan control
- practice history
- usage logs
- hashed invite codes
- RLS-based user isolation
- admin-only server-side management

## Environment Variables

Create `.env.local` from `.env.example`.

Required local variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_SITE_URL=http://localhost:4000
DAILY_USAGE_LIMIT=10
LAW_DAILY_LIMIT=2
LAW_OCR_DAILY_LIMIT=3
ENGLISH_DAILY_LIMIT=1
UNLOCK_ATTEMPT_DAILY_LIMIT=10
DEMO_API_ENABLED=false
```

For Vercel, set the same variables in Project Settings > Environment Variables.

## Local Development

Install dependencies:

```cmd
npm install
```

Run locally on port 4000:

```cmd
cd /d C:\Projects\LAW_KK
set NODE_OPTIONS=--use-system-ca
npm run dev -- -p 4000
```

`NODE_OPTIONS=--use-system-ca` is useful on Windows when local antivirus or certificate inspection causes Node.js to reject Supabase HTTPS certificates.

Local URL:

```text
http://localhost:4000
```

Main test pages:

```text
http://localhost:4000/demo/law
http://localhost:4000/demo/english
http://localhost:4000/dashboard
http://localhost:4000/admin
```

## Verification

Run TypeScript check:

```cmd
npx tsc --noEmit --incremental false
```

Run civil law regression tests:

```cmd
npm run test:civil-law
```

Run civil law diagnostic report:

```cmd
npm run diagnose:civil-law
```

Run production build:

```cmd
npm run build
```

Avoid running `npm run build` while `npm run dev` is still active, because both may write to `.next`.

## Deployment

Current deployment target:

```text
Vercel
```

Typical deployment flow:

```cmd
git status
git add .
git commit -m "Update feature"
git push
```

Vercel redeploys automatically when the connected GitHub `main` branch receives a new commit.

If only environment variables are changed in Vercel, manually trigger Redeploy.

## Portfolio Highlights

This project demonstrates:

- AI product planning for a real learning workflow
- LLM workflow design beyond a basic chat interface
- structured scoring and feedback generation
- legal-domain rubric calibration
- prompt/schema separation
- member access control and API cost protection
- Supabase Auth and PostgreSQL integration
- admin operations and usage visibility
- regression testing for grading stability
- deployment readiness with GitHub and Vercel

## Current Status

This is a deployable MVP / production prototype for controlled internal testing.

Current focus:

- stabilize the four core civil law grading patterns
- verify generated English questions with historical exam materials
- keep formal usage limited to approved users
- collect feedback from a small group of testers
- improve grading quality through regression cases rather than broad rewrites
