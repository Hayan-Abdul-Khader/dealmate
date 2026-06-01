import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Award, 
  ShoppingBag, 
  Users, 
  TrendingUp,
  Star,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import './UserProfile.css';

const MOCK_USER = {
  name: 'Priya Sharma',
  username: 'priya_deals',
  avatar: 'PS',
  bio: 'Passionate bargain hunter and tech enthusiast. I love finding the best group deals for Apple products and smart home gadgets!',
  location: 'Mumbai, India',
  joinedDate: 'October 2023',
  stats: {
    dealsShared: 12,
    groupsJoined: 48,
    moneySaved: '₹45,200'
  },
  badges: [
    { name: 'Top Sharer', icon: <TrendingUp size={16} />, color: '#dbeafe' },
    { name: 'Verified Buyer', icon: <Star size={16} />, color: '#fef2f2' },
    { name: 'Community Hero', icon: <MessageSquare size={16} />, color: '#f0fdf4' }
  ],
  activeDeals: [
    {
      id: 1,
      title: 'MacBook Pro 16" M3 Pro',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
      progress: 80,
      joinedCount: 4,
      totalRequired: 5
    },
    {
      id: 2,
      title: 'Sony WH-1000XM5',
      image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800',
      progress: 50,
      joinedCount: 1,
      totalRequired: 2
    }
  ]
};

function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  
  // In a real app, fetch user by username
  const user = MOCK_USER;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <main className="main-content profile-main">
        <header className="profile-header-banner">
          <button className="btn-back-profile" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
        </header>

        <div className="profile-content-wrapper">
          {/* Profile Card */}
          <div className="profile-info-card">
            <div className="profile-avatar-xl">{user.avatar}</div>
            <div className="profile-main-info">
              <h1>{user.name}</h1>
              <span className="username-tag">@{user.username}</span>
              <p className="profile-bio">{user.bio}</p>
              
              <div className="profile-meta-row">
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>{user.location}</span>
                </div>
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>Joined {user.joinedDate}</span>
                </div>
              </div>

              <div className="profile-badges">
                {user.badges.map((badge, index) => (
                  <div key={index} className="badge-pill" style={{ backgroundColor: badge.color }}>
                    {badge.icon}
                    <span>{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="profile-stats-grid">
              <div className="stat-card">
                <span className="stat-value">{user.stats.dealsShared}</span>
                <span className="stat-label">Deals Shared</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{user.stats.groupsJoined}</span>
                <span className="stat-label">Groups Joined</span>
              </div>
              <div className="stat-card highlight">
                <span className="stat-value">{user.stats.moneySaved}</span>
                <span className="stat-label">Total Saved</span>
              </div>
            </div>
          </div>

          {/* User Activity Tabs */}
          <div className="profile-tabs-section">
            <div className="profile-tabs-header">
              <button className="profile-tab active">Active Deals</button>
              <button className="profile-tab">Past Deals</button>
              <button className="profile-tab">Saved</button>
            </div>

            <div className="profile-deals-grid">
              {user.activeDeals.map((deal) => (
                <div key={deal.id} className="profile-deal-mini-card" onClick={() => navigate(`/deal/${deal.id}`)}>
                  <img src={deal.image} alt={deal.title} />
                  <div className="mini-deal-info">
                    <h3>{deal.title}</h3>
                    <div className="mini-progress-bar">
                      <div className="mini-progress-fill" style={{ width: `${deal.progress}%` }}></div>
                    </div>
                    <span className="mini-stats-text">{deal.joinedCount}/{deal.totalRequired} Joined</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserProfile;
