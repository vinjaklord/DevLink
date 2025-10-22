import { useEffect, useRef, useState } from 'react';
import { Input } from '../ui/input';
import { IoSearch } from 'react-icons/io5';
import useStore from '../../hooks/useStore.ts';
import type { IMember } from '@/models/member.model.ts';
import { useOutsideClick } from '@/hooks/useOutsideClick.ts';
import { Link, useNavigate } from 'react-router-dom';
import { useWindowWidth } from '@/hooks/useWindowWidth.ts';

interface SearchBarProps {
  buttonMode?: boolean;
  collapseThreshold?: number;
}

export default function SearchBar({ buttonMode = false, collapseThreshold = 1100 }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { searchMembersFriends, friendsSearchResults } = useStore((state) => state);

  const isWide = useWindowWidth(collapseThreshold);

  const isCollapsed = buttonMode || !isWide;

  useOutsideClick(containerRef, () => setShowDropdown(false));

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.trim()) {
        searchMembersFriends(query);
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, searchMembersFriends]);



  const handleSeeAll = () => {
    // Optionally store query in session/localStorage
    sessionStorage.setItem('searchQuery', query);

    // Redirect to full search results page
    navigate(`/results?query=${encodeURIComponent(query)}`);
    setShowDropdown(false);
  };

  const handleButtonClick = () => {
    navigate('/results');
  };

  return (
    <div ref={containerRef} className="relative flex items-center min-w-[150px] max-w-[270px]">
      {/* Search icon stays fixed on the left */}
      <IoSearch className={`search-icon absolute left-3 top-2 text-2xl z-20 text-gray-400`} />

      {/* Drawer input */}
      <div
        className={`search-drawer relative flex-1 transition-all duration-400 ease-in-out
          ${isCollapsed ? 'scale-x-0 opacity-0' : 'scale-x-100 opacity-100'}
          origin-left`}
      >
        <Input
          className="rounded-3xl h-10 pl-11 shadow-none w-full bg-transparent"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim() && friendsSearchResults.length > 0) setShowDropdown(true);
          }}
        />

        {showDropdown && (
          <div className="absolute mt-2 w-full z-10">
            {query && friendsSearchResults.length === 0 && (
              <div className="text-sm text-popover-foreground bg-popover shadow rounded p-2">
                No users found.
              </div>
            )}

            {friendsSearchResults.length > 0 && (
              <ul className="absolute overflow-auto bg-card text-popover-foreground shadow rounded-sm max-h-48 w-full">
                {friendsSearchResults.map((member: IMember) => (
                  <li key={member._id} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-[var(--accent)] ">
                    <Link
                      to={`/members/${member.username}`}
                      className="flex items-center gap-2 w-full"
                    >
                      <img
                        src={member.photo?.url || 'https://ik.imagekit.io/LHR/user-octagon-svgrepo-com.svg'}
                        alt={member.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{member.username}</span>
                        <span className="text-sm text-gray-500">
                          {member.firstName} {member.lastName}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
                <li
                  className="flex items-center gap-2 justify-center p-2 hover:bg-gray-100 cursor-pointer border-t"
                  onClick={handleSeeAll}
                >
                  <IoSearch className="text-lg text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">
                    See more results for "{query}"
                  </span>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Button mode overlay */}
      {isCollapsed && (
        <button
          onClick={handleButtonClick}
          className="absolute left-0 flex items-center justify-center h-10 w-10 rounded-full hover:opacity-90 transition-all z-30"
        >
        </button>
      )}
    </div>
  );

}
