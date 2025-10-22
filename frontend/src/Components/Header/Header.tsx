import { Separator } from '../ui/separator';
import { ModeToggle } from '@/ModeToggle/ModeToggle';
import SearchBar from './SearchBar';
import AppNameAndLogo from './AppNameAndLogo';
import AvatarIcon from './AvatarIcon';
import useStore from '@/hooks/useStore';
import { NavLink, useLocation } from 'react-router-dom';
import { HouseIcon, CameraPlusIcon, ChatsCircleIcon } from '@phosphor-icons/react';

export default function Navbar() {
  const { setShowAddPost, loggedInMember } = useStore((state) => state);
  const location = useLocation();

  const isResultsPage = location.pathname.startsWith('/results');

  if (!loggedInMember) {
    return (
      <div className="font-poppins fixed top-0 left-0 w-full p-6 flex justify-between items-center bg-white dark:bg-gray-900 shadow-md z-10">
        <AppNameAndLogo />
        <ModeToggle />
      </div>
    );
  }
  return (
    <div className="font-poppins fixed top-0 left-0 w-full p-6 flex justify-between items-center bg-white dark:bg-gray-900 shadow-md z-10">
      {/* Left Section */}
      <div className="flex items-center gap-10 flex-1 max-w-[34%]">
        <AppNameAndLogo />
        <SearchBar buttonMode={isResultsPage}/>
      </div>

      {/* Center Section: NavLinks */}
      <div className="absolute left-1/2 -translate-x-1/2 flex gap-20 max-[1100px]:hidden">
        <NavLink to="/" className="hover:text-primary">
          <HouseIcon size={32} weight="thin" />
        </NavLink>

        <button onClick={() => setShowAddPost(true)} className="hover:text-primary">
          <CameraPlusIcon size={32} weight="thin" />
        </button>

        <NavLink to="/messages" className="hover:text-primary">
          <ChatsCircleIcon size={32} weight="thin" />
        </NavLink>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        <ModeToggle />
        <AvatarIcon />
        <Separator orientation="vertical" className="h-5 w-[2px] bg-gray-500" />
      </div>
    </div>
  );
}
