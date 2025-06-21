
-- Remove unused user_hackathons table and related functions since the current code doesn't use them
DROP TABLE IF EXISTS public.user_hackathons CASCADE;
DROP FUNCTION IF EXISTS public.get_user_hackathons(UUID);
DROP FUNCTION IF EXISTS public.join_hackathon(UUID, UUID);
DROP FUNCTION IF EXISTS public.leave_hackathon(UUID, UUID);

-- Ensure the profiles table has all the columns the current code expects
-- (these should already exist based on the migration, but ensuring consistency)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS devpost_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_projects JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS work_experience JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS education_details JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS devpost_projects JSONB DEFAULT '[]'::jsonb;
