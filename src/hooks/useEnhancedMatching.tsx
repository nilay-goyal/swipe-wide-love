import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { 
  computeEnhancedMatchesForUser, 
  type User, 
  type EnhancedMatch, 
  type MatchingFilters,
  HACKATHON_GOALS,
  normalizeHackathonGoals
} from '@/services/enhancedMatching';
import { geminiService } from '@/services/geminiService';

export const useEnhancedMatching = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<EnhancedMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<MatchingFilters>({});
  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(null);

  // Fetch current user's profile
  const fetchCurrentUserProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching current user profile:', error);
        return;
      }

      setCurrentUserProfile(data as User);
    } catch (error) {
      console.error('Error in fetchCurrentUserProfile:', error);
    }
  }, [user]);

  // Fetch all other users' profiles
  const fetchOtherProfiles = useCallback(async () => {
    if (!user) return [];

    try {
      // Get profiles that the current user has already swiped on
      const { data: swipedProfiles, error: swipeError } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      if (swipeError) {
        console.error('Error fetching swiped profiles:', swipeError);
        throw swipeError;
      }

      const swipedIds = swipedProfiles?.map(swipe => swipe.swiped_id) || [];

      // Build the query to exclude current user and already swiped profiles
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id);

      // Only add the not-in filter if there are swiped profiles
      if (swipedIds.length > 0) {
        query = query.not('id', 'in', `(${swipedIds.join(',')})`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching other profiles:', error);
        throw error;
      }

      return (data || []) as User[];
    } catch (error) {
      console.error('Error in fetchOtherProfiles:', error);
      return [];
    }
  }, [user]);

  // Compute enhanced matches
  const computeMatches = useCallback(async () => {
    if (!currentUserProfile) return;

    setLoading(true);
    try {
      const otherProfiles = await fetchOtherProfiles();
      
      if (otherProfiles.length === 0) {
        setMatches([]);
        return;
      }

      const enhancedMatches = await computeEnhancedMatchesForUser(
        currentUserProfile,
        otherProfiles,
        filters
      );

      setMatches(enhancedMatches);
    } catch (error) {
      console.error('Error computing enhanced matches:', error);
      toast({
        title: "Error computing matches",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentUserProfile, filters, fetchOtherProfiles, toast]);

  // Update filters and recompute matches
  const updateFilters = useCallback((newFilters: Partial<MatchingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Generate project suggestions for current user
  const generateProjectSuggestions = useCallback(async () => {
    if (!currentUserProfile) return [];

    try {
      const suggestions = await geminiService.generateProjectSuggestions(
        currentUserProfile.skills || [],
        currentUserProfile.interests || [],
        currentUserProfile.hackathon_goals || []
      );
      return suggestions;
    } catch (error) {
      console.error('Error generating project suggestions:', error);
      return [];
    }
  }, [currentUserProfile]);

  // Extract skills from project description
  const extractSkillsFromProject = useCallback(async (projectDescription: string) => {
    try {
      const skills = await geminiService.extractSkillsFromProject(projectDescription);
      return skills;
    } catch (error) {
      console.error('Error extracting skills from project:', error);
      return [];
    }
  }, []);

  // Get available hackathon goals
  const getAvailableHackathonGoals = useCallback(() => {
    return HACKATHON_GOALS;
  }, []);

  // Validate and normalize hackathon goals
  const validateHackathonGoals = useCallback((goals: string[]) => {
    return normalizeHackathonGoals(goals);
  }, []);

  // Initialize
  useEffect(() => {
    fetchCurrentUserProfile();
  }, [fetchCurrentUserProfile]);

  // Recompute matches when filters or current user profile changes
  useEffect(() => {
    if (currentUserProfile) {
      computeMatches();
    }
  }, [currentUserProfile, filters, computeMatches]);

  return {
    matches,
    loading,
    filters,
    currentUserProfile,
    updateFilters,
    generateProjectSuggestions,
    extractSkillsFromProject,
    getAvailableHackathonGoals,
    validateHackathonGoals,
    refetchMatches: computeMatches
  };
}; 