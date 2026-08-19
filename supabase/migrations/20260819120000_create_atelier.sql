-- Atelier : lignes directrices, posts, recettes.
-- Miroir de db/schema.sql, voir ce fichier pour les commentaires.

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

CREATE TABLE IF NOT EXISTS public.recipes (
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
  -- null = brouillon. Cette colonne, et elle seule, decide de la presence
  -- d'une recette sur le site public.
  published_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recipes_published_at_idx ON public.recipes (published_at DESC);

CREATE TABLE IF NOT EXISTS public.lignes (
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

CREATE TABLE IF NOT EXISTS public.posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Une ligne supprimee ne doit pas emporter ses posts ; ils remontent dans
  -- les posts sans ligne, ou on decide quoi en faire.
  ligne_id      uuid REFERENCES public.lignes (id) ON DELETE SET NULL,
  recipe_id     uuid REFERENCES public.recipes (id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS posts_scheduled_on_idx ON public.posts (scheduled_on);
CREATE INDEX IF NOT EXISTS posts_ligne_id_idx ON public.posts (ligne_id);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lignes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.recipes, public.lignes, public.posts FROM anon, authenticated;
