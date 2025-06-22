import { useState } from 'react';
import { Filter, X, Sparkles, Target, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import type { MatchingFilters } from '@/services/enhancedMatching';

interface MatchingFiltersProps {
  filters: MatchingFilters;
  onFiltersChange: (filters: Partial<MatchingFilters>) => void;
  availableHackathonGoals: string[];
  onGenerateProjectSuggestions?: () => Promise<string[]>;
  onExtractSkillsFromProject?: (projectDescription: string) => Promise<string[]>;
}

const MatchingFilters = ({
  filters,
  onFiltersChange,
  availableHackathonGoals,
  onGenerateProjectSuggestions,
  onExtractSkillsFromProject
}: MatchingFiltersProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [projectIdeas, setProjectIdeas] = useState(filters.projectIdeas || '');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(filters.hackathonGoals || []);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [extractingSkills, setExtractingSkills] = useState(false);

  const handleApplyFilters = () => {
    onFiltersChange({
      projectIdeas: projectIdeas.trim() || undefined,
      hackathonGoals: selectedGoals.length > 0 ? selectedGoals : undefined,
      maxTeamSize: filters.maxTeamSize,
      minAvailability: filters.minAvailability,
      minSkillMatch: filters.minSkillMatch,
      preferredSkills: filters.preferredSkills
    });
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setProjectIdeas('');
    setSelectedGoals([]);
    onFiltersChange({
      projectIdeas: undefined,
      hackathonGoals: undefined,
      maxTeamSize: undefined,
      minAvailability: undefined,
      minSkillMatch: undefined,
      preferredSkills: undefined
    });
  };

  const handleGenerateSuggestions = async () => {
    if (!onGenerateProjectSuggestions) return;

    setGeneratingSuggestions(true);
    try {
      const suggestions = await onGenerateProjectSuggestions();
      const suggestionsText = suggestions.join('\n\n');
      setProjectIdeas(suggestionsText);
      toast({
        title: "Project suggestions generated!",
        description: "AI has suggested some project ideas based on your profile.",
      });
    } catch (error) {
      toast({
        title: "Error generating suggestions",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const handleExtractSkills = async () => {
    if (!onExtractSkillsFromProject || !projectIdeas.trim()) return;

    setExtractingSkills(true);
    try {
      const skills = await onExtractSkillsFromProject(projectIdeas);
      if (skills.length > 0) {
        onFiltersChange({
          ...filters,
          preferredSkills: skills
        });
        toast({
          title: "Skills extracted!",
          description: `Found ${skills.length} relevant skills from your project description.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error extracting skills",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setExtractingSkills(false);
    }
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const activeFiltersCount = [
    filters.projectIdeas,
    filters.hackathonGoals?.length,
    filters.maxTeamSize,
    filters.minAvailability,
    filters.minSkillMatch,
    filters.preferredSkills?.length
  ].filter(Boolean).length;

  return (
    <div className="mb-6">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Advanced Matching Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project Ideas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Project Ideas
                </label>
                {onGenerateProjectSuggestions && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateSuggestions}
                    disabled={generatingSuggestions}
                  >
                    {generatingSuggestions ? 'Generating...' : 'AI Suggestions'}
                  </Button>
                )}
              </div>
              <Textarea
                placeholder="Describe your project ideas or what you'd like to build..."
                value={projectIdeas}
                onChange={(e) => setProjectIdeas(e.target.value)}
                rows={3}
              />
              {projectIdeas.trim() && onExtractSkillsFromProject && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExtractSkills}
                  disabled={extractingSkills}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {extractingSkills ? 'Extracting...' : 'Extract skills from project'}
                </Button>
              )}
            </div>

            {/* Hackathon Goals */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Hackathon Goals
              </label>
              <div className="flex flex-wrap gap-2">
                {availableHackathonGoals.map((goal) => (
                  <Badge
                    key={goal}
                    variant={selectedGoals.includes(goal) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleGoal(goal)}
                  >
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Team Size */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Max Team Size
              </label>
              <Select
                value={filters.maxTeamSize?.toString() || ''}
                onValueChange={(value) => onFiltersChange({ maxTeamSize: value ? parseInt(value) : undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any team size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any team size</SelectItem>
                  <SelectItem value="2">2 people</SelectItem>
                  <SelectItem value="3">3 people</SelectItem>
                  <SelectItem value="4">4 people</SelectItem>
                  <SelectItem value="5">5+ people</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Availability */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Min Availability (hours)
              </label>
              <Slider
                value={[filters.minAvailability || 0]}
                onValueChange={([value]) => onFiltersChange({ minAvailability: value })}
                max={48}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-gray-500">
                {filters.minAvailability || 0} hours minimum
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleApplyFilters} className="flex-1">
                Apply Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MatchingFilters; 