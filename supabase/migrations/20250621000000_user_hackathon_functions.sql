
-- Create helper functions for user hackathon management

-- Function to get user hackathons
CREATE OR REPLACE FUNCTION get_user_hackathons(user_uuid UUID)
RETURNS TABLE(hackathon_event_id UUID)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT uh.hackathon_event_id
  FROM user_hackathons uh
  WHERE uh.user_id = user_uuid;
$$;

-- Function to join a hackathon
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

-- Function to leave a hackathon
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
