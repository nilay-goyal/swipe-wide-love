import { useState, useEffect } from 'react';
import { Edit, Save, Camera, MapPin, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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
}

interface ProfilePageProps {
  onEditRequireAuth?: () => void;
}

const ProfilePage = ({ onEditRequireAuth }: ProfilePageProps) => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    name: '',
    age: null,
    bio: '',
    location: '',
    photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face'],
    interests: [],
    occupation: '',
    education: ''
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
        const profileData = {
          id: data.id,
          name: data.name || '',
          age: data.age,
          bio: data.bio || '',
          location: data.location || '',
          photos: data.photos || ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face'],
          interests: data.interests || [],
          occupation: data.occupation || '',
          education: data.education || ''
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
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
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
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
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

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="flex h-auto">
            <div className="w-2/5 p-8">
              <div className="space-y-4">
                <div className="relative group">
                  <img
                    src={profile.photos?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face'}
                    alt="Profile main"
                    className="w-full h-64 object-cover rounded-2xl"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {(profile.photos?.slice(1, 3) || []).map((photo, index) => (
                    <div key={index + 1} className="relative group">
                      <img
                        src={photo}
                        alt={`Profile ${index + 2}`}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-3/5 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Profile Details</h2>
                <div className="flex space-x-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 dating-gradient text-white rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEditClick}
                      className="px-4 py-2 dating-gradient text-white rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.name || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Enter your name"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium">{profile.name || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedProfile.age || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, age: parseInt(e.target.value) || null})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Enter your age"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium">{profile.age ? `${profile.age} years old` : 'Not specified'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.location || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Enter your location"
                    />
                  ) : (
                    <div className="flex items-center text-gray-800">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{profile.location || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={editedProfile.bio || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Tell others about yourself..."
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed">{profile.bio || 'No bio added yet'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
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
                      <span className="text-gray-500 text-sm">No interests added yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
