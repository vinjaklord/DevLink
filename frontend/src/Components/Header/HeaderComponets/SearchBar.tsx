//React
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoSearch } from 'react-icons/io5';

//Hooks
import { useStore } from '@/hooks';
import { useOutsideClick } from '@/hooks';
import { useWindowWidth } from '@/hooks';

//Models
import type { IMember } from '@/models/member.model.ts';

//3rd lib
import { Input } from '@/Components/ui';

interface SearchBarProps {
  buttonMode?: boolean;
  collapseThreshold?: number;
}

export default function SearchBar({
  buttonMode = false,
  collapseThreshold = 1100,
}: SearchBarProps) {
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

    sessionStorage.setItem('searchQuery', query);


    navigate(`/results?query=${encodeURIComponent(query)}`);
    setShowDropdown(false);
  };

  const handleButtonClick = () => {
    navigate('/results');
  };

  return (
    <div ref={containerRef} className="relative flex items-center min-w-[150px] max-w-[270px]">
      {/* Search icon */}
      <IoSearch className="search-icon absolute left-3 top-2 text-2xl z-20 text-gray-400" />

      {/* Search drawer */}
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
          <div className="absolute mt-2 w-full z-10 bg-card shadow rounded-sm overflow-hidden">
            {/* Scrollable results */}
            <div className="max-h-48 overflow-auto">
              {query && friendsSearchResults.length === 0 && (
                <div className="text-sm text-popover-foreground bg-popover p-2">
                  No users found.
                </div>
              )}

              {friendsSearchResults.length > 0 &&
                friendsSearchResults.map((member: IMember) => (
                  <li
                    key={member._id}
                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-[var(--accent)]"
                  >
                    <Link
                      to={`/members/${member.username}`}
                      className="flex items-center gap-2 w-full truncate"
                    >
                      <img
                        src={`${member?.photo?.url}?tr=w-128,h-128,cm-round,cq-95,sh-20,q-95,f-auto`}
                        alt={member.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-medium truncate max-w-[150px]">
                          {member.username}
                        </span>
                        <span className="text-sm text-gray-500 truncate max-w-[150px]">
                          {member.firstName} {member.lastName}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
            </div>

            {/* Always-visible "See all" button */}
            {query && (
              <div
                className="flex items-center gap-2 justify-center p-2 hover:bg-gray-100 cursor-pointer border-t sticky bottom-0"
                onClick={handleSeeAll}
              >
                <IoSearch className="text-lg text-blue-600" />
                <span className="text-sm text-blue-600 font-medium truncate max-w-[150px]">
                  "{query}"
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Button mode */}
      {isCollapsed && (
        <button
          onClick={handleButtonClick}
          className="absolute left-0 flex items-center justify-center h-10 w-10 rounded-full hover:opacity-90 transition-all z-30"
        />
      )}
    </div>
  );
}
