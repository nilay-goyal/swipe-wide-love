
import { useState, useEffect } from 'react';
import { Edit, Save, Camera, MapPin, LogOut, Github, Linkedin, ExternalLink, Building, GraduationCap, Star, Users, Plus, Trash2 } from 'lucide-react';
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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
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
      console.log('Fetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          // Profile doesn't exist yet - this should not happen with the trigger, but let's handle it
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
          education_details: Array.isArray(data.education_details) ? data.education_details : []
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
      
      // Fetch the newly created profile
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

    // Validate required fields
    if (!validateRequiredFields()) {
      toast({
        title: "Please complete required fields",
        description: "Name, age, and bio are required fields marked with *",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
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
        });

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
              {!isEditing ? (
                <>
                  <button 
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2"
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Please fix the following errors:</h3>
            <ul className="list-disc list-inside text-red-700">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

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
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              {!user ? 'Get Started' : 'Complete Your Profile'}
            </button>
          </div>
        )}

        {/* Basic Profile Info */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
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
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editedProfile.name || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={editedProfile.age || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, age: parseInt(e.target.value) || null})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Your age"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={editedProfile.bio || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                      placeholder="Tell people about yourself..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={editedProfile.location || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Your location"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
                    <textarea
                      value={editedProfile.interests?.join(', ') || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, interests: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                      placeholder="Enter interests separated by commas..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <p className="text-gray-800">{profile.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Age:</span>
                    <p className="text-gray-800">{profile.age ? `${profile.age} years old` : 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Bio:</span>
                    <p className="text-gray-800">{profile.bio || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Location:</span>
                    <p className="text-gray-800">{profile.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Interests:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(profile.interests && profile.interests.length > 0) ? (
                        profile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-sm"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">No interests added</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Social Links</h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                    <input
                      type="url"
                      value={editedProfile.github_url || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, github_url: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="https://github.com/username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={editedProfile.linkedin_url || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, linkedin_url: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DevPost URL</label>
                    <input
                      type="url"
                      value={editedProfile.devpost_url || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, devpost_url: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="https://devpost.com/username"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.github_url ? (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                      <Github className="w-4 h-4" />
                      <span>GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <div className="flex items-center space-x-2 p-2 bg-gray-50/50 rounded-lg text-gray-400">
                      <Github className="w-4 h-4" />
                      <span>No GitHub linked</span>
                    </div>
                  )}
                  
                  {profile.linkedin_url ? (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <div className="flex items-center space-x-2 p-2 bg-gray-50/50 rounded-lg text-gray-400">
                      <Linkedin className="w-4 h-4" />
                      <span>No LinkedIn linked</span>
                    </div>
                  )}
                  
                  {profile.devpost_url ? (
                    <a href={profile.devpost_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                      <span>DevPost</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <div className="flex items-center space-x-2 p-2 bg-gray-50/50 rounded-lg text-gray-400">
                      <ExternalLink className="w-4 h-4" />
                      <span>No DevPost linked</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
