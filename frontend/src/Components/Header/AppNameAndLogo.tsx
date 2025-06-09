<<<<<<< HEAD
import { Link } from 'react-router-dom';
import Logo from '../../assets/react.svg';
=======
import { Link } from "react-router-dom";
import Logo from "../../assets/react.svg";
>>>>>>> 6d20355e57951d7fc0081343aee732ce15e82fa0

export default function AppNameAndLogo() {
  return (
    <div className="font-poppins flex items-center gap-2 ">
      {/* Logo with Link */}
      <Link to="/">
        <div className="flex justify-center items-center">
<<<<<<< HEAD
          <img
            src={Logo}
            alt="Logo"
            className="min-h-6 min-w-6 max-h-6 max-w-6 "
          />
=======
          <img src={Logo} alt="Logo" className="h-6 w-6" />
>>>>>>> 6d20355e57951d7fc0081343aee732ce15e82fa0
        </div>
      </Link>

      {/* Container for the name */}
      <div className="flex gap-1 items-center text-xl">
        <span className="font-bold">Ide</span>
        <span>Gas</span>
      </div>
    </div>
  );
}
