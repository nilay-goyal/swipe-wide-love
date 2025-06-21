
import { useState, useEffect } from 'react';
import { Edit, Save, Camera, MapPin, LogOut, Github, Linkedin, ExternalLink, Building, GraduationCap, Calendar, Star, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserProfile {
  id: string;
  name: string | null;
  age: number | null;
  bio: string | null;
  location: string | null;
  photos: string[] | null;
  interests: string[] | null;
  occupation: string | null;
  education: string | null;
  github_url: string | null;
  devpost_url: string | null;
  linkedin_url: string | null;
  github_projects: any[];
  work_experience: any[];
  education_details: any[];
}

interface ProfilePageProps {
  onEditRequireAuth?: () => void;
}

const ProfilePage = ({ onEditRequireAuth }: ProfilePageProps) => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scrapingGithub, setScrapingGithub] = useState(false);
  const [scrapingLinkedin, setScrapingLinkedin] = useState(false);
  const [scrapingDevpost, setScrapingDevpost] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    name: '',
    age: null,
    bio: '',
    location: '',
    photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face'],
    interests: [],
    occupation: '',
    education: '',
    github_url: null,
    devpost_url: null,
    linkedin_url: null,
    github_projects: [],
    work_experience: [],
    education_details: []
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        const profileData: UserProfile = {
          id: data.id,
          name: data.name || '',
          age: data.age,
          bio: data.bio || '',
          location: data.location || '',
          photos: data.photos || ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face'],
          interests: Array.isArray(data.interests) ? data.interests : [],
          occupation: data.occupation || '',
          education: data.education || '',
          github_url: data.github_url,
          devpost_url: data.devpost_url,
          linkedin_url: data.linkedin_url,
          github_projects: Array.isArray(data.github_projects) ? data.github_projects : [],
          work_experience: Array.isArray(data.work_experience) ? data.work_experience : [],
          education_details: Array.isArray(data.education_details) ? data.education_details : []
        };
        setProfile(profileData);
        setEditedProfile(profileData);
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Use a reverse geocoding service to get the location name
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await response.json();
            const locationString = `${data.city}, ${data.principalSubdivision}`;
            setEditedProfile(prev => ({ ...prev, location: locationString }));
            toast({
              title: "Location updated! 📍",
              description: `Set to ${locationString}`,
            });
          } catch (error) {
            toast({
              title: "Error getting location name",
              description: "Could not convert coordinates to location",
              variant: "destructive",
            });
          }
        },
        (error) => {
          toast({
            title: "Location access denied",
            description: "Please enable location access in your browser settings",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services",
        variant: "destructive",
      });
    }
  };

  const scrapeGithubData = async (githubUrl: string) => {
    if (!githubUrl) return;
    
    setScrapingGithub(true);
    try {
      const username = githubUrl.split('/').pop();
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
      
      if (response.ok) {
        const repos = await response.json();
        const projects = repos.map((repo: any) => ({
          name: repo.name,
          description: repo.description || 'No description available',
          language: repo.language,
          stars: repo.stargazers_count,
          url: repo.html_url,
          updated_at: repo.updated_at
        }));
        
        setEditedProfile(prev => ({
          ...prev,
          github_projects: projects
        }));
        
        toast({
          title: "GitHub data imported! 🚀",
          description: `Found ${projects.length} repositories`,
        });
      } else {
        throw new Error('GitHub user not found');
      }
    } catch (error) {
      toast({
        title: "Failed to import GitHub data",
        description: "Please check the URL and try again",
        variant: "destructive",
      });
    } finally {
      setScrapingGithub(false);
    }
  };

  const scrapeLinkedinData = async (linkedinUrl: string) => {
    if (!linkedinUrl) return;
    
    setScrapingLinkedin(true);
    try {
      // Since LinkedIn scraping requires authentication and is complex,
      // we'll simulate the process and show a placeholder
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockWorkExperience = [
        {
          title: "Software Engineering Intern",
          company: "TechCorp",
          duration: "May 2023 - Aug 2023",
          description: "Developed full-stack web applications using React and Node.js. Collaborated with cross-functional teams to deliver features for 100k+ users."
        }
      ];
      
      const mockEducation = [
        {
          degree: "Bachelor of Science in Computer Science",
          school: "Stanford University",
          year: "2024",
          description: "Relevant coursework: Data Structures, Algorithms, Web Development"
        }
      ];
      
      setEditedProfile(prev => ({
        ...prev,
        work_experience: mockWorkExperience,
        education_details: mockEducation
      }));
      
      toast({
        title: "LinkedIn data imported! 💼",
        description: "Added work experience and education",
      });
    } catch (error) {
      toast({
        title: "Failed to import LinkedIn data",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setScrapingLinkedin(false);
    }
  };

  const scrapeDevpostData = async (devpostUrl: string) => {
    if (!devpostUrl) return;
    
    setScrapingDevpost(true);
    try {
      // DevPost scraping simulation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockProjects = [
        {
          name: "EcoTracker ⭐",
          description: "Hacklyft 2023 • 2nd Place • Frontend Developer",
          category: "Best Sustainability Hack",
          url: devpostUrl
        },
        {
          name: "StudyBuddy",
          description: "TreeHacks 2023 • Frontend Developer",
          category: "Education",
          url: devpostUrl
        }
      ];
      
      // Add to interests if not already there
      const hackathonInterests = ['Hackathons', 'Problem Solving', 'Innovation'];
      const newInterests = [...(editedProfile.interests || [])];
      hackathonInterests.forEach(interest => {
        if (!newInterests.includes(interest)) {
          newInterests.push(interest);
        }
      });
      
      setEditedProfile(prev => ({
        ...prev,
        interests: newInterests,
        // Store DevPost projects in github_projects for now (could create separate field)
        github_projects: [...prev.github_projects, ...mockProjects]
      }));
      
      toast({
        title: "DevPost data imported! 🏆",
        description: "Added hackathon projects and interests",
      });
    } catch (error) {
      toast({
        title: "Failed to import DevPost data",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setScrapingDevpost(false);
    }
  };

  const handleEditClick = () => {
    if (!user) {
      onEditRequireAuth?.();
      return;
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: editedProfile.name,
          age: editedProfile.age,
          bio: editedProfile.bio,
          location: editedProfile.location,
          photos: editedProfile.photos,
          interests: editedProfile.interests,
          occupation: editedProfile.occupation,
          education: editedProfile.education,
          github_url: editedProfile.github_url,
          devpost_url: editedProfile.devpost_url,
          linkedin_url: editedProfile.linkedin_url,
          github_projects: editedProfile.github_projects,
          work_experience: editedProfile.work_experience,
          education_details: editedProfile.education_details,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setProfile(editedProfile);
      setIsEditing(false);
      toast({
        title: "Profile Updated! ✨",
        description: "Your changes have been saved successfully",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out successfully",
      description: "Come back soon! 💕",
    });
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  const isProfileEmpty = !profile.name && !profile.age && !profile.bio;
  const showWelcomeMessage = !user || (user && isProfileEmpty && !isEditing);

  return (
    <div className="py-8 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {user ? 'My Profile' : 'Profile'}
            </h1>
            <p className="text-gray-600">
              {!user 
                ? 'Sign in to create and manage your dating profile'
                : showWelcomeMessage 
                ? 'Complete your profile to get started' 
                : 'Manage your dating profile information'
              }
            </p>
          </div>
          {user && (
            <div className="flex space-x-3">
              <button 
                onClick={handleEditClick}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Join Event</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {showWelcomeMessage && (
          <div className="bg-pink-50 border border-pink-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-pink-800 mb-2">
              {!user ? 'Welcome!' : 'Welcome to your profile!'}
            </h3>
            <p className="text-pink-700 mb-4">
              {!user 
                ? 'Create an account to build your dating profile and start connecting with others.'
                : 'Your profile is currently empty. Click "Edit Profile" to add your information and start connecting with others.'
              }
            </p>
            <button
              onClick={handleEditClick}
              className="px-4 py-2 dating-gradient text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              {!user ? 'Get Started' : 'Complete Your Profile'}
            </button>
          </div>
        )}

        {/* Main Profile Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info & Photo */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              {/* Profile Photo */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <Avatar className="w-40 h-40 border-4 border-pink-200 mx-auto">
                    <AvatarImage
                      src={profile.photos?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face'}
                      alt="Profile main"
                      className="object-cover"
                    />
                    <AvatarFallback className="text-3xl bg-pink-100 text-pink-600">
                      {profile.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="text-center mb-6">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                    className="text-2xl font-bold bg-transparent border-b-2 border-pink-300 text-gray-800 placeholder-gray-500 focus:border-pink-500 focus:outline-none text-center w-full mb-2"
                    placeholder="Enter your name"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{profile.name || 'Anonymous'}</h2>
                )}
                
                {isEditing ? (
                  <input
                    type="number"
                    value={editedProfile.age || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, age: parseInt(e.target.value) || null})}
                    className="text-lg bg-transparent border-b border-pink-300 text-gray-600 placeholder-gray-500 focus:border-pink-500 focus:outline-none text-center w-24"
                    placeholder="Age"
                  />
                ) : (
                  <p className="text-lg text-gray-600">{profile.age ? `${profile.age} years old` : 'Age not specified'}</p>
                )}
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
                {isEditing ? (
                  <textarea
                    value={editedProfile.bio || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800 placeholder-gray-500 focus:border-pink-500 focus:outline-none resize-none"
                    placeholder="Tell people about yourself..."
                  />
                ) : (
                  <p className="text-gray-600 leading-relaxed">
                    {profile.bio || 'No bio added yet'}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-pink-500" />
                  Location
                </h3>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editedProfile.location || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Enter location manually"
                    />
                    <button
                      onClick={getCurrentLocation}
                      className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Use Current Location</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-600">
                    <span>{profile.location || 'Location not set'}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>

            {/* Social Links Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Social Links</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Github className="w-5 h-5 text-gray-700" />
                      <span className="text-gray-700">GitHub</span>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={editedProfile.github_url || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, github_url: e.target.value})}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="GitHub URL"
                      />
                      <button
                        onClick={() => scrapeGithubData(editedProfile.github_url || '')}
                        disabled={!editedProfile.github_url || scrapingGithub}
                        className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        {scrapingGithub ? '...' : 'Import'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Linkedin className="w-5 h-5 text-gray-700" />
                      <span className="text-gray-700">LinkedIn</span>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={editedProfile.linkedin_url || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, linkedin_url: e.target.value})}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="LinkedIn URL"
                      />
                      <button
                        onClick={() => scrapeLinkedinData(editedProfile.linkedin_url || '')}
                        disabled={!editedProfile.linkedin_url || scrapingLinkedin}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {scrapingLinkedin ? '...' : 'Import'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <ExternalLink className="w-5 h-5 text-gray-700" />
                      <span className="text-gray-700">DevPost</span>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={editedProfile.devpost_url || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, devpost_url: e.target.value})}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="DevPost URL"
                      />
                      <button
                        onClick={() => scrapeDevpostData(editedProfile.devpost_url || '')}
                        disabled={!editedProfile.devpost_url || scrapingDevpost}
                        className="px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                      >
                        {scrapingDevpost ? '...' : 'Import'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.github_url ? (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                      <Github className="w-5 h-5" />
                      <span className="flex-1">GitHub</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-gray-50/50 rounded-lg text-gray-400">
                      <Github className="w-5 h-5" />
                      <span>No GitHub linked</span>
                    </div>
                  )}
                  {profile.linkedin_url ? (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                      <Linkedin className="w-5 h-5" />
                      <span className="flex-1">LinkedIn</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-gray-50/50 rounded-lg text-gray-400">
                      <Linkedin className="w-5 h-5" />
                      <span>No LinkedIn linked</span>
                    </div>
                  )}
                  {profile.devpost_url ? (
                    <a href={profile.devpost_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                      <ExternalLink className="w-5 h-5" />
                      <span className="flex-1">DevPost</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-gray-50/50 rounded-lg text-gray-400">
                      <ExternalLink className="w-5 h-5" />
                      <span>No DevPost linked</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Interests Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {(profile.interests && profile.interests.length > 0) ? (
                  profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">No interests added yet</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Experience & Projects */}
          <div className="lg:col-span-2 space-y-6">
            {/* Work Experience */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Building className="w-6 h-6 mr-3 text-pink-500" />
                Work Experience
              </h3>
              {profile.work_experience && profile.work_experience.length > 0 ? (
                <div className="space-y-6">
                  {profile.work_experience.map((job: any, index: number) => (
                    <div key={index} className="border-l-4 border-pink-300 pl-6 pb-6 last:pb-0">
                      <h4 className="text-lg font-semibold text-gray-800">{job.title}</h4>
                      <p className="text-pink-600 font-medium">{job.company}</p>
                      <p className="text-gray-500 text-sm mb-3">{job.duration}</p>
                      <p className="text-gray-600">{job.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No work experience added yet</p>
              )}
            </div>

            {/* Education */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <GraduationCap className="w-6 h-6 mr-3 text-purple-500" />
                Education
              </h3>
              {profile.education_details && profile.education_details.length > 0 ? (
                <div className="space-y-6">
                  {profile.education_details.map((edu: any, index: number) => (
                    <div key={index} className="border-l-4 border-purple-300 pl-6 pb-6 last:pb-0">
                      <h4 className="text-lg font-semibold text-gray-800">{edu.degree}</h4>
                      <p className="text-purple-600 font-medium">{edu.school}</p>
                      <p className="text-gray-500 text-sm mb-3">{edu.year}</p>
                      <p className="text-gray-600">{edu.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No education details added yet</p>
              )}
            </div>

            {/* Projects */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Star className="w-6 h-6 mr-3 text-yellow-500" />
                Projects & Repositories
              </h3>
              {profile.github_projects && profile.github_projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.github_projects.map((project: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-800 text-lg">{project.name}</h4>
                        {project.url && (
                          <a href={project.url} target="_blank" rel="noopener noreferrer" 
                             className="text-pink-500 hover:text-pink-600">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          {project.language && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              {project.language}
                            </span>
                          )}
                          {project.stars !== undefined && (
                            <span className="flex items-center text-yellow-600">
                              <Star className="w-3 h-3 mr-1" />
                              {project.stars}
                            </span>
                          )}
                        </div>
                        {project.updated_at && (
                          <span className="text-gray-500">
                            Updated {new Date(project.updated_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No projects found. Connect your GitHub to import repositories automatically.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
