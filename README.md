# Event Management Platform

A production-quality MVP for reusable event operations: event publishing, attendee registration, QR ticketing, reminder emails, and check-in tracking.

This project was built as a full-stack Next.js application with a strong focus on clean UX, operational clarity, and extension-friendly architecture. It is designed to support multiple events over time rather than a single one-off campaign.

## Overview

Event Management Platform solves a practical workflow gap common across institutions, teams, and community programs:

- event pages are hard to update and manage consistently
- attendance is difficult to forecast before the event
- ticketing and validation are often handled manually
- check-in data is fragmented or missing entirely
- reminder communication is usually disconnected from registration data

This MVP brings those steps into one system:

1. Admin creates an event and its sessions.
2. Attendees register for the full event or specific sessions.
3. The system generates unique QR-based tickets.
4. Attendees receive a digital ticket immediately and optionally by email.
5. Admin validates tickets during check-in.
6. Dashboard metrics update to reflect registrations and attendance.

## Highlights

- Multi-event architecture with reusable event and session models
- Public event landing pages with clean registration flows
- Duplicate-registration protection by attendee email and scope
- QR ticket generation with downloadable PNG tickets
- Admin check-in by ticket code or QR scan
- Reminder email campaigns for registered attendees
- Dashboard metrics for registrations, check-ins, and session counts
- Mobile-friendly UI with shared design primitives and loading states
- Vercel-friendly Next.js App Router structure

## Tech Stack

- Next.js App Router
- React 19
- TypeScript
- PostgreSQL
- Prisma ORM
- Tailwind CSS
- Nodemailer for SMTP delivery
- QRCode for QR generation
- `@resvg/resvg-js` for server-rendered PNG ticket downloads
- `jsqr` for browser-based QR scanning in the admin check-in flow

## Product Scope

### Public experience

- Homepage with published events
- Event landing page with event details and session list
- Registration form for full-event or per-session signup
- Ticket confirmation screen after registration
- Individual digital ticket page
- Downloadable ticket asset and copyable ticket link

### Admin experience

- Admin login using allowlisted email plus access code
- Event creation with sessions and optional community link
- Dashboard with key operational metrics
- Attendee search and CSV export
- Check-in desk with QR/manual validation
- Reminder email campaigns for registered attendees

## Core Features

### 1. Event management

Admins can create:
- event title
- description
- start and end date
- one or more sessions
- optional session capacity
- optional WhatsApp or Telegram community link

### 2. Registration flow

Attendees can:
- register for the full event
- register for one or more specific sessions
- submit name, email, and phone number

### 3. Ticketing

For each registration, the platform:
- creates a unique ticket code
- stores the ticket in PostgreSQL
- generates a QR code pointing to the ticket URL
- renders a digital ticket page
- supports PNG ticket download

### 4. Check-in

Admins can:
- validate by pasted ticket code
- validate by QR scan
- prevent duplicate check-ins
- store a timestamped check-in log

### 5. Email workflows

When SMTP is configured:
- attendees receive a registration confirmation email with ticket links
- admins can send reminder emails to registered attendees
- reminder delivery reports full success, partial success, or failure

## Architecture

### App structure

- `app/` contains route handlers, pages, and server actions
- `components/` contains shared UI and interactive client components
- `lib/` contains auth, Prisma, email, ticket, and data utilities
- `prisma/` contains the schema, migrations, and seed data

### Main domain models

- `Event`
- `Session`
- `User`
- `Ticket`
- `CheckInLog`

### Key relationships

- one event has many sessions
- one user can own many tickets
- one ticket belongs to one event and optionally one session
- one ticket can generate one or more check-in logs over time, while duplicate live check-in is blocked

## UX Decisions

This MVP intentionally favors low-friction participation over account-heavy complexity.

- No attendee account is required.
- Ticket access is immediate after registration.
- Email is supportive, not mandatory, for ticket access.
- Admin auth is intentionally lightweight for MVP use: allowlisted email plus access code.
- Buttons, surfaces, alerts, and form controls use shared visual primitives for consistency.

## Responsiveness

The interface is designed for:
- mobile registration flows
- tablet admin usage at check-in desks
- desktop event operations and reporting

Loading states are included across navigable routes and primary form submissions to keep interactions clear during server transitions.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file based on `.env.example`.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ticketing_system?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_EMAILS="admin@example.com,operations@example.com"
ADMIN_ACCESS_CODE="change-this-admin-code"
SESSION_SECRET="change-this-session-secret"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="no-reply@example.com"
SMTP_PASS="replace-with-smtp-password"
SMTP_FROM="Event Management Platform <no-reply@example.com>"
```

### 3. Run Prisma migrations

```bash
npx prisma migrate dev --name init
```

### 4. Seed demo data

```bash
npm run db:seed
```

### 5. Start the app

```bash
npm run dev
```

## Demo Flow

1. Sign in at `/admin/login` with an allowlisted admin email and the shared access code.
2. Create an event and add one or more sessions.
3. Open the public event page and register an attendee.
4. Review the generated ticket confirmation screen.
5. Open the digital ticket or download the ticket asset.
6. Use `/admin/check-in` to validate the ticket.
7. Return to `/admin` to review updated counts.

## Example Admin Credentials Pattern

Use environment variables like:

```env
ADMIN_EMAILS="admin@example.com,ops@example.com"
ADMIN_ACCESS_CODE="team-shared-access-code"
SESSION_SECRET="a-long-random-secret"
```

The admin session is stored in a signed HTTP-only cookie and is revalidated on protected admin pages.

## Email Configuration

SMTP is optional but recommended.

When configured, the platform supports:
- registration confirmation emails
- reminder campaigns from the admin dashboard

Typical SMTP variables:

```env
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="no-reply@example.com"
SMTP_PASS="your-password-or-app-password"
SMTP_FROM="Event Management Platform <no-reply@example.com>"
```

## CSV Export

Admins can export attendee data filtered by:
- event
- search query

This makes the MVP more useful for operations, reporting, and follow-up workflows.

## Seeded Demo Content

The seed script creates a sample multi-session event so the app can be demoed quickly after setup.

## Deployment Notes

This project is structured to be deployment-ready for platforms like Vercel.

Recommended production setup:
- PostgreSQL database
- secure session secret
- real SMTP provider
- restricted admin email allowlist
- HTTPS-enabled deployment

## Known MVP Boundaries

The current implementation intentionally keeps a few areas simple:
- admin auth is not yet role-based
- attendee accounts are not included
- reminder sending is SMTP-based, not queue-backed
- certificate generation is not implemented yet
- reminder campaigns are manual, not scheduled

## Extension Opportunities

This foundation can be extended into:
- certificates
- calendar invites
- wallet passes
- notifications
- scheduled reminders
- role-based admin permissions
- analytics dashboards
- multi-tenant event organizations

## Why This Project Works Well In A Portfolio

This project demonstrates:
- full-stack product thinking
- UX-focused operational tooling
- relational data modeling with Prisma
- server actions and route handlers in Next.js App Router
- real workflow design beyond CRUD pages
- practical handling of edge cases like duplicate registrations and duplicate check-ins
- production-aware features such as CSV export, reminder delivery states, and SMTP integration

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

## Verification

A production build should pass with:

```bash
npm run build
```

## License

This repository currently has no license specified.
