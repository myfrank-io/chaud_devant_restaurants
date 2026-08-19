-- Chaud Devant — schema de la liste d'inscrits.
--
-- Regle d'architecture (QG 6.4) : la liste vit ici, pas dans l'outil d'emailing.
-- Resend ne sert qu'a envoyer. Consequences : le compteur d'inscrits se lit
-- d'une requete, et la carte de densite par ville se sort en une ligne de SQL.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS subscribers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email              text UNIQUE NOT NULL,
  city               text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  confirmed_at       timestamptz,          -- double opt-in
  unsubscribed_at    timestamptz,

  -- Deux secrets distincts de la cle primaire, imposes par la section 11.3
  -- (« double opt-in et lien de desinscription des le premier email ») : un
  -- identifiant qui circule dans les URL et les journaux ne fait pas un jeton.
  confirm_token      uuid NOT NULL DEFAULT gen_random_uuid(),
  unsubscribe_token  uuid NOT NULL DEFAULT gen_random_uuid()
);

CREATE INDEX IF NOT EXISTS subscribers_city_idx ON subscribers (city);
CREATE INDEX IF NOT EXISTS subscribers_confirmed_at_idx ON subscribers (confirmed_at);
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_confirm_token_idx ON subscribers (confirm_token);
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_unsubscribe_token_idx ON subscribers (unsubscribe_token);

-- Le droit au menu offert se lit ici : confirmed_at renseigne et
-- unsubscribed_at nul. C'est la seule source de verite le jour de l'ouverture.

-- Supabase : PostgREST est ouvert au public via la cle publishable, donc la
-- table doit etre fermee aux roles anon et authenticated. Le site ne passe pas
-- par PostgREST mais par une connexion Postgres directe, qui n'est pas soumise
-- a RLS — d'ou une RLS active sans aucune politique.
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  EXECUTE 'REVOKE ALL ON subscribers FROM anon, authenticated';
EXCEPTION WHEN undefined_object THEN
  -- Postgres local : ces roles n'existent pas, il n'y a rien a revoquer.
  NULL;
END $$;
