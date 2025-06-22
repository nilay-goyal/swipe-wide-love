
-- Create a table to store user Gemini prompts for hackathons
CREATE TABLE public.user_gemini_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  hackathon_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one prompt per user per hackathon
  UNIQUE(user_id, hackathon_id)
);

-- Add Row Level Security
ALTER TABLE public.user_gemini_prompts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own prompts" 
  ON public.user_gemini_prompts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prompts" 
  ON public.user_gemini_prompts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts" 
  ON public.user_gemini_prompts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts" 
  ON public.user_gemini_prompts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add foreign key references
ALTER TABLE public.user_gemini_prompts 
ADD CONSTRAINT fk_user_gemini_prompts_hackathon 
FOREIGN KEY (hackathon_id) REFERENCES public.hackathon_events(id) ON DELETE CASCADE;

-- Add trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_gemini_prompts 
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
