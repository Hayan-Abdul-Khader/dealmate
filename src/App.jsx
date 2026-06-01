import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import MyDeals from './pages/MyDeals';
import Groups from './pages/Groups';
import Trending from './pages/Trending';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import DealDetails from './pages/DealDetails';
import DealSuccess from './pages/DealSuccess';
import JoinSuccess from './pages/JoinSuccess';
import Payment from './pages/Payment';
import Notifications from './pages/Notifications';
import SearchResults from './pages/SearchResults';
import Help from './pages/Help';
import UserProfile from './pages/UserProfile';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-deals" element={<MyDeals />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/deal/:id" element={<DealDetails />} />
          <Route path="/deal-success" element={<DealSuccess />} />
          <Route path="/join-success" element={<JoinSuccess />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/help" element={<Help />} />
          <Route path="/profile/:username" element={<UserProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
