-- Chaud Devant — schema de la liste d'inscrits.
--
-- Regle d'architecture (QG 6.4) : la liste vit ici, pas dans l'outil d'emailing.
-- Resend ne sert qu'a envoyer. Consequences : le compteur de Fondateurs se lit
-- d'une requete, l'attribution d'un numero est fiable, et la carte de densite
-- par ville se sort en une ligne de SQL.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS subscribers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email              text UNIQUE NOT NULL,
  city               text,
  founder_number     integer UNIQUE,       -- 1..500, attribue a la confirmation, NULL au-dela
  created_at         timestamptz NOT NULL DEFAULT now(),
  confirmed_at       timestamptz,          -- double opt-in
  unsubscribed_at    timestamptz,

  -- Ajouts au schema du QG, imposes par la section 11.3
  -- (« double opt-in et lien de desinscription des le premier email ») :
  -- deux secrets distincts de la cle primaire, pour ne pas faire d'un identifiant
  -- qui fuite dans les logs et les URL un jeton d'authentification.
  confirm_token      uuid NOT NULL DEFAULT gen_random_uuid(),
  unsubscribe_token  uuid NOT NULL DEFAULT gen_random_uuid()
);

CREATE INDEX IF NOT EXISTS subscribers_city_idx ON subscribers (city);
CREATE INDEX IF NOT EXISTS subscribers_confirmed_at_idx ON subscribers (confirmed_at);
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_confirm_token_idx ON subscribers (confirm_token);
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_unsubscribe_token_idx ON subscribers (unsubscribe_token);

-- IMPORTANT : une desinscription ne remet jamais founder_number a NULL.
-- Le numero reste porte par la ligne, ce qui garantit qu'il n'est jamais
-- reattribue a quelqu'un d'autre (QG 6.4).
