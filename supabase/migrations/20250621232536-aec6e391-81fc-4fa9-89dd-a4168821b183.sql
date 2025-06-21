
-- Add a joined_events column to the profiles table to store hackathon IDs the user has joined
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS joined_events TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create an index for better performance when querying joined events
CREATE INDEX IF NOT EXISTS idx_profiles_joined_events ON public.profiles USING GIN(joined_events);
