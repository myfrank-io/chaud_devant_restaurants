-- Boite a idees. Cocher archive plutot que supprimer.

CREATE TABLE IF NOT EXISTS public.idees (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  texte       text NOT NULL,
  archived_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.idees ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.idees FROM anon, authenticated;
