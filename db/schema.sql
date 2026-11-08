drop table if exists payments, invoices, customers, invites, sessions, members, users, workspaces cascade;

create table workspaces (
  id text primary key,
  name text not null,
  plan text not null default 'starter' check (plan in ('starter', 'team', 'business')),
  invoice_counter integer not null default 0,
  created_at timestamptz not null default now()
);

create table users (
  id text primary key,
  email text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table members (
  workspace_id text not null references workspaces (id) on delete cascade,
  user_id text not null references users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table sessions (
  token text primary key,
  user_id text not null references users (id) on delete cascade,
  expires_at timestamptz not null
);

create table invites (
  id text primary key,
  workspace_id text not null references workspaces (id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  token text not null unique,
  invited_by text not null references users (id),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table customers (
  id text primary key,
  workspace_id text not null references workspaces (id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table invoices (
  id text primary key,
  workspace_id text not null references workspaces (id) on delete cascade,
  customer_id text not null references customers (id),
  number text not null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'EUR',
  status text not null default 'draft' check (status in ('draft', 'open', 'paid', 'void')),
  due_date date not null,
  created_at timestamptz not null default now(),
  unique (workspace_id, number)
);

create index invoices_workspace_status on invoices (workspace_id, status);

create table payments (
  id text primary key,
  workspace_id text not null references workspaces (id) on delete cascade,
  invoice_id text not null references invoices (id),
  amount_cents integer not null,
  currency text not null,
  provider_charge_id text not null unique,
  created_at timestamptz not null default now()
);
