import { Link } from 'react-router-dom';
import Logo from '../../assets/react.svg';

export default function AppNameAndLogo() {
  return (
    <div className="font-poppins flex items-center gap-2 ">
      {/* Logo with Link */}
      <Link to="/">
        <div className="flex justify-center items-center">
          <img
            src={Logo}
            alt="Logo"
            className="min-h-6 min-w-6 max-h-6 max-w-6 "
          />
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
