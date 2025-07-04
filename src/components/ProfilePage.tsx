import { useState, useEffect, useRef } from 'react';
import { Edit, Save, Camera, MapPin, LogOut, Github, Linkedin, ExternalLink, Building, GraduationCap, Star, Users, Plus, Trash2, Download, Code, Trophy, ChevronDown, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { scrapeSocialProfiles, ScrapedData } from '@/services/socialScraper';

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
  // New hackathon fields
  linkedin: string | null;
  github: string | null;
  devpost: string | null;
  major: string | null;
  school: string | null;
  year: string | null;
  uiux: number | null;
  pitching: number | null;
  management: number | null;
  hardware: number | null;
  cyber: number | null;
  frontend: number | null;
  backend: number | null;
  skills: string[] | null;
}

interface ProfilePageProps {
  onEditRequireAuth?: () => void;
}

const ProfilePage = ({ onEditRequireAuth }: ProfilePageProps) => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    education_details: [],
    // New hackathon fields
    linkedin: null,
    github: null,
    devpost: null,
    major: null,
    school: null,
    year: null,
    uiux: null,
    pitching: null,
    management: null,
    hardware: null,
    cyber: null,
    frontend: null,
    backend: null,
    skills: null
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  // Predefined options
  const majorOptions = [
    "Computer Science",
    "Computer Engineering", 
    "Software Engineering",
    "Electrical Engineering",
    "Other"
  ];

  const yearOptions = [
    "1st year",
    "2nd year", 
    "3rd year",
    "4th year",
    "Graduate",
    "Other"
  ];

  const skillOptions = [
    "AI/ML", "C++", "C", "HTML/CSS", "React", "Cloud/DevOps", "SQL", "Rust", 
    "Python", "Databases", "Node.js", "Mobile Development", "MATLAB", "Java"
  ];

  const skillCategories = [
    { key: 'uiux', label: 'UI/UX Design' },
    { key: 'frontend', label: 'Frontend Development' },
    { key: 'backend', label: 'Backend Development' },
    { key: 'hardware', label: 'Hardware Engineering' },
    { key: 'cyber', label: 'Cybersecurity' },
    { key: 'pitching', label: 'Pitching & Presentation' },
    { key: 'management', label: 'Project Management' }
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Fetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          console.log('No profile found, creating basic profile');
          await createBasicProfile();
          return;
        } else {
          throw error;
        }
      }

      if (data) {
        console.log('Profile data found:', data);
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
          education_details: Array.isArray(data.education_details) ? data.education_details : [],
          // New hackathon fields
          linkedin: data.linkedin,
          github: data.github,
          devpost: data.devpost,
          major: data.major,
          school: data.school,
          year: data.year,
          uiux: data.uiux,
          pitching: data.pitching,
          management: data.management,
          hardware: data.hardware,
          cyber: data.cyber,
          frontend: data.frontend,
          backend: data.backend,
          skills: Array.isArray(data.skills) ? data.skills : []
        };
        setProfile(profileData);
        setEditedProfile(profileData);
      }
    } catch (error: any) {
      console.error('Error in fetchProfile:', error);
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBasicProfile = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: user.user_metadata?.name || '',
        });

      if (error) throw error;
      
      await fetchProfile();
    } catch (error: any) {
      console.error('Error creating basic profile:', error);
      toast({
        title: "Error creating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const validateRequiredFields = () => {
    const errors: string[] = [];
    
    if (!editedProfile.name || editedProfile.name.trim() === '') {
      errors.push('Name is required');
    }
    
    if (!editedProfile.age || editedProfile.age <= 0) {
      errors.push('Age is required and must be greater than 0');
    }
    
    if (!editedProfile.bio || editedProfile.bio.trim() === '') {
      errors.push('Bio is required');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleImportData = async () => {
    if (!user) return;

    const hasAnyUrl = editedProfile.github_url || editedProfile.linkedin_url || editedProfile.devpost_url;
    
    if (!hasAnyUrl) {
      toast({
        title: "No social links found",
        description: "Please add at least one social profile URL before importing",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    
    try {
      toast({
        title: "Importing data from social profiles...",
        description: "This may take a few seconds",
      });

      console.log('Starting import with URLs:', {
        github_url: editedProfile.github_url,
        linkedin_url: editedProfile.linkedin_url,
        devpost_url: editedProfile.devpost_url,
      });

      const scrapedData = await scrapeSocialProfiles({
        github_url: editedProfile.github_url || undefined,
        linkedin_url: editedProfile.linkedin_url || undefined,
        devpost_url: editedProfile.devpost_url || undefined,
      });

      console.log('Scraped data received:', scrapedData);

      // Update the edited profile with scraped data
      setEditedProfile(prev => ({
        ...prev,
        github_projects: scrapedData.github_projects || prev.github_projects,
        work_experience: scrapedData.work_experience || prev.work_experience,
        education_details: scrapedData.education_details || prev.education_details,
        // Update hackathon info fields from LinkedIn
        major: scrapedData.major || prev.major,
        school: scrapedData.school || prev.school,
        year: scrapedData.year || prev.year
      }));

      const projectsCount = scrapedData.github_projects?.length || 0;
      const workCount = scrapedData.work_experience?.length || 0;
      const educationCount = scrapedData.education_details?.length || 0;
      
      toast({
        title: "Data imported successfully! ✨",
        description: `Found ${projectsCount} projects, ${workCount} work experiences, and ${educationCount} education entries${scrapedData.major ? `. Detected major: ${scrapedData.major}` : ''}`,
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error importing data:', error);
      toast({
        title: "Error importing data",
        description: error.message || "Failed to import data from social profiles",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleEditClick = () => {
    if (!user) {
      onEditRequireAuth?.();
      return;
    }
    setIsEditing(true);
    setValidationErrors([]);
  };

  const handleSave = async () => {
    if (!user) return;

    if (!validateRequiredFields()) {
      toast({
        title: "Please complete required fields",
        description: "Name, age, and bio are required fields marked with *",
        variant: "destructive",
      });
      return;
    }

    try {
      const profileData = {
          id: user.id,
        name: editedProfile.name?.trim(),
          age: editedProfile.age,
        bio: editedProfile.bio?.trim(),
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
        // New hackathon fields
        linkedin: editedProfile.linkedin,
        github: editedProfile.github,
        devpost: editedProfile.devpost,
        major: editedProfile.major,
        school: editedProfile.school,
        year: editedProfile.year,
        uiux: editedProfile.uiux,
        pitching: editedProfile.pitching,
        management: editedProfile.management,
        hardware: editedProfile.hardware,
        cyber: editedProfile.cyber,
        frontend: editedProfile.frontend,
        backend: editedProfile.backend,
        skills: editedProfile.skills,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      setProfile(editedProfile);
      setIsEditing(false);
      setValidationErrors([]);
      
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
    setValidationErrors([]);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out successfully",
      description: "Come back soon! 💕",
    });
  };

  // Helper function to handle multi-select skills
  const handleSkillsChange = (skill: string) => {
    const currentSkills = editedProfile.skills || [];
    if (currentSkills.includes(skill)) {
      setEditedProfile({
        ...editedProfile,
        skills: currentSkills.filter(s => s !== skill)
      });
    } else {
      setEditedProfile({
        ...editedProfile,
        skills: [...currentSkills, skill]
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = editedProfile.skills || [];
    setEditedProfile({
      ...editedProfile,
      skills: currentSkills.filter(s => s !== skillToRemove)
    });
  };

  // Helper function to handle skill ratings
  const handleSkillRatingChange = (skillKey: string, rating: number) => {
    setEditedProfile({
      ...editedProfile,
      [skillKey]: rating
    });
  };

  // Component to render star rating
  const StarRating = ({ skillKey, label, value, onChange, readonly = false }: {
    skillKey: string;
    label: string;
    value: number | null;
    onChange?: (rating: number) => void;
    readonly?: boolean;
  }) => {
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-app-neutral">{label}</span>
        <div className="flex space-x-1">
          {[1, 2, 3].map((rating) => (
            <button
              key={rating}
              type="button"
              disabled={readonly}
              onClick={() => !readonly && onChange?.(rating)}
              className={`w-5 h-5 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-all ${
                (value || 0) >= rating 
                  ? 'text-app-amber' 
                  : 'text-app-neutral/30'
              }`}
            >
              <Star className="w-full h-full fill-current" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handlePhotoClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setEditedProfile({
          ...editedProfile,
          photos: [result, ...(editedProfile.photos?.slice(1) || [])]
        });
      };
      reader.readAsDataURL(file);
    }
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
    <div className="py-8 min-h-screen bg-app-black">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-app-amber mb-2">
              {user ? 'My Profile' : 'Profile'}
            </h1>
            <p className="text-app-neutral">
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
              {!isEditing ? (
                <>
                  <button 
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-app-amber text-app-black rounded-lg hover:bg-app-amber/90 transition-colors flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-2 text-app-neutral hover:text-app-white border border-app-white/20 rounded-lg hover:bg-app-slate transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-app-white rounded-lg text-app-neutral hover:bg-app-slate transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-app-amber text-app-black rounded-lg hover:bg-app-amber/90 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <h3 className="text-red-400 font-semibold mb-2">Please fix the following errors:</h3>
            <ul className="list-disc list-inside text-red-300">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {showWelcomeMessage && (
          <div className="bg-app-slate border border-app-white/20 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-app-amber mb-2">
              {!user ? 'Welcome!' : 'Welcome to your profile!'}
            </h3>
            <p className="text-app-neutral mb-4">
              {!user 
                ? 'Create an account to build your dating profile and start connecting with others.'
                : 'Your profile is currently empty. Click "Edit Profile" to add your information and start connecting with others.'
              }
            </p>
            <button
              onClick={handleEditClick}
              className="px-4 py-2 bg-app-amber text-app-black rounded-lg hover:bg-app-amber/90 transition-colors"
            >
              {!user ? 'Get Started' : 'Complete Your Profile'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Profile Info */}
            <Card className="bg-app-slate border-app-white/20">
              <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                    <Avatar 
                      className={`w-40 h-40 border-4 border-app-amber mx-auto ${isEditing ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''}`}
                      onClick={handlePhotoClick}
                    >
                    <AvatarImage
                      src={profile.photos?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face'}
                      alt="Profile main"
                      className="object-cover"
                    />
                      <AvatarFallback className="text-3xl bg-app-slate text-app-amber">
                        {profile.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={handlePhotoClick}>
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <h2 className="text-2xl font-bold text-app-neutral mt-4">
                    {profile.name || 'Anonymous'}
                  </h2>
                  <p className="text-app-neutral/70">
                    {profile.age ? `Age ${profile.age}` : 'Age not specified'}
                  </p>
              </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-app-neutral mb-1">
                        Name <span className="text-red-400">*</span>
                      </label>
                  <input
                    type="text"
                    value={editedProfile.name || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                        className="w-full px-3 py-2 bg-app-black border border-app-white/30 text-app-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-app-amber focus:border-app-amber"
                        placeholder="Your name"
                  />
                    </div>
                
                    <div>
                      <label className="block text-sm font-medium text-app-neutral mb-1">
                        Age <span className="text-red-400">*</span>
                      </label>
                  <input
                    type="number"
                    value={editedProfile.age || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, age: parseInt(e.target.value) || null})}
                        className="w-full px-3 py-2 bg-app-black border border-app-white/30 text-app-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-app-amber focus:border-app-amber"
                        placeholder="Your age"
                  />
              </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* About */}
            <Card className="bg-app-slate border-app-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-app-amber">
                  <span>About</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div>
                    <label className="block text-sm font-medium text-app-neutral mb-1">
                      Bio <span className="text-red-400">*</span>
                    </label>
                  <textarea
                    value={editedProfile.bio || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                    rows={4}
                      className="w-full px-3 py-2 bg-app-black border border-app-white/30 text-app-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-app-amber focus:border-app-amber resize-none"
                    placeholder="Tell people about yourself..."
                  />
                  </div>
                ) : (
                  <p className="text-app-neutral">
                    {profile.bio || 'No bio added yet'}
                  </p>
                )}
              </CardContent>
            </Card>

              {/* Location */}
            <Card className="bg-app-slate border-app-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-app-amber" />
                  <span>Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.location || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                    className="w-full px-3 py-2 bg-app-black border border-app-white/30 text-app-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-app-amber focus:border-app-amber"
                    placeholder="Your location"
                  />
                ) : (
                  <p className="text-app-neutral">
                    {profile.location || 'Location not set'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Profile Links */}
            <Card className="bg-app-slate border-app-white/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-app-amber">
                  <span>Profile Links</span>
                  {isEditing && (
                    <button
                      onClick={handleImportData}
                      disabled={isImporting}
                      className="flex items-center space-x-2 px-3 py-1 bg-app-amber text-app-black text-sm rounded-lg hover:bg-app-amber/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isImporting ? 'Importing...' : 'Import Data'}</span>
                    </button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-app-neutral mb-1">GitHub URL</label>
                      <input
                        type="url"
                        value={editedProfile.github_url || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, github_url: e.target.value})}
                        className="w-full px-3 py-2 bg-app-black border border-app-white/30 text-app-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-app-amber focus:border-app-amber"
                        placeholder="https://github.com/username"
                      />
                    </div>
                    
                  <div>
                      <label className="block text-sm font-medium text-app-neutral mb-1">LinkedIn URL</label>
                      <input
                        type="url"
                        value={editedProfile.linkedin_url || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, linkedin_url: e.target.value})}
                        className="w-full px-3 py-2 bg-app-black border border-app-white/30 text-app-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-app-amber focus:border-app-amber"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    
                  <div>
                      <label className="block text-sm font-medium text-app-neutral mb-1">DevPost URL</label>
                      <input
                        type="url"
                        value={editedProfile.devpost_url || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, devpost_url: e.target.value})}
                        className="w-full px-3 py-2 bg-app-black border border-app-white/30 text-app-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-app-amber focus:border-app-amber"
                        placeholder="https://devpost.com/username"
                      />
                    </div>
                    
                    <div className="bg-app-amber/10 border border-app-amber/30 rounded-lg p-3">
                      <p className="text-sm text-app-amber">
                        💡 Add your social profile URLs above, then click "Import Data" to automatically populate your projects, work experience, and education details.
                      </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.github_url ? (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center space-x-2 p-2 bg-app-black border border-app-white/20 rounded-lg text-app-neutral hover:bg-app-slate transition-colors">
                        <Github className="w-4 h-4 text-app-amber" />
                        <span>GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                      <div className="flex items-center space-x-2 p-2 bg-app-black/50 border border-app-white/10 rounded-lg text-app-neutral/50">
                        <Github className="w-4 h-4" />
                      <span>No GitHub linked</span>
                    </div>
                  )}
                    
                  {profile.linkedin_url ? (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                         className="flex items-center space-x-2 p-2 bg-app-black border border-app-white/20 rounded-lg text-app-neutral hover:bg-app-slate transition-colors">
                        <Linkedin className="w-4 h-4 text-app-amber" />
                        <span>LinkedIn</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                      <div className="flex items-center space-x-2 p-2 bg-app-black/50 border border-app-white/10 rounded-lg text-app-neutral/50">
                        <Linkedin className="w-4 h-4" />
                      <span>No LinkedIn linked</span>
                    </div>
                  )}
                    
                  {profile.devpost_url ? (
                    <a href={profile.devpost_url} target="_blank" rel="noopener noreferrer"
                         className="flex items-center space-x-2 p-2 bg-app-black border border-app-white/20 rounded-lg text-app-neutral hover:bg-app-slate transition-colors">
                        <ExternalLink className="w-4 h-4 text-app-amber" />
                        <span>DevPost</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                      <div className="flex items-center space-x-2 p-2 bg-app-black/50 border border-app-white/10 rounded-lg text-app-neutral/50">
                        <ExternalLink className="w-4 h-4" />
                      <span>No DevPost linked</span>
                    </div>
                  )}
                </div>
              )}
              </CardContent>
            </Card>

                         {/* Technical Skills Section */}
             <Card className="bg-app-slate border-app-white/20">
               <CardHeader>
                 <CardTitle className="flex items-center space-x-2 text-app-amber">
                   <Code className="w-5 h-5 text-app-amber" />
                   <span>Technical Skills</span>
                 </CardTitle>
               </CardHeader>
               <CardContent>
              {isEditing ? (
                   <div className="space-y-4">
                     {/* Custom Multi-Select Dropdown */}
                     <div className="relative">
                       <label className="block text-sm font-medium text-app-neutral mb-2">Select your skills</label>
                       <button
                         type="button"
                         onClick={() => setIsSkillsDropdownOpen(!isSkillsDropdownOpen)}
                         className="w-full px-3 py-2 bg-app-black border border-app-white/30 text-app-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-app-amber focus:border-app-amber text-left flex items-center justify-between"
                       >
                         <span className="text-app-neutral">
                           {editedProfile.skills && editedProfile.skills.length > 0 
                             ? `${editedProfile.skills.length} skill${editedProfile.skills.length > 1 ? 's' : ''} selected`
                             : 'Select skills...'
                           }
                         </span>
                         <ChevronDown className={`w-4 h-4 transition-transform ${isSkillsDropdownOpen ? 'rotate-180' : ''}`} />
                       </button>
                       
                       {/* Dropdown Menu */}
                       {isSkillsDropdownOpen && (
                         <div className="absolute z-50 w-full mt-1 bg-app-slate border border-app-white/30 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                           {skillOptions.map((skill) => (
                             <label
                               key={skill}
                               className="flex items-center px-3 py-2 hover:bg-app-amber/10 cursor-pointer"
                             >
                               <input
                                 type="checkbox"
                                 checked={editedProfile.skills?.includes(skill) || false}
                                 onChange={() => handleSkillsChange(skill)}
                                 className="w-4 h-4 text-app-amber border-app-white/30 rounded focus:ring-app-amber mr-2"
                               />
                               <span className="text-sm text-app-neutral">{skill}</span>
                             </label>
                           ))}
                         </div>
                       )}
                     </div>

                     {/* Selected Skills Display */}
                     {editedProfile.skills && editedProfile.skills.length > 0 && (
                       <div>
                         <label className="block text-sm font-medium text-app-neutral mb-2">Selected skills</label>
                         <div className="flex flex-wrap gap-2">
                           {editedProfile.skills.map((skill) => (
                             <span
                               key={skill}
                               className="inline-flex items-center px-2 py-1 bg-app-amber/20 text-app-amber border border-app-amber/30 rounded text-sm"
                             >
                               {skill}
                               <button
                                 type="button"
                                 onClick={() => removeSkill(skill)}
                                 className="ml-1 text-app-amber hover:text-app-amber/80"
                               >
                                 <X className="w-3 h-3" />
                               </button>
                             </span>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Bulk entry for multiple skills */}
                     <div className="space-y-2">
                       <label className="block text-sm font-medium text-app-neutral">Or add multiple skills at once</label>
                <textarea
                         placeholder="Enter skills separated by commas, then press Enter or click away..."
                         rows={2}
                         className="w-full px-3 py-2 bg-app-black border border-app-white/30 text-app-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-app-amber focus:border-app-amber resize-none"
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             e.preventDefault();
                             const skills = e.currentTarget.value.split(',').map(s => s.trim()).filter(s => s);
                             const currentSkills = editedProfile.skills || [];
                             const newSkills = skills.filter(skill => !currentSkills.includes(skill));
                             if (newSkills.length > 0) {
                               setEditedProfile({
                                 ...editedProfile,
                                 skills: [...currentSkills, ...newSkills]
                               });
                             }
                             e.currentTarget.value = '';
                           }
                         }}
                         onBlur={(e) => {
                           const skills = e.currentTarget.value.split(',').map(s => s.trim()).filter(s => s);
                           const currentSkills = editedProfile.skills || [];
                           const newSkills = skills.filter(skill => !currentSkills.includes(skill));
                           if (newSkills.length > 0) {
                             setEditedProfile({
                               ...editedProfile,
                               skills: [...currentSkills, ...newSkills]
                             });
                           }
                           e.currentTarget.value = '';
                         }}
                       />
                       <p className="text-xs text-app-neutral/70">Example: React, Python, Machine Learning, Docker</p>
                     </div>
                   </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                     {(profile.skills && profile.skills.length > 0) ? (
                       profile.skills.map((skill, index) => (
                      <span
                        key={index}
                           className="px-2 py-1 bg-app-amber/20 text-app-amber border border-app-amber/30 rounded text-sm"
                      >
                           {skill}
                      </span>
                    ))
                  ) : (
                       <span className="text-app-neutral/50 text-sm">No skills added yet</span>
                  )}
                </div>
              )}
               </CardContent>
             </Card>

            {/* Skill Ratings Section */}
            <Card className="bg-app-slate border-app-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-app-amber">
                  <Star className="w-5 h-5 text-app-amber" />
                  <span>Skill Ratings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
              {isEditing ? (
                  <div>
                    <label className="block text-sm font-medium text-app-neutral mb-2">Rate your skills (1-3 stars)</label>
                    <div className="bg-app-black border border-app-white/20 rounded-lg p-4 space-y-2">
                      {skillCategories.map(({ key, label }) => (
                        <StarRating
                          key={key}
                          skillKey={key}
                          label={label}
                          value={editedProfile[key as keyof UserProfile] as number}
                          onChange={(rating) => handleSkillRatingChange(key, rating)}
                        />
                      ))}
                </div>
                      </div>
                ) : (
                  <div className="bg-app-black border border-app-white/20 rounded-lg p-4 space-y-2">
                    {skillCategories.map(({ key, label }) => (
                      <StarRating
                        key={key}
                        skillKey={key}
                        label={label}
                        value={profile[key as keyof UserProfile] as number}
                        readonly={true}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Education Section */}
            <Card className="bg-app-slate border-app-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-app-amber">
                  <GraduationCap className="w-5 h-5 text-app-amber" />
                  <span>Education</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
            {/* Education */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-app-neutral mb-1">Major</label>
                        <Select value={editedProfile.major || ''} onValueChange={(value) => setEditedProfile({...editedProfile, major: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your major" />
                          </SelectTrigger>
                          <SelectContent>
                            {majorOptions.map((major) => (
                              <SelectItem key={major} value={major}>{major}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
              </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-app-neutral mb-1">Year</label>
                        <Select value={editedProfile.year || ''} onValueChange={(value) => setEditedProfile({...editedProfile, year: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your year" />
                          </SelectTrigger>
                          <SelectContent>
                            {yearOptions.map((year) => (
                              <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-app-neutral mb-1">School</label>
                      <input
                        type="text"
                        value={editedProfile.school || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, school: e.target.value})}
                        className="w-full px-3 py-2 bg-app-black border border-app-white/30 text-app-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-app-amber focus:border-app-amber"
                        placeholder="Your school name"
                      />
                    </div>
                </div>
              ) : (
                  <div className="space-y-4">
                    {/* Display education info */}
                    {(profile.major || profile.school || profile.year) ? (
                      <div>
                        <h4 className="font-medium text-app-amber mb-2">Education</h4>
                        <div className="space-y-1 text-sm text-app-neutral">
                          {profile.major && <p>Major: {profile.major}</p>}
                          {profile.school && <p>School: {profile.school}</p>}
                          {profile.year && <p>Year: {profile.year}</p>}
                      </div>
                  </div>
                ) : (
                      <p className="text-app-neutral/50 text-center py-4">No education information added yet</p>
              )}
            </div>
                )}
              </CardContent>
            </Card>
              </div>

          {/* Right Column */}
                <div className="space-y-6">
            {/* Work Experience */}
            <Card className="bg-app-slate border-app-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-app-amber">
                  <Building className="w-5 h-5 text-app-amber" />
                  <span>Work Experience</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.work_experience && profile.work_experience.length > 0 ? (
                  <div className="space-y-4">
                    {profile.work_experience.map((job: any, index: number) => (
                      <div key={index} className="border-l-4 border-app-amber pl-4">
                        <h4 className="font-semibold text-app-neutral">{job.title}</h4>
                        <p className="text-app-neutral/80">{job.company}</p>
                        <p className="text-sm text-app-neutral/60">{job.duration}</p>
                        {job.description && (
                          <p className="text-sm text-app-neutral/80 mt-1">{job.description}</p>
                        )}
                    </div>
                  ))}
                </div>
              ) : (
                  <p className="text-app-neutral/50 text-center py-4">No work experience added yet</p>
                )}
              </CardContent>
            </Card>

            {/* Projects & Repositories / Hackathon History */}
            <Card className="bg-app-slate border-app-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-app-amber">
                  <Trophy className="w-5 h-5 text-app-amber" />
                  <span>Projects & Hackathon History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.github_projects && profile.github_projects.length > 0 ? (
                  <div className="space-y-4">
                    {profile.github_projects.map((project: any, index: number) => (
                      <div key={index} className="bg-app-black border border-app-white/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-app-neutral">{project.name}</h4>
                            {project.type === 'hackathon' && (
                              <span className="inline-block text-xs px-2 py-1 bg-app-amber/20 text-app-amber border border-app-amber/30 rounded">
                                Hackathon
                              </span>
                          )}
                        </div>
                          <span className="text-sm text-app-neutral/60 flex items-center">
                            <Star className="w-3 h-3 mr-1 text-app-amber" />
                            {project.stars || 0}
                              </span>
                        </div>
                        <p className="text-app-neutral/80 text-sm mb-2">
                          {project.description || 'No description available'}
                        </p>
                        {project.event && (
                          <p className="text-xs text-app-neutral/60 mb-2">Event: {project.event}</p>
                            )}
                            {project.awards && project.awards.length > 0 && (
                          <div className="mb-2">
                            {project.awards.map((award: string, awardIndex: number) => (
                              <span key={awardIndex} className="inline-block text-xs px-2 py-1 bg-app-amber/20 text-app-amber border border-app-amber/30 rounded mr-1">
                                🏆 {award}
                              </span>
                            ))}
                          </div>
                        )}
                        {project.language && (
                          <span className="inline-block text-xs px-2 py-1 bg-app-slate text-app-neutral border border-app-white/20 rounded">
                            {project.language}
                            </span>
                          )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-app-neutral/50 mb-2">No projects found. Connect your GitHub and DevPost to import repositories and hackathon projects automatically.</p>
                  </div>
              )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
