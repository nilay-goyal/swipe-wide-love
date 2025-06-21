
import { useProfile } from '@/hooks/useProfile';
import ProfileForm from './profile/ProfileForm';

const ProfilePage = () => {
  const { profile, loading, setProfile } = useProfile();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Profile</h1>
          <p className="text-gray-600">Update your information to help others find great teammates!</p>
        </div>

        <ProfileForm 
          profile={profile} 
          onProfileUpdate={setProfile}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
