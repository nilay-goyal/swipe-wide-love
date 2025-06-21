
-- Create user_hackathons table
CREATE TABLE IF NOT EXISTS public.user_hackathons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hackathon_event_id UUID REFERENCES public.hackathon_events(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, hackathon_event_id)
);

-- Enable RLS
ALTER TABLE public.user_hackathons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own hackathon participations" 
  ON public.user_hackathons 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own hackathon participations" 
  ON public.user_hackathons 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hackathon participations" 
  ON public.user_hackathons 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add devpost_projects column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS devpost_projects JSONB DEFAULT '[]'::jsonb;

-- Create helper functions for user hackathon management
CREATE OR REPLACE FUNCTION get_user_hackathons(user_uuid UUID)
RETURNS TABLE(hackathon_event_id UUID)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT uh.hackathon_event_id
  FROM user_hackathons uh
  WHERE uh.user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION join_hackathon(user_uuid UUID, event_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_hackathons (user_id, hackathon_event_id)
  VALUES (user_uuid, event_uuid)
  ON CONFLICT (user_id, hackathon_event_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION leave_hackathon(user_uuid UUID, event_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM user_hackathons 
  WHERE user_id = user_uuid AND hackathon_event_id = event_uuid;
END;
$$;
