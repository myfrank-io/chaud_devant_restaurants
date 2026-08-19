-- Une recette redigee par le modele doit passer devant un humain avant de
-- paraitre. reviewed_at porte cette relecture : nul tant que personne n'a
-- ouvert la fiche et enregistre.
--
-- Le rattrapage met a jour l'existant : ces recettes-la ont ete ecrites a la
-- main, elles sont relues par construction, et les laisser a nul les
-- retirerait du site.
ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

UPDATE public.recipes
   SET reviewed_at = COALESCE(reviewed_at, created_at)
 WHERE reviewed_at IS NULL;
