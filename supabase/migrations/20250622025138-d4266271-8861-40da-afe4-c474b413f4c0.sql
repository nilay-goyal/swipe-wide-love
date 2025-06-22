
-- Add new columns to the profiles table for hackathon information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS linkedin text,
ADD COLUMN IF NOT EXISTS github text,
ADD COLUMN IF NOT EXISTS devpost text,
ADD COLUMN IF NOT EXISTS major text,
ADD COLUMN IF NOT EXISTS school text,
ADD COLUMN IF NOT EXISTS year text,
ADD COLUMN IF NOT EXISTS uiux integer,
ADD COLUMN IF NOT EXISTS pitching integer,
ADD COLUMN IF NOT EXISTS management integer,
ADD COLUMN IF NOT EXISTS hardware integer,
ADD COLUMN IF NOT EXISTS cyber integer,
ADD COLUMN IF NOT EXISTS frontend integer,
ADD COLUMN IF NOT EXISTS backend integer,
ADD COLUMN IF NOT EXISTS skills text[];
