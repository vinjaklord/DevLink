<<<<<<< HEAD
import useStore from "@/hooks/useStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup } from "../ui/dropdown-menu";
import { Link } from "react-router-dom";

export default function AvatarIcon() {
  const { loggedInMember } = useStore((state) => state);

=======
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup } from "../ui/dropdown-menu";

export default function AvatarIcon() {
>>>>>>> 6d20355e57951d7fc0081343aee732ce15e82fa0
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="">
<<<<<<< HEAD
          <AvatarImage src="https://icons.veryicon.com/png/o/internet--web/prejudice/user-128.png" alt="@shadcn" />
=======
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
>>>>>>> 6d20355e57951d7fc0081343aee732ce15e82fa0
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-50 mr-14">
<<<<<<< HEAD
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
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
=======
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Dark Mode</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Log Out</DropdownMenuItem>
        </DropdownMenuGroup>
>>>>>>> 6d20355e57951d7fc0081343aee732ce15e82fa0
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
