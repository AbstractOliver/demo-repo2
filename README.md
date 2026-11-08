# Acme Invoicing

A small multi-tenant invoicing app: workspaces on seat-based plans, customers, invoices and card payments.

- `server/`: Node + TypeScript API (Express, node-postgres)
- `web/`: React + Vite frontend
- `db/`: schema and seed data

## Run it

```sh
npm install
npm run db:up
npm run db:reset
npm run dev:server   # http://localhost:3000
npm run dev:web      # http://localhost:5173
```

Sign in with any seeded user, for example `maya@acme.test`.
