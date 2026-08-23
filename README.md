# FairShare

FairShare is a full-stack shared-expense app built with React, Express, and a server-side JSON database. It includes authenticated accounts, friends, groups, invitation links, selective expense splitting, explainable balances, partial settlements, receipts, activity history, and spending statistics.

## Start the app

Use Node.js 20 or newer.

```bash
npm install
npm run install:all
npm run dev
```

Open `http://127.0.0.1:4173`. The API runs at `http://localhost:4000`.

For normal Vite hot reload outside the restricted Codex desktop sandbox, use these in separate terminals:

```bash
npm run dev --prefix backend
npm run dev:hot --prefix frontend
```

## Verify the project

```bash
npm test
npm run build
```

The backend tests use an isolated JSON file and cover cent-safe splitting, balance netting, duplicate friend requests, expense creation, partial settlements, and overpayment rejection.

## Configuration

Copy `backend/.env.example` to `backend/.env` before a real deployment and replace `JWT_SECRET`. Fill `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` with the sender account details to enable password-recovery emails. Set `APP_URL` to the frontend address used in reset links. The frontend can use `frontend/.env` with `VITE_API_URL` when the API is hosted somewhere else.

## Project structure

```text
backend/
  src/controllers
  src/middleware
  src/models
  src/routes
  src/services
  src/utils
  tests
frontend/
  src/components
  src/context
  src/hooks
  src/pages
  src/services
  src/utils
context.md
```

`context.md` is the running source of project decisions and change history for future work.
