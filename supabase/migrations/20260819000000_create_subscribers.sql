-- Miroir de db/schema.sql, applique au projet Supabase abrppxmowjspqjbpgmfb.
-- Voir db/schema.sql pour les commentaires d'architecture.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.subscribers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email              text UNIQUE NOT NULL,
  city               text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  confirmed_at       timestamptz,
  unsubscribed_at    timestamptz,
  confirm_token      uuid NOT NULL DEFAULT gen_random_uuid(),
  unsubscribe_token  uuid NOT NULL DEFAULT gen_random_uuid()
);

CREATE INDEX IF NOT EXISTS subscribers_city_idx ON public.subscribers (city);
CREATE INDEX IF NOT EXISTS subscribers_confirmed_at_idx ON public.subscribers (confirmed_at);
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_confirm_token_idx ON public.subscribers (confirm_token);
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_unsubscribe_token_idx ON public.subscribers (unsubscribe_token);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.subscribers FROM anon, authenticated;
