import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  Avatar, 
  AvatarFallback, 
  AvatarImage
} from '@/Components/ui';
import useStore from '@/hooks/useStore';
import { Link } from 'react-router-dom';

export default function AvatarIcon() {
  const { loggedInMember, memberLogout } = useStore((state) => state);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Avatar className="relative w-12 h-12">
          {' '}
          {/* Changed from w-9 h-9 to w-12 h-12 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <AvatarImage
              className="w-12 h-12 rounded-full object-cover border-background" // Changed from w-14 h-14 to w-12 h-12
              src={loggedInMember?.photo?.url}
              alt="@shadcn"
            />
            <AvatarFallback className="w-12 h-12 text-xl">
              {' '}
              {/* Changed from w-14 h-14 to w-12 h-12, and text-lg to text-xl for better fit */}
              {`${loggedInMember?.firstName[0]} ${loggedInMember?.lastName[0]}`}
            </AvatarFallback>
          </div>
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
            <DropdownMenuLabel>
              <strong>My Account</strong>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link to="/profile">
                <DropdownMenuItem>Profile</DropdownMenuItem>
              </Link>
              <Link to="/change-password">
                <DropdownMenuItem>Change Password</DropdownMenuItem>
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
