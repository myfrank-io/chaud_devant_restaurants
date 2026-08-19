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
  unsubscribe_token  uuid NOT NULL DEFAULT gen_random_uuid(),

  -- Consentement distinct de l'inscription elle-meme. S'inscrire vaut accord
  -- pour recevoir le menu offert — c'est l'objet de la demarche. Recevoir les
  -- recettes et les nouvelles est autre chose, et se demande a part. Faux par
  -- defaut : une case pre-cochee ne vaut pas consentement.
  marketing_opt_in   boolean NOT NULL DEFAULT false
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

-- ---------------------------------------------------------------------------
-- Atelier : ce qu'on prepare, ce qu'on publie.
--
-- Trois objets, trois roles distincts :
--   lignes   — les fils editoriaux, chacun un dossier de posts
--   posts    — une video ou une photo a produire, rangee dans une ligne
--   recipes  — le texte de la recette, tel qu'il paraitra sur le site
--
-- Un post et une recette parlent souvent du meme plat sans avoir le meme
-- cycle de vie : le post se tourne et se publie une fois, la recette se
-- corrige pendant des annees. D'ou deux tables, reliees sans etre confondues.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS recipes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  title         text NOT NULL,
  category      text,
  seasons       text[] NOT NULL DEFAULT '{}',
  minutes       integer,
  difficulty    text,
  angle         text,
  cover         text,
  post_url      text,
  intro         text[] NOT NULL DEFAULT '{}',
  ingredients   text[] NOT NULL DEFAULT '{}',
  steps         text[] NOT NULL DEFAULT '{}',
  -- null = brouillon. Cette colonne decide de la parution, mais elle ne
  -- suffit pas : voir reviewed_at.
  published_at  timestamptz,
  -- Relecture humaine. Nul tant que personne n'a ouvert la fiche et
  -- enregistre. Une recette redigee par le modele nait a nul : sans ce
  -- garde-fou, la caler au calendrier publierait des quantites inventees.
  reviewed_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recipes_published_at_idx ON recipes (published_at DESC);

CREATE TABLE IF NOT EXISTS lignes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  -- Ce que la ligne raconte, en une phrase. C'est elle qu'on relit quand on
  -- se demande si un post a sa place ici.
  intention     text,
  position      integer NOT NULL DEFAULT 0,
  -- Une ligne finie s'archive au lieu de se supprimer : ses posts publies
  -- restent consultables.
  archived_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Une ligne supprimee ne doit pas emporter ses posts ; ils remontent dans
  -- les posts sans ligne, ou on decide quoi en faire.
  ligne_id      uuid REFERENCES lignes (id) ON DELETE SET NULL,
  recipe_id     uuid REFERENCES recipes (id) ON DELETE SET NULL,
  title         text NOT NULL,
  channel       text NOT NULL DEFAULT 'instagram',
  format        text NOT NULL DEFAULT 'reel',
  hook          text,
  script        text,
  -- 'voix' ou 'musique' : un post porte l'un ou l'autre, jamais les deux.
  son_type      text,
  son           text,
  caption       text,
  -- Ou trouver le rush ou le montage. Un lien, pas un fichier : le stockage
  -- video n'a rien a faire dans une base Postgres.
  media_url     text,
  -- null = pas encore cale. Un post vit d'abord dans sa ligne, la date vient
  -- apres — c'est l'inverse qui ferait perdre du temps.
  scheduled_on  date,
  status        text NOT NULL DEFAULT 'idee',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_scheduled_on_idx ON posts (scheduled_on);
CREATE INDEX IF NOT EXISTS posts_ligne_id_idx ON posts (ligne_id);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lignes ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  EXECUTE 'REVOKE ALL ON recipes, lignes, posts FROM anon, authenticated';
EXCEPTION WHEN undefined_object THEN
  NULL;
END $$;

-- Boite a idees : la liste ou l'on jette ce qui traverse, avant tri.
-- Cocher archive plutot que supprimer — une idee ecartee reste une trace de
-- ce a quoi on a deja pense.
CREATE TABLE IF NOT EXISTS idees (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  texte       text NOT NULL,
  archived_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE idees ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  EXECUTE 'REVOKE ALL ON idees FROM anon, authenticated';
EXCEPTION WHEN undefined_object THEN
  NULL;
END $$;
