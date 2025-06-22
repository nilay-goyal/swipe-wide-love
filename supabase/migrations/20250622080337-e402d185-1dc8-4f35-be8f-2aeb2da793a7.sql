
-- Create hackathon_participants table to track user registrations
CREATE TABLE public.hackathon_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.hackathon_events(id) ON DELETE CASCADE,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Create hackathon_teams table to track team relationships
CREATE TABLE public.hackathon_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.hackathon_events(id) ON DELETE CASCADE,
  member1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, member1_id, member2_id)
);

-- Enable RLS for hackathon_participants
ALTER TABLE public.hackathon_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for hackathon_participants
CREATE POLICY "Users can view all participants" 
  ON public.hackathon_participants 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own participation" 
  ON public.hackathon_participants 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" 
  ON public.hackathon_participants 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own participation" 
  ON public.hackathon_participants 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS for hackathon_teams
ALTER TABLE public.hackathon_teams ENABLE ROW LEVEL SECURITY;

-- Create policies for hackathon_teams
CREATE POLICY "Users can view all teams" 
  ON public.hackathon_teams 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create teams they're part of" 
  ON public.hackathon_teams 
  FOR INSERT 
  WITH CHECK (auth.uid() = member1_id OR auth.uid() = member2_id);

-- Create a function to automatically remove expired hackathon participants
CREATE OR REPLACE FUNCTION public.cleanup_expired_hackathon_participants()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.hackathon_participants
  WHERE event_id IN (
    SELECT id 
    FROM public.hackathon_events 
    WHERE date_end IS NOT NULL 
    AND date_end < CURRENT_DATE
  );
END;
$$;

-- Create a function to update joined_events in profiles based on current participations
CREATE OR REPLACE FUNCTION public.update_profile_joined_events()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Add event to profile's joined_events array
    UPDATE public.profiles 
    SET joined_events = array_append(
      COALESCE(joined_events, ARRAY[]::text[]), 
      NEW.event_id::text
    )
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Remove event from profile's joined_events array
    UPDATE public.profiles 
    SET joined_events = array_remove(
      COALESCE(joined_events, ARRAY[]::text[]), 
      OLD.event_id::text
    )
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger to automatically update profiles when participants are added/removed
DROP TRIGGER IF EXISTS update_profile_joined_events_trigger ON public.hackathon_participants;
CREATE TRIGGER update_profile_joined_events_trigger
  AFTER INSERT OR DELETE ON public.hackathon_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_joined_events();
