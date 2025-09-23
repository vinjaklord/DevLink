import useStore from '@/hooks/useStore';
import { Link } from 'react-router-dom';

export default function ProfileHeader() {
  const { loggedInMember } = useStore();

  return (
    <div className="bg-card shadow-md rounded-xl p-6 text-center relative">
      {/* Profile Picture */}
      <div className="flex justify-center -mt-16">
        <img
          src={loggedInMember?.photo?.url}
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-background object-cover"
        />
      </div>

      {/* Name & Email */}
      <h1 className="mt-4 text-2xl font-semibold">
        {loggedInMember?.firstName} {loggedInMember?.lastName}
      </h1>
      <p className="text-muted-foreground text-sm">{`@${loggedInMember?.username}`}</p>
      <p className="text-muted-foreground text-sm">{loggedInMember?.email}</p>

      {/* Edit Button Below Name/Email */}
      <div className="mt-4">
        <Link
          to="/edit-profile"
          className="inline-block bg-muted text-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-muted/80 transition"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}
