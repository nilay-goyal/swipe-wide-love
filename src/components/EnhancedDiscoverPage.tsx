import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEnhancedMatching } from '@/hooks/useEnhancedMatching';
import { useMatching } from '@/hooks/useMatching';
import { useToast } from '@/hooks/use-toast';
import EnhancedProfileDisplay from './discover/EnhancedProfileDisplay';
import MatchingFilters from './discover/MatchingFilters';
import SwipeButtons from './discover/SwipeButtons';
import { Loader2, Sparkles, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EnhancedDiscoverPage = () => {
  const { user } = useAuth();
  const { recordSwipe } = useMatching();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchDetails, setShowMatchDetails] = useState(false);

  const {
    matches: enhancedMatches,
    loading,
    filters,
    currentUserProfile,
    updateFilters,
    generateProjectSuggestions,
    extractSkillsFromProject,
    getAvailableHackathonGoals,
    refetchMatches
  } = useEnhancedMatching();

  const handleSwipe = async (direction: 'up' | 'down') => {
    if (currentIndex >= enhancedMatches.length) return;

    const currentMatch = enhancedMatches[currentIndex];
    const isLike = direction === 'up';

    try {
      await recordSwipe(currentMatch.match.id, isLike);
      
      if (isLike) {
        toast({
          title: "Profile liked! 💖",
          description: `You liked ${currentMatch.match.name}`,
        });
      }

      // Move to next profile
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error recording swipe:', error);
      toast({
        title: "Error",
        description: "Failed to record your swipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    setCurrentIndex(0);
    refetchMatches();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-app-amber" />
        <h3 className="text-xl font-semibold text-gray-800">Finding your perfect matches...</h3>
        <p className="text-gray-600 text-center max-w-md">
          Our AI is analyzing profiles and computing compatibility scores.
        </p>
      </div>
    );
  }

  if (enhancedMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-6xl">🎉</div>
        <h3 className="text-xl font-semibold text-app-amber">You've seen everyone!</h3>
        <p className="text-app-neutral text-center max-w-md">
          Check back later for new profiles, or update your preferences to see more people.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={handleRefresh}
            className="px-4 py-2 bg-app-amber text-app-black rounded-lg hover:bg-app-amber/90 transition-colors"
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => updateFilters({})}
            className="px-4 py-2 border-app-amber text-app-amber rounded-lg hover:bg-app-amber/10 transition-colors"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    );
  }

  if (currentIndex >= enhancedMatches.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-6xl">✨</div>
        <h3 className="text-xl font-semibold text-gray-800">All caught up!</h3>
        <p className="text-gray-600 text-center max-w-md">
          You've swiped through all available profiles. Check back later for new matches!
        </p>
        <Button
          onClick={handleRefresh}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          Start Over
        </Button>
      </div>
    );
  }

  const currentMatch = enhancedMatches[currentIndex];

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      {/* Header with AI Features */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">AI-Powered Matching</h1>
        <p className="text-gray-600 text-sm">
          Find teammates based on project ideas, hackathon goals, and skill compatibility
        </p>
      </div>

      {/* Enhanced Filters */}
      <MatchingFilters
        filters={filters}
        onFiltersChange={updateFilters}
        availableHackathonGoals={[...getAvailableHackathonGoals()]}
        onGenerateProjectSuggestions={generateProjectSuggestions}
        onExtractSkillsFromProject={extractSkillsFromProject}
      />

      {/* Match Stats */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-app-amber" />
            Match Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Profiles remaining:</span>
            <span className="font-semibold">{enhancedMatches.length - currentIndex}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current match score:</span>
            <span className="font-semibold text-app-amber">
              {Math.round(currentMatch.score * 100)}%
            </span>
          </div>
          {currentMatch.match.project_ideas && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Has project ideas:</span>
              <span className="font-semibold text-green-600">✓</span>
            </div>
          )}
          {currentMatch.match.hackathon_goals && currentMatch.match.hackathon_goals.length > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Goals defined:</span>
              <span className="font-semibold text-green-600">
                {currentMatch.match.hackathon_goals.length}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Profile Display */}
      <div className="mb-6">
        <EnhancedProfileDisplay
          enhancedMatch={currentMatch}
          onSwipe={handleSwipe}
        />
      </div>

      {/* Swipe Buttons */}
      <div className="flex justify-center gap-4">
        <SwipeButtons 
          onPass={() => handleSwipe('down')}
          onLike={() => handleSwipe('up')}
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex gap-3">
        <Button
          variant="outline"
          onClick={() => setShowMatchDetails(!showMatchDetails)}
          className="flex-1 flex items-center gap-2"
        >
          <Target className="w-4 h-4" />
          {showMatchDetails ? 'Hide' : 'Show'} Details
        </Button>
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="flex-1 flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Match Details Modal */}
      {showMatchDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Match Analysis</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMatchDetails(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Compatibility Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Skill Similarity:</span>
                    <span className="text-sm font-medium">
                      {Math.round(currentMatch.breakdown.skillSimilarity * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Field Similarity:</span>
                    <span className="text-sm font-medium">
                      {Math.round(currentMatch.breakdown.fieldSimilarity * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Project Compatibility:</span>
                    <span className="text-sm font-medium">
                      {Math.round(currentMatch.breakdown.projectCompatibility * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Goal Compatibility:</span>
                    <span className="text-sm font-medium">
                      {Math.round(currentMatch.breakdown.goalCompatibility * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Team Vibe Match:</span>
                    <span className="text-sm font-medium">
                      {Math.round(currentMatch.breakdown.teamVibeMatch * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {currentMatch.analysis?.projectAnalysis && (
                <div>
                  <h4 className="font-medium mb-2">AI Project Analysis</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {currentMatch.analysis.projectAnalysis.reasoning}
                  </p>
                  {currentMatch.analysis.projectAnalysis.suggestedRoles.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Suggested Roles: </span>
                      <span className="text-sm text-gray-600">
                        {currentMatch.analysis.projectAnalysis.suggestedRoles.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {currentMatch.analysis?.goalAnalysis && (
                <div>
                  <h4 className="font-medium mb-2">AI Goal Analysis</h4>
                  <p className="text-sm text-gray-600">
                    {currentMatch.analysis.goalAnalysis.reasoning}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDiscoverPage; 