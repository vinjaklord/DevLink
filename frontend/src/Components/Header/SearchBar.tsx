<<<<<<< HEAD
import { Input } from '../ui/input';
import { IoSearch } from 'react-icons/io5';

export default function SearchBar() {
  const bgColor = 'bg-transparent';
  return (
    <div className="relative flex-1 min-w-[150px] max-w-[300px]">
      <IoSearch className="absolute text-2xl left-3 top-2 text-gray-400 " />
      <Input
        className={`${bgColor} rounded-3xl h-10 pl-11 shadow-none w-full`}
        placeholder="Search..."
      />
=======
import { Input } from "../ui/input";
import { IoSearch } from "react-icons/io5";
import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../../hooks/useStore";
import { useDebounce } from "use-debounce"
import type { IMember } from "@/models/member.model";

export default function SearchBar() {
  const bgColor = "bg-transparent";
  const [query, setQuery] = useState<string>('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState<IMember[]>([]);
  const navigate = useNavigate(); //To Navigate to UserProfile

  const { searchMembers, loading } = useStore((state) => state);

  const handleSearch = async (e: ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);

    if (q.length < 2) return setResults([]);

    try {
      const res = await searchMembers(debouncedQuery)
      setResults(res)
    } catch (err) {
      setResults([])
    }
  }

  const handleClick = (memberId: string) => {
    navigate(`/profile/${memberId}`);
    setQuery('');
    setResults([]);
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <IoSearch className="absolute text-2xl left-3 top-2 text-gray-400 " />
        <Input className={`${bgColor} rounded-3xl h-10 pl-11  shadow-none`}
          placeholder="Search User"
          value={query}
          onChange={handleSearch}
          disabled={loading}
        />
      </div>

      {results.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((member) => (
            <li
              key={member.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800"
              onClick={() => handleClick(member.id)}
            >
              {member.firstName} {member.lastName} (@{member.username})
            </li>
          ))}
        </ul>
      )}

>>>>>>> 6d20355e57951d7fc0081343aee732ce15e82fa0
    </div>
  );
}
