import { Separator } from "../ui/separator";
// import { ModeToggle } from "./ModeToggle";
import SearchBar from "./SearchBar";
import AppNameAndLogo from "./AppNameAndLogo";
import AvatarIcon from "./AvatarIcon";
import { NavLink } from "react-router-dom";
import { NAV_LINKS } from "@/constant/navLinks";

export default function Navbar() {
  return (
    <div className="font-poppins fixed top-0 left-0 w-full p-6 flex justify-between items-center bg-white dark:bg-gray-900 shadow-md z-10">
      {/* Left Section */}
      <div className="flex items-center gap-16">
        <AppNameAndLogo />
        <SearchBar />
      </div>

      {/* Center Section: NavLinks */}
      <div className="absolute left-1/2 -translate-x-1/2 flex gap-4">
        {NAV_LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} className={`flex m-6 items-center transition-transform duration-200 hover:scale-110 hover:text-primary `}>
            {link.icon}
            <span className="sr-only">{link.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        <AvatarIcon />
        {/* <ModeToggle /> */}
        <Separator orientation="vertical" className="h-5 w-[2px] bg-gray-500" />
      </div>
    </div>
  );
}
