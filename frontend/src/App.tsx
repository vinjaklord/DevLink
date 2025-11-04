//React
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

//3rd lib
import { Toaster } from 'sonner';

//Hooks
import useStore from './hooks/useStore';

//Auth
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { SetNewPasswordPage } from './pages/auth/SetNewPasswordPage';
import { SignupPage } from './pages/auth/SignupPage';
import { LoginPage } from './pages/auth/LoginPage';

//Posts

//Chat
import ChatPage from './pages/chat/ChatPage';

import Header from './Components/Header/Header';
import './App.css';
import FeedPage from './pages/feed/FeedPage';
import AddPostForm from './Components/Posts/AddPostForm';
import EditProfile from './Components/Profile/EditProfile';
import ChangePassword from './Components/Profile/ChangePassword';
import { Post } from './Components/Posts/Post';
import Profile from './Components/Profile/Profile';
import MemberProfile from './Components/Profile/MemberProfile';
import SharePost from './Components/Posts/SharePost';
import FooterNav from './Components/Footer/Footer';
import { SearchResults } from './Components/SearchResults/SearchResults';

function App() {
  const {
    loggedInMember,
    memberCheck,
    showAddPost,
    setShowAddPost,
    showSharePost,
    setShowSharePost,
  } = useStore((state) => state);

  // Check if the user is logged in on every page load
  useEffect(() => {
    // if (loggedInMember) {
    // 1. Run the check immediately on mount
    memberCheck();

    // 2. Set up a timer to run memberCheck periodically
    const intervalId = setInterval(() => {
      // This function executes your token check and logs out if expired
      memberCheck();
    }, 60000);

    // 3. Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
    // }
  }, [memberCheck]);

  // Define routes for logged-in users
  const routerLoggedIn = (
    <>
      <Routes>
        {/* Add your routes here when ready */}
        <Route path="/" element={<FeedPage />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/posts/:id" element={<Post />} />
        <Route path="/members/:username" element={<MemberProfile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<ChatPage />} />
        <Route path="/results" element={<SearchResults />} />
        {/* <Route path="/post" element={<Post />} /> */}
      </Routes>
      <AddPostForm isOpen={showAddPost} onClose={() => setShowAddPost(false)} />
      <SharePost
        isOpen={showSharePost}
        onClose={() => {
          setShowSharePost(false);
        }}
      />
    </>
  );

  const routerNotLoggedIn = (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/set-new-password" element={<SetNewPasswordPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );

  // Select the correct set of routes based on loggedInMember status
  const routes = loggedInMember ? routerLoggedIn : routerNotLoggedIn;

  // TEMPORARY ROUTES

  return (
    <div className="flex flex-col">
      <Header />
      <main className="container mx-auto px-6 pt-10 flex-1 overflow-y-auto max-[1100px]:pb-[60px]">
        {routes}
      </main>
      <FooterNav />
      <Toaster richColors position="bottom-left" />
    </div>
  );
}

export default App;
