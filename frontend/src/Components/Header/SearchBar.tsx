import { useEffect, useRef, useState } from 'react';
import { Input } from '../ui/input';
import { IoSearch } from 'react-icons/io5';
import useStore from '../../hooks/useStore.ts';
import type { IMember } from '@/models/member.model.ts';
import { useOutsideClick } from '@/hooks/useOutsideClick.ts';
import { Link } from 'react-router-dom';

export default function SearchBar() {
  const bgColor = 'bg-transparent';
  const [query, setQuery] = useState('');
  const [showDropdown, setshowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { searchMembers, members, loading } = useStore((state) => state);

  useOutsideClick(containerRef, () => setshowDropdown(false));

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.trim()) {
        searchMembers(query);
        setshowDropdown(true);
      } else {
        setshowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, searchMembers]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 min-w-[150px] max-w-[270px]"
    >
      <IoSearch className="absolute text-2xl left-3 top-2 text-gray-400 " />
      <Input
        className={`${bgColor} rounded-3xl h-10 pl-11 shadow-none w-full`}
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (query.trim() && members.length > 0) {
            setshowDropdown(true);
          }
        }}
      />

      {showDropdown && (
        <div className="absolute mt-2 w-full z-10">
          {loading && (
            <div
              className={`text-sm text-popover-foreground bg-popover shadow rounded p-2`}
            >
              Loading...
            </div>
          )}
          {!loading && query && members.length === 0 && (
            <div className="text-sm text-popover-foreground bg-popover shadow rounded p-2">
              No users found.
            </div>
          )}
          {members.length > 0 && (
            <ul className="absolute overflow-auto bg-popover text-popover-foreground shadow rounded-sm max-h-48 w-full">
              {members.map((member: IMember) => (
                <li key={member._id} className="p-2 hover:bg-gray-100">
                  <Link to={`/members/${member.username}`}>
                    {member.username}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
