-- Consentement marketing, distinct de l'inscription.
-- S'inscrire vaut accord pour le menu offert ; recevoir les recettes et les
-- nouvelles se demande a part. Faux par defaut : une case pre-cochee ne vaut
-- pas consentement.
ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false;
