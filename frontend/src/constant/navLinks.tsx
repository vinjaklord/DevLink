import { HouseIcon, CameraPlusIcon, ChatsCircleIcon } from "@phosphor-icons/react";

export const NAV_LINKS = Object.freeze([
  // {
  //   label: 'Shifts',
  //   to: '/shifts',
  //   icon: <CalendarMonthIcon className="navIcon"/>,
  //   subLinks: [
  //     { label: 'My Shifts', to: '/shifts/my-shifts' },
  //     { label: 'All Shifts', to: '/shifts/all-shifts' },
  //   ],
  // },
  {
    label: "Home",
    to: "/home",
    icon: <HouseIcon size={32} weight="thin" />,
  },
  {
    label: "Post",
    to: "/post",
    icon: <CameraPlusIcon size={32} weight="thin" />,
  },
  {
    label: "Messages",
    to: "/messages",
    icon: <ChatsCircleIcon size={32} weight="thin" />,
  },
]);
