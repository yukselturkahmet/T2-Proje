# T2 Leave

Staff leave management for T2: employees request leave and track their balance;
admins approve or reject requests and manage employees. The rules of Turkish
Labour Law No. 4857 (as amended by Law No. 7578, in force since 1 May 2026) are
built in and checked both while a request is being filled in and on the server.

The interface is available in Turkish and English and uses T2's own brand:
the company logo and its blue (#0B5181) and green (#7DB543), with the logo's
two overlapping circles as the main visual motif. Option switches (filters,
language, year, navigation) use a highlight that slides to the selected
option.

## What it does

**Employees**
- See their available annual leave, how it was calculated, and when the next
  days are added.
- Request any leave type. The form shows the working days deducted, public
  holidays in the range, the balance afterwards, and every rule the request
  breaks — before it is sent.
- Withdraw pending requests, or approved ones before the leave starts.

**Admins**
- Approval queue (oldest first) with who is on leave today and who is away in
  the next 30 days.
- Approve or reject with a note. Balance, yearly limits and overlaps are
  checked again at approval time; admins can't approve their own requests.
- Search all requests by status, employee, type and year.
- Add and edit employees, reset passwords, deactivate accounts, and correct
  annual leave balances (e.g. days carried over from a previous system).

## Leave rules

All rules live in one file, [`shared/policy.js`](shared/policy.js), used by
both the API and the web app. The Rules page in the app lists them.

| Type | Limit | Notice | Backdating | Basis |
| --- | --- | --- | --- | --- |
| Annual | From balance: 14 / 20 / 26 days by seniority, at least 20 if aged ≤18 or ≥50; needs 1 year of service | 3 days | — | 4857 m.53–56 |
| Sick | No limit, doctor's report | — | 30 days | 5510 m.18 |
| Marriage | 3 days | — | — | 4857 Ek m.2 |
| Paternity | 10 days | — | 30 days | 4857 Ek m.2 |
| Bereavement | 3 days | — | 30 days | 4857 Ek m.2 |
| Adoption | 3 days | — | 30 days | 4857 Ek m.2 |
| Disabled / chronically ill child | 10 days a year | — | 30 days | 4857 Ek m.2 |
| Maternity | 24 weeks (26 for multiple pregnancy), calendar days | — | 30 days | 4857 m.74 |
| Personal (company rule) | 5 days a year | 1 day | — | Company |
| Unpaid (company rule) | 30 days per request | 7 days | — | Company |

General rules: weekends and public holidays aren't deducted and holiday eves
count as half a day; open requests can't overlap; requests can start at most
365 days ahead; a reason is required for every type except annual leave.

Public holidays, including Ramazan and Kurban Bayramı, are in
[`shared/calendar.js`](shared/calendar.js) for 2026–2028. The 2028 religious
holiday dates are provisional; add new years there as Diyanet publishes them.

## Project structure

```
backend/                 GraphQL API (Node.js, graphql-js, Sequelize, PostgreSQL)
  src/
    index.js             starts the server
    server.js            HTTP server: /graphql and /health, CORS, body limits
    graphql.js           schema + resolvers, error formatting
    schema.js            GraphQL type definitions
    resolvers.js         thin layer: auth checks, then services
    services/            leave and user business logic
    auth.js              password hashing (scrypt), signed tokens, sign-in throttling
    db.js                Sequelize models: users, leave_requests
    config.js            settings from backend/.env
  scripts/               setup, demo data, legacy migration
  test/                  rule unit tests and API tests against PostgreSQL
personel-izin-formu/     Web app (React 18, Vite, styled-components)
  src/
    api/                 GraphQL client, operations, in-browser demo backend
    auth/                session context
    components/          design system: buttons, forms, cards, dialogs, layout,
                         brand logo, sliding option switch
    i18n/                Turkish and English text
    pages/               screens (admin screens in pages/admin)
    theme/               colour tokens and global styles
shared/                  leave rules and holiday calendar, used by both sides
```

## Getting started

Requirements: Node.js 20.12 or newer and PostgreSQL.

### 1. API

```bash
cd backend
cp .env.example .env        # fill in DB_* and TOKEN_SECRET
npm install
npm run setup -- --username admin --password 'Choose-a-passw0rd' --first-name Ada --last-name Yılmaz
npm run dev                 # http://localhost:4000/graphql
```

`npm run setup` creates the tables and the first admin account. To try the app
with sample people and requests instead, run `npm run seed:demo` (all demo
accounts use the password `Demo1234`).

Coming from the first version of this project? `npm run migrate:legacy` copies
accounts from the old `employees` and `admins` tables. Set their names and hire
dates on the Employees page afterwards.

| Setting | Default | Purpose |
| --- | --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | `localhost`, `5432`, `postgres`, `postgres`, — | PostgreSQL connection |
| `PORT` | `4000` | API port |
| `TOKEN_SECRET` | random (dev only) | Signs sign-in tokens. Required in production, at least 32 characters |
| `TOKEN_TTL_HOURS` | `8` | How long a sign-in lasts |
| `CORS_ORIGIN` | `http://localhost:5180` | Allowed web app origin(s), comma separated |

### 2. Web app

```bash
cd personel-izin-formu
npm install
npm run dev                 # http://localhost:5180
```

The dev server always uses port 5180 (`strictPort`) so it never clashes with
other local projects, and forwards `/graphql` to the API on port 4000.

**No database at hand?** On the sign-in page choose *Open demo mode*. The app
then runs against an in-browser copy of the API with sample data, applying the
same rules. Demo data stays in that browser only.

### Tests

```bash
cd backend
npm test
```

Runs the rule tests and end-to-end API tests. The API tests use a separate
database (`t2_leave_test`, created automatically) that is wiped on every run.

## Security

- Passwords are stored as salted scrypt hashes and never returned by the API.
- Sign-in returns an HMAC-signed token (8 hours by default). The account is
  reloaded on every request, so deactivated users lose access at once.
- Five failed sign-ins lock a username for five minutes.
- Every admin operation is checked on the server; employees can only see and
  change their own requests.
- Requests are created inside a transaction that locks the employee's row, so
  two requests sent at once can't both pass the balance and overlap checks.
