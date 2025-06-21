
import { useState } from 'react';
import { Edit, Save, Camera, MapPin, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  name: string;
  age: number;
  bio: string;
  location: string;
  photos: string[];
  interests: string[];
  occupation: string;
  education: string;
}

const ProfilePage = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "Jordan Smith",
    age: 28,
    bio: "Adventure seeker and coffee enthusiast. Love exploring new places, trying different cuisines, and meeting new people. Looking for genuine connections and someone to share life's beautiful moments with.",
    location: "San Francisco, CA",
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=400&fit=crop"
    ],
    interests: ["Travel", "Photography", "Cooking", "Hiking", "Music", "Art"],
    occupation: "Software Engineer",
    education: "University of California, Berkeley"
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    toast({
      title: "Profile Updated! ✨",
      description: "Your changes have been saved successfully",
      duration: 3000,
    });
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const addInterest = () => {
    const newInterest = prompt("Add a new interest:");
    if (newInterest && !editedProfile.interests.includes(newInterest)) {
      setEditedProfile({
        ...editedProfile,
        interests: [...editedProfile.interests, newInterest]
      });
    }
  };

  const removeInterest = (interest: string) => {
    setEditedProfile({
      ...editedProfile,
      interests: editedProfile.interests.filter(i => i !== interest)
    });
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your dating profile information</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="flex h-auto">
            {/* Photo Section */}
            <div className="w-2/5 p-8">
              <div className="space-y-4">
                {/* Main Photo */}
                <div className="relative group">
                  <img
                    src={profile.photos[0]}
                    alt="Profile main"
                    className="w-full h-64 object-cover rounded-2xl"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>

                {/* Additional Photos */}
                <div className="grid grid-cols-2 gap-4">
                  {profile.photos.slice(1).map((photo, index) => (
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

                {isEditing && (
                  <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-pink-300 hover:text-pink-500 transition-colors">
                    <Camera className="w-6 h-6 mx-auto mb-1" />
                    Add Photos
                  </button>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="w-3/5 p-8">
              {/* Action Buttons */}
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
                    <>
                      <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                        <Settings className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 dating-gradient text-white rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Profile Fields */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium">{profile.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedProfile.age}
                        onChange={(e) => setEditedProfile({...editedProfile, age: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium">{profile.age} years old</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.location}
                      onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-800">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={editedProfile.bio}
                      onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                  )}
                </div>

                {/* Professional Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.occupation}
                        onChange={(e) => setEditedProfile({...editedProfile, occupation: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    ) : (
                      <p className="text-gray-800">{profile.occupation}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.education}
                        onChange={(e) => setEditedProfile({...editedProfile, education: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    ) : (
                      <p className="text-gray-800">{profile.education}</p>
                    )}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {(isEditing ? editedProfile : profile).interests.map((interest, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium ${
                          isEditing ? 'cursor-pointer hover:bg-red-100 hover:text-red-700' : ''
                        }`}
                        onClick={() => isEditing && removeInterest(interest)}
                      >
                        {interest} {isEditing && '×'}
                      </span>
                    ))}
                    {isEditing && (
                      <button
                        onClick={addInterest}
                        className="px-3 py-1 border-2 border-dashed border-pink-300 text-pink-600 rounded-full text-sm font-medium hover:border-pink-400 hover:text-pink-700 transition-colors"
                      >
                        + Add Interest
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Statistics */}
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-2xl font-bold text-pink-600 mb-2">127</div>
            <p className="text-gray-600">Profile Views</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-2xl font-bold text-pink-600 mb-2">42</div>
            <p className="text-gray-600">Matches</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-2xl font-bold text-pink-600 mb-2">15</div>
            <p className="text-gray-600">Messages</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
