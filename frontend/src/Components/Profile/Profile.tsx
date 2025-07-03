import { Link } from 'react-router-dom';
import ProfileHeader from './ProfileHeader';
import { PostFeed } from '../Feed/MainFeed/PostsFeed.tsx';

function Profile() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-22">
      <div className="container max-w-4xl mx-auto space-y-6 px-4">
        {/* Header */}
        <ProfileHeader />

        {/* Posts */}
        <div className="space-y-4">
          <PostFeed />
        </div>
      </div>
    </div>
  );
}

export default Profile;
