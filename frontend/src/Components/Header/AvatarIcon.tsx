import useStore from '@/hooks/useStore';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '../ui/dropdown-menu';
import { Link } from 'react-router-dom';

export default function AvatarIcon() {
  const { loggedInMember, memberLogout } = useStore((state) => state);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Avatar className="">
          <AvatarImage
            className="w-9 h-9 rounded-full object-cover"
            src={loggedInMember?.photo?.url}
            alt="@shadcn"
          />
          <AvatarFallback>{`${loggedInMember?.firstName[0]} ${loggedInMember?.lastName[0]}`}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-50 mr-14">
        {!loggedInMember && (
          <>
            <DropdownMenuLabel>Get Started</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link to="/login">
                <DropdownMenuItem>Login</DropdownMenuItem>
              </Link>
              <Link to="/signup">
                <DropdownMenuItem>Signup</DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
          </>
        )}
        {loggedInMember && (
          <>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link to="/profile">
                <DropdownMenuItem>Profile</DropdownMenuItem>
              </Link>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link to="/login">
                <DropdownMenuItem
                  onClick={() => {
                    memberLogout();
                  }}
                >
                  Log Out
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
