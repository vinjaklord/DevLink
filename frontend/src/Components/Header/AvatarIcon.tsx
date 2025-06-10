import useStore from "@/hooks/useStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup } from "../ui/dropdown-menu";
import { Link } from "react-router-dom";

export default function AvatarIcon() {
  const { loggedInMember } = useStore((state) => state);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="">
          <AvatarImage src="https://icons.veryicon.com/png/o/internet--web/prejudice/user-128.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
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
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
