-- Add new columns to the profiles table for project ideas and hackathon goals
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS project_ideas text,
ADD COLUMN IF NOT EXISTS hackathon_goals text[],
ADD COLUMN IF NOT EXISTS preferred_team_size integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS availability_hours integer DEFAULT 24;

-- Create an index on hackathon_goals for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_hackathon_goals ON public.profiles USING GIN (hackathon_goals); 