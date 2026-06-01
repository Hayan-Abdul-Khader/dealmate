import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Tag, 
  Settings, 
  HelpCircle,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-header sidebar-brand">
          <div className="logo-circle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </div>
          <div className="brand-name">DealMate</div>
        </div>
        <p className="sidebar-subtitle">Group buying platform</p>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list top-nav">
          <Link to="/dashboard" className={`nav-item ${currentPath === '/dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/my-deals" className={`nav-item ${currentPath === '/my-deals' ? 'active' : ''}`}>
            <ShoppingBag size={20} />
            <span>My Deals</span>
          </Link>
          <Link to="/groups" className={`nav-item ${currentPath === '/groups' ? 'active' : ''}`}>
            <Users size={20} />
            <span>Groups</span>
          </Link>
          <Link to="/trending" className={`nav-item ${currentPath === '/trending' ? 'active' : ''}`}>
            <TrendingUp size={20} />
            <span>Trending</span>
          </Link>
          <Link to="/categories" className={`nav-item ${currentPath === '/categories' ? 'active' : ''}`}>
            <Tag size={20} />
            <span>Categories</span>
          </Link>
          <Link to="/notifications" className={`nav-item ${currentPath === '/notifications' ? 'active' : ''}`}>
            <div className="nav-icon-wrapper">
              <Bell size={20} />
              <span className="notification-badge">2</span>
            </div>
            <span>Notifications</span>
          </Link>
        </ul>

        <ul className="nav-list bottom-nav">
          <Link to="/help" className={`nav-item ${currentPath === '/help' ? 'active' : ''}`}>
            <HelpCircle size={20} />
            <span>Help</span>
          </Link>
          <Link to="/settings" className={`nav-item ${currentPath === '/settings' ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{user?.email?.charAt(0).toUpperCase() || 'U'}</div>
          <div className="user-info">
            <div className="user-name">{user?.user_metadata?.full_name || 'User'}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
        <button className="btn-logout-sidebar" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
