-- Clipfarm wallet registry
-- Store private keys encrypted (AES-256-GCM) + metadata for jobs.

create table if not exists public.clipfarm_wallets (
  id bigserial primary key,
  address text not null unique,

  -- AES-256-GCM envelope
  enc_pk_base64 text not null,
  enc_iv_base64 text not null,
  enc_tag_base64 text not null,

  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  status text not null default 'new', -- new | funded | trove_open | active | error
  note text
);

create index if not exists clipfarm_wallets_status_idx on public.clipfarm_wallets(status);
create index if not exists clipfarm_wallets_last_used_idx on public.clipfarm_wallets(last_used_at);

