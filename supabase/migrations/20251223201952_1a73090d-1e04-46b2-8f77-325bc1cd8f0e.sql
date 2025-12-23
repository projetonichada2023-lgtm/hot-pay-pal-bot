-- Add onboarding_completed column to clients table
ALTER TABLE public.clients 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;