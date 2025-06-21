
import { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string | null;
  age: number | null;
  bio: string | null;
  location: string | null;
  interests: string[] | null;
  occupation: string | null;
  education: string | null;
  github_url: string | null;
  devpost_url: string | null;
  linkedin_url: string | null;
}

interface ProfileFormProps {
  profile: Profile;
  onProfileUpdate: (updatedProfile: Profile) => void;
}

const ProfileForm = ({ profile, onProfileUpdate }: ProfileFormProps) => {
  const { toast } = useToast();
  const [editingProfile, setEditingProfile] = useState<Profile>(profile);
  const [newInterest, setNewInterest] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof Profile, value: any) => {
    setEditingProfile(prev => ({ ...prev, [field]: value }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !editingProfile.interests?.includes(newInterest.trim())) {
      const updatedInterests = [...(editingProfile.interests || []), newInterest.trim()];
      handleInputChange('interests', updatedInterests);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    const updatedInterests = editingProfile.interests?.filter(i => i !== interest) || [];
    handleInputChange('interests', updatedInterests);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editingProfile.name,
          age: editingProfile.age,
          bio: editingProfile.bio,
          location: editingProfile.location,
          interests: editingProfile.interests,
          occupation: editingProfile.occupation,
          education: editingProfile.education,
          github_url: editingProfile.github_url,
          devpost_url: editingProfile.devpost_url,
          linkedin_url: editingProfile.linkedin_url,
        })
        .eq('id', profile.id);

      if (error) throw error;

      onProfileUpdate(editingProfile);
      toast({
        title: "Profile Updated! ✨",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={editingProfile.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            type="number"
            value={editingProfile.age || ''}
            onChange={(e) => handleInputChange('age', parseInt(e.target.value) || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={editingProfile.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
          <input
            type="text"
            value={editingProfile.occupation || ''}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
          <input
            type="text"
            value={editingProfile.education || ''}
            onChange={(e) => handleInputChange('education', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
          <input
            type="url"
            value={editingProfile.github_url || ''}
            onChange={(e) => handleInputChange('github_url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">DevPost URL</label>
          <input
            type="url"
            value={editingProfile.devpost_url || ''}
            onChange={(e) => handleInputChange('devpost_url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
          <input
            type="url"
            value={editingProfile.linkedin_url || ''}
            onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          value={editingProfile.bio || ''}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addInterest()}
            placeholder="Add an interest..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            onClick={addInterest}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {editingProfile.interests?.map((interest, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm"
            >
              {interest}
              <button
                onClick={() => removeInterest(interest)}
                className="text-pink-600 hover:text-pink-800"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isLoading}
        className="w-full py-3 dating-gradient text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <Save className="w-4 h-4 mr-2 inline" />
        {isLoading ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
};

export default ProfileForm;
