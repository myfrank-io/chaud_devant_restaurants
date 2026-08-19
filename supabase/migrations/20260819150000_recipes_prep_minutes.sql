-- Deux temps distincts sur une fiche : la preparation (les mains) et la
-- cuisson (le feu). La colonne `minutes` portait une duree totale ; elle
-- devient le temps de cuisson — pour un mijote, c'est le chiffre qui compte,
-- et le total se calcule en additionnant les deux.
-- Miroir de db/schema.sql, voir ce fichier pour les commentaires.

ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS prep_minutes integer;
