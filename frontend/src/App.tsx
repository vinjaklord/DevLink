import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Remove BrowserRouter import
import useStore from './hooks/useStore';
import Header from './Components/Header/Header';
import { Signup } from './Components/SignUp/Signup';
import { LoginPage } from './Components/pages/Login/LoginPage';
import './App.css';
import { Toaster } from 'sonner';
import Feed from './Components/pages/MainFeed/Feed';
import AddPost from './Components/AddPost/AddPost';
import EditProfile from './Components/Profile/EditProfile';
import ChangePassword from './Components/Profile/ChangePassword';
import { Post } from './Components/Feed/MainFeed/Post';
import Profile from './Components/Profile/Profile';
import MessagePage from './Components/MessagePage/MessagePage';
import MemberProfile from './Components/Profile/MemberProfile';
import { ResetPassword } from './Components/ForgotPassword/ResetPassword';
import { SetNewPassword } from './Components/ForgotPassword/SetNewPassword';
import SharePost from './Components/Feed/MainFeed/SharePost';
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
        <Route path="/" element={<Feed />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/posts/:id" element={<Post />} />
        <Route path="/members/:username" element={<MemberProfile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<MessagePage />} />
        <Route path="/results" element={<SearchResults />} />
        {/* <Route path="/post" element={<Post />} /> */}
      </Routes>
      <AddPost isOpen={showAddPost} onClose={() => setShowAddPost(false)} />
      <SharePost
        isOpen={showSharePost}
        onClose={() => {
          setShowSharePost(false);
        }}
      />
    </>
  );

  // Define routes for users who are not logged in
  const routerNotLoggedIn = (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/set-new-password" element={<SetNewPassword />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
      {/* Add other routes as needed */}
      {/* <Route path="/" element={<Feed />} /> */}
      {/* <Route path="/news" element={<NewsPage />} /> */}
      {/* <Route path="/calendar" element={<TablePage />} /> */}
      {/* <Route path="/calculator" element={<CalculatorPage />} /> */}
      {/* <Route path="/calculator/position-size" element={<PositionSizePage />} /> */}
      {/* <Route path="/calculator/currency-converter" element={<CurrencyConverterPage />} /> */}
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
