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
  AvatarImage,
} from '@/Components/ui';
import useStore from '@/hooks/useStore';
import { Link } from 'react-router-dom';

export default function AvatarIcon() {
  const { loggedInMember, memberLogout } = useStore((state) => state);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Avatar className="relative w-12 h-12">
          <div className="absolute inset-0 flex items-center justify-center">
            <AvatarImage
              className="w-12 h-12 rounded-full object-cover border-background"
              src={`${loggedInMember?.photo?.url}?tr=w-128,h-128,cm-round,cq-95,sh-20,q-95,f-auto`}
              alt="@shadcn"
            />
            <AvatarFallback className="w-12 h-12 text-xl">
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
                <DropdownMenuItem className="hover:bg-[#3a3b3c5f]">Login</DropdownMenuItem>
              </Link>
              <Link to="/signup">
                <DropdownMenuItem className="hover:bg-[#3a3b3c5f]">Signup</DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
          </>
        )}
        {loggedInMember && (
          <>
            <DropdownMenuLabel className="text-center">
              <strong>My Account</strong>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link to={`/members/${loggedInMember?.username}`}>
                <DropdownMenuItem className="hover:bg-[#3a3b3c5f]">Profile</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-center">
                <strong>Settings</strong>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to="/change-password">
                <DropdownMenuItem className="hover:bg-[#3a3b3c5f]">
                  Change Password
                </DropdownMenuItem>
              </Link>
              <Link to="/edit-profile">
                <DropdownMenuItem className="hover:bg-[#3a3b3c5f]">Edit Profile</DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link to="/login">
                <DropdownMenuItem
                  className="hover:bg-[#bd5b5b]"
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
