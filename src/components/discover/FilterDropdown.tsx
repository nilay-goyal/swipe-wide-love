
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FilterDropdownProps {
  onFilterApply: (hackathonId: string | null, geminiPrompt: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface HackathonEvent {
  id: string;
  title: string;
}

interface ExistingPrompt {
  id: string;
  prompt: string;
  hackathon_id: string;
}

const FilterDropdown = ({ onFilterApply, isOpen, onToggle }: FilterDropdownProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [joinedHackathons, setJoinedHackathons] = useState<HackathonEvent[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<string>('');
  const [geminiPrompt, setGeminiPrompt] = useState<string>('');
  const [existingPrompt, setExistingPrompt] = useState<ExistingPrompt | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch hackathons the user has joined
  const fetchJoinedHackathons = async () => {
    if (!user) return;

    try {
      const { data: participantData, error: participantError } = await supabase
        .from('hackathon_participants')
        .select('event_id')
        .eq('user_id', user.id);

      if (participantError) throw participantError;

      if (participantData && participantData.length > 0) {
        const eventIds = participantData.map(p => p.event_id);
        
        const { data: eventsData, error: eventsError } = await supabase
          .from('hackathon_events')
          .select('id, title')
          .in('id', eventIds);

        if (eventsError) throw eventsError;
        setJoinedHackathons(eventsData || []);
      }
    } catch (error) {
      console.error('Error fetching joined hackathons:', error);
    }
  };

  // Check for existing prompt when hackathon is selected
  const checkExistingPrompt = async (hackathonId: string) => {
    if (!user || !hackathonId) return;

    try {
      const { data, error } = await supabase
        .from('user_gemini_prompts')
        .select('id, prompt, hackathon_id')
        .eq('user_id', user.id)
        .eq('hackathon_id', hackathonId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setExistingPrompt(data);
        setGeminiPrompt(data.prompt);
      } else {
        setExistingPrompt(null);
        setGeminiPrompt('');
      }
    } catch (error) {
      console.error('Error checking existing prompt:', error);
    }
  };

  // Save or update prompt
  const savePrompt = async () => {
    if (!user || !selectedHackathon || !geminiPrompt.trim()) return;

    setLoading(true);
    try {
      if (existingPrompt) {
        // Update existing prompt
        const { error } = await supabase
          .from('user_gemini_prompts')
          .update({ prompt: geminiPrompt.trim() })
          .eq('id', existingPrompt.id);

        if (error) throw error;
      } else {
        // Create new prompt
        const { error } = await supabase
          .from('user_gemini_prompts')
          .insert({
            user_id: user.id,
            hackathon_id: selectedHackathon,
            prompt: geminiPrompt.trim()
          });

        if (error) throw error;
      }

      toast({
        title: "Prompt saved!",
        description: "Your Gemini prompt has been saved successfully.",
      });

      // Apply the filter
      onFilterApply(selectedHackathon, geminiPrompt.trim());
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: "Error",
        description: "Failed to save your prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply filter without saving prompt (for hackathon-only filtering)
  const applyHackathonFilter = () => {
    onFilterApply(selectedHackathon || null, '');
  };

  useEffect(() => {
    if (user) {
      fetchJoinedHackathons();
    }
  }, [user]);

  useEffect(() => {
    if (selectedHackathon) {
      checkExistingPrompt(selectedHackathon);
    }
  }, [selectedHackathon]);

  if (!isOpen) return null;

  return (
    <div className="relative">
      <Card className="absolute top-2 left-0 right-0 z-50 bg-app-slate border border-app-white/20">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-app-amber">Filter Options</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-app-white hover:bg-app-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Hackathon Filter */}
            <div>
              <Label htmlFor="hackathon-select" className="text-app-white">
                Filter by Hackathon
              </Label>
              <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
                <SelectTrigger className="w-full bg-app-black border-app-white/20 text-app-white">
                  <SelectValue placeholder="Select a hackathon" />
                </SelectTrigger>
                <SelectContent className="bg-app-slate border-app-white/20">
                  <SelectItem value="" className="text-app-white">All Hackathons</SelectItem>
                  {joinedHackathons.map((hackathon) => (
                    <SelectItem 
                      key={hackathon.id} 
                      value={hackathon.id}
                      className="text-app-white"
                    >
                      {hackathon.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gemini Prompt Input */}
            {selectedHackathon && (
              <div>
                <Label htmlFor="gemini-prompt" className="text-app-white">
                  Gemini Prompt
                </Label>
                {existingPrompt ? (
                  <div className="space-y-2">
                    <Input
                      id="gemini-prompt"
                      value={geminiPrompt}
                      onChange={(e) => setGeminiPrompt(e.target.value)}
                      placeholder="Describe what you want to build and what teammates you're looking for..."
                      className="bg-app-black border-app-white/20 text-app-white"
                      disabled={loading}
                    />
                    <p className="text-sm text-app-neutral">
                      You can edit your existing prompt for this hackathon.
                    </p>
                  </div>
                ) : (
                  <Input
                    id="gemini-prompt"
                    value={geminiPrompt}
                    onChange={(e) => setGeminiPrompt(e.target.value)}
                    placeholder="e.g., I want to build an AI-powered fitness tracker, looking for teammates with design and data science experience..."
                    className="bg-app-black border-app-white/20 text-app-white"
                    disabled={loading}
                  />
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {selectedHackathon && geminiPrompt.trim() && (
                <Button
                  onClick={savePrompt}
                  disabled={loading}
                  className="bg-app-amber text-app-black hover:bg-app-amber/90"
                >
                  {loading ? 'Saving...' : existingPrompt ? 'Update & Apply AI Matching' : 'Save & Apply AI Matching'}
                </Button>
              )}
              {selectedHackathon && (
                <Button
                  onClick={applyHackathonFilter}
                  variant="outline"
                  className="border-app-white/20 text-app-white hover:bg-app-white/10"
                >
                  Filter by Hackathon Only
                </Button>
              )}
              {!selectedHackathon && (
                <Button
                  onClick={() => onFilterApply(null, '')}
                  variant="outline"
                  className="border-app-white/20 text-app-white hover:bg-app-white/10"
                >
                  Show All Users
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FilterDropdown;
