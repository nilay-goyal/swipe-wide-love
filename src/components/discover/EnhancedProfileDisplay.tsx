import { useState } from 'react';
import { MapPin, Github, Linkedin, ExternalLink, Sparkles, Target, Users, Clock, BarChart3, Brain } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { EnhancedMatch } from '@/services/enhancedMatching';

interface EnhancedProfileDisplayProps {
  enhancedMatch: EnhancedMatch;
  onSwipe: (direction: 'up' | 'down') => void;
}

const EnhancedProfileDisplay = ({ enhancedMatch, onSwipe }: EnhancedProfileDisplayProps) => {
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);
  const { match, score, breakdown, analysis } = enhancedMatch;

  const formatScore = (score: number) => Math.round(score * 100);
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100';
    if (score >= 0.6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden max-w-sm w-full mx-auto">
      {/* Profile Image */}
      <div className="relative h-96 bg-gradient-to-br from-pink-100 to-purple-100">
        <img
          src={match.photos?.[0] || '/placeholder.svg'}
          alt={match.name || 'Profile'}
          className="w-full h-full object-cover"
        />
        
        {/* Match Score Badge */}
        <div className="absolute top-4 right-4">
          <Badge className={`${getScoreBgColor(score)} ${getScoreColor(score)} border-0`}>
            {formatScore(score)}% Match
          </Badge>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">{match.name}</h2>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{match.location || 'Location not specified'}</span>
          </div>
          
          {/* Basic Info */}
          <div className="flex flex-wrap gap-2 mb-3">
            {match.school && (
              <Badge variant="secondary" className="text-xs">
                {match.school}
              </Badge>
            )}
            {match.major && (
              <Badge variant="secondary" className="text-xs">
                {match.major}
              </Badge>
            )}
            {match.year && (
              <Badge variant="secondary" className="text-xs">
                {match.year}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6 space-y-4">
        {/* Bio */}
        {match.bio && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">About</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{match.bio}</p>
          </div>
        )}

        {/* Skills */}
        {match.skills && match.skills.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {match.skills.slice(0, 6).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {match.skills.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{match.skills.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Project Ideas */}
        {match.project_ideas && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Project Ideas
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{match.project_ideas}</p>
          </div>
        )}

        {/* Hackathon Goals */}
        {match.hackathon_goals && match.hackathon_goals.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Hackathon Goals
            </h3>
            <div className="flex flex-wrap gap-2">
              {match.hackathon_goals.map((goal, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {goal}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Team Preferences */}
        <div className="flex gap-4 text-sm">
          {match.preferred_team_size && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Team: {match.preferred_team_size} people</span>
            </div>
          )}
          {match.availability_hours && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{match.availability_hours}h available</span>
            </div>
          )}
        </div>

        {/* AI Analysis */}
        <Collapsible open={isAnalysisExpanded} onOpenChange={setIsAnalysisExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Match Analysis
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            {/* Compatibility Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Compatibility Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Skill Similarity</span>
                    <span className={getScoreColor(breakdown.skillSimilarity)}>
                      {formatScore(breakdown.skillSimilarity)}%
                    </span>
                  </div>
                  <Progress value={breakdown.skillSimilarity * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Field Similarity</span>
                    <span className={getScoreColor(breakdown.fieldSimilarity)}>
                      {formatScore(breakdown.fieldSimilarity)}%
                    </span>
                  </div>
                  <Progress value={breakdown.fieldSimilarity * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Project Compatibility</span>
                    <span className={getScoreColor(breakdown.projectCompatibility)}>
                      {formatScore(breakdown.projectCompatibility)}%
                    </span>
                  </div>
                  <Progress value={breakdown.projectCompatibility * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Goal Compatibility</span>
                    <span className={getScoreColor(breakdown.goalCompatibility)}>
                      {formatScore(breakdown.goalCompatibility)}%
                    </span>
                  </div>
                  <Progress value={breakdown.goalCompatibility * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Team Vibe Match</span>
                    <span className={getScoreColor(breakdown.teamVibeMatch)}>
                      {formatScore(breakdown.teamVibeMatch)}%
                    </span>
                  </div>
                  <Progress value={breakdown.teamVibeMatch * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            {analysis?.projectAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{analysis.projectAnalysis.reasoning}</p>
                  
                  {analysis.projectAnalysis.suggestedRoles.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Suggested Roles:</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.projectAnalysis.suggestedRoles.map((role, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {analysis.projectAnalysis.potentialChallenges.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Potential Challenges:</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.projectAnalysis.potentialChallenges.map((challenge, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {challenge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {analysis?.goalAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Goal Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{analysis.goalAnalysis.reasoning}</p>
                </CardContent>
              </Card>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Social Links */}
        <div className="flex justify-center gap-4 pt-4 border-t">
          {match.github_url && (
            <a
              href={match.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Github className="w-5 h-5 text-gray-600" />
            </a>
          )}
          {match.linkedin_url && (
            <a
              href={match.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Linkedin className="w-5 h-5 text-gray-600" />
            </a>
          )}
          {match.devpost_url && (
            <a
              href={match.devpost_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-gray-600" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedProfileDisplay; 