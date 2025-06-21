
-- Create a table for hackathon events scraped from MLH
CREATE TABLE public.hackathon_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date_start DATE,
  date_end DATE,
  location TEXT,
  image_url TEXT,
  mlh_url TEXT,
  application_deadline DATE,
  difficulty_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for the hackathon events table
ALTER TABLE public.hackathon_events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to hackathon events
CREATE POLICY "Public read access for hackathon events" 
  ON public.hackathon_events 
  FOR SELECT 
  USING (true);

-- Create policy to allow public insert access (for the scraper function)
CREATE POLICY "Public insert access for hackathon events" 
  ON public.hackathon_events 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow public update access (for the scraper function)
CREATE POLICY "Public update access for hackathon events" 
  ON public.hackathon_events 
  FOR UPDATE 
  USING (true);

-- Create policy to allow public delete access (for cleanup)
CREATE POLICY "Public delete access for hackathon events" 
  ON public.hackathon_events 
  FOR DELETE 
  USING (true);
