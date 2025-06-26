import {
  HouseIcon,
  CameraPlusIcon,
  ChatsCircleIcon,
} from '@phosphor-icons/react';

export const NAV_LINKS = Object.freeze([
  {
    label: 'Home',
    to: '/',
    icon: <HouseIcon size={32} weight="thin" />,
  },
  {
    label: 'Post',
    to: '/post',
    icon: <CameraPlusIcon size={32} weight="thin" />,
    onClick: 'openAddPost',
  },
  {
    label: 'Messages',
    to: '/messages',
    icon: <ChatsCircleIcon size={32} weight="thin" />,
  },
]);
