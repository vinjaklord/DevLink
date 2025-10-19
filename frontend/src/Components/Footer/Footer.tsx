import { HouseIcon, CameraPlusIcon, ChatsCircleIcon } from '@phosphor-icons/react';
import useStore from '@/hooks/useStore';
import { NavLink } from 'react-router-dom';

export default function FooterNav() {
  const { setShowAddPost } = useStore((state) => state);

  return (
    <div className="fixed hidden bottom-0 left-0 w-full bg-white dark:bg-gray-900 shadow-inner border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-15 px-6 max-[1100px]:flex z-20">
      <NavLink to="/" className="hover:text-primary flex flex-col items-center justify-center">
        <HouseIcon size={28} weight="thin" />
      </NavLink>

      <button
        onClick={() => setShowAddPost(true)}
        className="hover:text-primary flex flex-col items-center justify-center"
      >
        <CameraPlusIcon size={28} weight="thin" />
      </button>

      <NavLink to="/messages" className="hover:text-primary flex flex-col items-center justify-center">
        <ChatsCircleIcon size={28} weight="thin" />
      </NavLink>
    </div>
  );
}
