import { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { IoSearch } from 'react-icons/io5';
import useStore from '../../hooks/useStore.ts';
import type { IMember } from '@/models/member.model.ts';

export default function SearchBar() {
  const bgColor = 'bg-transparent';
  const [query, setQuery] = useState('');
  const { searchMembers, members, loading } = useStore((state) => state);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.trim()) {
        searchMembers(query);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, searchMembers])

  return (
    <div className="relative flex-1 min-w-[150px] max-w-[270px]">
      <IoSearch className="absolute text-2xl left-3 top-2 text-gray-400 " />
      <Input
        className={`${bgColor} rounded-3xl h-10 pl-11 shadow-none w-full`}
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <div className="absolute mt-2 text-sm text-gray-500">Loading... </div>}
      {!loading && query.length > 0 && members.length === 0 && (
        <div className="absolute mt-2 text-sm text-gray-500 bg-white shadow rounded p-2">
          No users found.
        </div>
      )}
      {members.length > 0 && (
        <ul className='absolute bg-white shadow rounded mt-2 z-10 max-h-48 overflow-auto w-full'>
          {members.map((member: IMember) => (
            <li key={member.id} className='p-2 hover:bg-gray-100'>
              {member.username}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
