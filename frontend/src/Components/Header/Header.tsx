import { Separator } from "../ui/separator";
// import { ModeToggle } from "@/app/ModeToggle";
import SearchBar from "./SearchBar";
// import AppNameAndLogo from "./AppNameAndLogo";

export default function Navbar() {
  return (
    <div className="font-poppins fixed top-0 left-0 w-full p-6 flex justify-between items-center bg-white dark:bg-gray-900 shadow-md z-10">
      <div className="flex items-center gap-16">
        {/* <AppNameAndLogo /> */}
        <SearchBar />
      </div>
      <div className="flex items-center gap-5">
        {/* <ModeToggle /> */}
        <Separator orientation="vertical" className="h-5 w-[2px] bg-gray-500" />
      </div>
    </div>
  );
}
