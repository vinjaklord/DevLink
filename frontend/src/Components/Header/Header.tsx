import { Separator } from '@/Components/ui';
import { ModeToggle } from '@/ModeToggle/ModeToggle';
import SearchBar from './HeaderComponets/SearchBar';
import AppNameAndLogo from './HeaderComponets/AppNameAndLogo';
import AvatarIcon from './HeaderComponets/AvatarIcon';
import useStore from '@/hooks/useStore';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { HouseIcon, CameraPlusIcon, ChatsCircleIcon } from '@phosphor-icons/react';
import Notifications from './HeaderComponets/Notifications';

export default function Navbar() {
  const { setShowAddPost, loggedInMember, fetchFriendsPosts } = useStore((state) => state);
  const location = useLocation();
  const navigate = useNavigate();

  const isResultsPage = location.pathname.startsWith('/results');

  const handleHomeClick = () => {
    if (location.pathname === '/') {
      // already on homepage → scroll + refresh
      window.scrollTo({ top: 0, behavior: 'smooth' });
      fetchFriendsPosts(); // reload posts
    } else {
      // navigate normally
      navigate('/');
    }
  };

  if (!loggedInMember) {
    return (
      <div className="font-poppins fixed top-0 left-0 w-full p-4 flex justify-between items-center bg-white dark:bg-gray-900 shadow-md z-10">
        <AppNameAndLogo />
        <ModeToggle />
      </div>
    );
  }
  return (
    <div className="font-poppins fixed top-0 left-0 w-full p-4 flex justify-between items-center bg-white dark:bg-gray-900 shadow-md z-10">
      {/* Left Section */}
      <div className="flex items-center gap-10 flex-1 max-w-[34%]">
        <AppNameAndLogo />
        <SearchBar buttonMode={isResultsPage} />
      </div>

      {/* Center Section: NavLinks */}
      <div className="absolute left-1/2 -translate-x-1/2 flex gap-20 max-[1100px]:hidden">
        <button onClick={handleHomeClick} className="hover:text-primary">
          <HouseIcon size={32} weight="thin" />
        </button>

        <button onClick={() => setShowAddPost(true)} className="hover:text-primary">
          <CameraPlusIcon size={32} weight="thin" />
        </button>

        <NavLink to="/messages" className="hover:text-primary">
          <ChatsCircleIcon size={32} weight="thin" />
        </NavLink>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        <Notifications />
        <ModeToggle />
        <AvatarIcon />
        <Separator orientation="vertical" className="h-5 w-[2px] bg-gray-500" />
      </div>
    </div>
  );
}
