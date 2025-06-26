import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom'; // Remove BrowserRouter import
import useStore from './hooks/useStore';
import Header from './Components/Header/Header';
import { Signup } from './Components/SignUp/Signup';
import { Login } from './Components/Login/Login';
import './App.css';
import { Toaster } from 'sonner';
import Feed from './Components/Feed/Feed';
import AddPost from './Components/AddPost/AddPost';

function App() {
  const { loggedInMember, memberCheck, showAddPost, setShowAddPost } = useStore(
    (state) => state
  );

  // Check if the user is logged in on every page load
  useEffect(() => {
    memberCheck();
  }, [memberCheck]);

  // Define routes for logged-in users
  const routerLoggedIn = (
    <>
      <Routes>
        {/* Add your routes here when ready */}
        <Route path="/" element={<Feed />} />
        {/* <Route path="/post" element={<Post />} /> */}
      </Routes>
      <AddPost isOpen={showAddPost} onClose={() => setShowAddPost(false)} />
    </>
  );

  // Define routes for users who are not logged in
  const routerNotLoggedIn = (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      {/* Add other routes as needed */}
      <Route path="/" element={<Feed />} />
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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto px-6 pt-32 flex-grow">{routes}</main>
      <Toaster richColors position="bottom-left" />
    </div>
  );
}

export default App;
