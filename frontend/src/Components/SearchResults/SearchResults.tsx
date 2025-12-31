import { Input, Button, Card, CardContent } from '@/Components/ui';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useStore from '../../hooks/useStore.ts';
import { Link } from 'react-router-dom';
import { IoSearch } from 'react-icons/io5';

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const queryParams = searchParams.get('query') || '';
  const navigate = useNavigate();

  const { friendsSearchResults, wideSearchResults, searchMembersFriends, searchMembersWide } =
    useStore((state) => state);

  const [query, setQuery] = useState(queryParams);
  const [showFriends, setShowFriends] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!query) return;
    const debounce = setTimeout(() => {
      searchMembersFriends(query);
      searchMembersWide(query, 10); // initial limited wide search
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, searchMembersFriends, searchMembersWide]);

  // Show more button handler
  const handleShowMore = () => {
    searchMembersWide(query); // fetch full results
    setShowAll(true);
    setShowFriends(false);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    navigate(`/results?query=${encodeURIComponent(query)}`);
  };

  return (
    <div className="p-4 space-y-6 pt-14">
      {/* Top Search Input */}
      <div className="flex justify-center">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative max-w-md w-3xl max-[600px]:w-full">
            <IoSearch className="absolute top-2 left-3 text-2xl" />
            <Input
              className="pl-11 rounded-3xl h-10 w-full shadow-none bg-card"
              placeholder="Find a new Link"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </form>
      </div>
      {/* Friends Card */}
      {showFriends && friendsSearchResults.length > 0 && (
        <Card>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Friends matching "{query}"</h3>
              <Button size="sm" variant="outline" onClick={() => setShowFriends(false)}>
                Hide Test Btn
              </Button>
            </div>
            <ul className="space-y-2">
              {friendsSearchResults.map((friend) => (
                <li key={friend._id} className="flex items-center gap-3">
                  <Link
                    to={`/members/${friend.username}`}
                    className="flex items-center gap-2 w-full"
                  >
                    <img
                      src={`${
                        friend.photo?.url ||
                        'https://ik.imagekit.io/LHR/user-octagon-svgrepo-com.svg'
                      }?tr=w-128,h-128,cm-round,cq-95,sh-20,q-95,f-auto`}
                      alt={friend.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{friend.username}</p>
                      <p className="text-sm text-gray-500">
                        {friend.firstName} {friend.lastName}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Wide Search Card */}
      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">Search results for "{query}"</h3>
          <ul className="space-y-2">
            {(showAll ? wideSearchResults : wideSearchResults.slice(0, 10)).map((m) => (
              <Link to={`/members/${m.username}`} className="flex items-center gap-2 w-full">
                <li key={m._id} className="flex items-center gap-3">
                  <img
                    src={`${
                      m.photo?.url || 'https://ik.imagekit.io/LHR/user-octagon-svgrepo-com.svg'
                    }?tr=w-128,h-128,cm-round,cq-95,sh-20,q-95,f-auto`}
                    alt={m.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{m.username}</p>
                    <p className="text-sm text-gray-500">
                      {m.firstName} {m.lastName}
                    </p>
                  </div>
                </li>
              </Link>
            ))}
          </ul>

          {/* Show More Button */}
          {!showAll && wideSearchResults.length > 10 && (
            <div className="mt-4 text-center">
              <Button onClick={handleShowMore}>Show more</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
