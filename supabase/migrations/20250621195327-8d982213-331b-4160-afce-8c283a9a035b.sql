
-- Add new columns to the profiles table for social links and scraped data
ALTER TABLE public.profiles 
ADD COLUMN github_url TEXT,
ADD COLUMN devpost_url TEXT,
ADD COLUMN linkedin_url TEXT,
ADD COLUMN github_projects JSONB DEFAULT '[]'::jsonb,
ADD COLUMN work_experience JSONB DEFAULT '[]'::jsonb,
ADD COLUMN education_details JSONB DEFAULT '[]'::jsonb;

-- Update the existing education and occupation columns to be more flexible
-- (keeping them for backward compatibility but we'll use the new JSONB fields)
