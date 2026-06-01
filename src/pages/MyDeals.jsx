import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  Package, 
  ShoppingBag,
  Search, 
  Users, 
  TrendingUp, 
  Share2,
  MoreVertical,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ShareDealModal from '../components/ShareDealModal';
import './MyDeals.css';

const MY_DEALS = []; // Keep for reference if needed

function MyDeals() {
  const [activeTab, setActiveTab] = useState('all'); 
  const [roleTab, setRoleTab] = useState('all'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    dealsJoined: 0,
    totalSaved: 0,
    activeGroups: 0
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserDeals();
    }
  }, [user]);

  const fetchUserDeals = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Deals Joined by User
      const { data: joinedData, error: joinedError } = await supabase
        .from('group_members')
        .select('*, deals(*, group_members(user_id))')
        .eq('user_id', user.id);

      if (joinedError) throw joinedError;

      const formattedJoined = joinedData
        .filter(item => item.deals !== null)
        .map(item => {
          const deal = item.deals;
          const joinedCount = deal.group_members ? deal.group_members.length : 0;
          return {
            ...deal,
            role: 'joined',
            joinedCount,
            totalRequired: deal.required_members || 5,
            store: deal.store_name,
            image: deal.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
            price: deal.original_price ? `₹${(deal.original_price * (1 - (deal.discount_percent || 0)/100)).toLocaleString()}` : 'Free'
          };
        });

      // 2. Fetch Deals Posted by User
      const { data: postedData, error: postedError } = await supabase
        .from('deals')
        .select('*, group_members(user_id)')
        .eq('creator_id', user.id);

      if (postedError) throw postedError;

      const formattedPosted = postedData.map(deal => {
        const joinedCount = deal.group_members ? deal.group_members.length : 0;
        return {
          ...deal,
          role: 'posted',
          joinedCount,
          totalRequired: deal.required_members || 5,
          store: deal.store_name,
          image: deal.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
          price: deal.original_price ? `₹${(deal.original_price * (1 - (deal.discount_percent || 0)/100)).toLocaleString()}` : 'Free'
        };
      });

      const allDeals = [...formattedJoined, ...formattedPosted];
      
      // Calculate dynamic stats
      const totalSaved = allDeals
        .filter(d => d.status === 'completed')
        .reduce((sum, d) => sum + (parseFloat(d.original_price || 0) * (parseInt(d.discount_percent || 0) / 100)), 0);

      const activeGroups = allDeals
        .filter(d => d.status === 'active')
        .length;

      setStats({
        dealsJoined: formattedJoined.length,
        totalSaved,
        activeGroups
      });

      setDeals(allDeals);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };


  const filteredDeals = deals.filter(deal => {
    const statusMatch = activeTab === 'all' || deal.status === activeTab;
    const roleMatch = roleTab === 'all' || deal.role === roleTab;
    return statusMatch && roleMatch;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="main-content my-deals-main">
        <header className="content-header">
          <div>
            <h1 className="page-title">My Deals</h1>
            <p className="page-subtitle">Track your joined groups and active deal posts</p>
          </div>
          <button 
            className="btn-primary share-deal-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} />
            Post a New Deal
          </button>
        </header>

        {/* Quick Stats */}
        <div className="quick-stats-row">
          <div className="stat-box-mini">
            <div className="stat-icon-bg blue">
              <ShoppingBag size={18} />
            </div>
            <div className="stat-content-mini">
              <span className="stat-val-mini">{stats.dealsJoined}</span>
              <span className="stat-label-mini">Deals Joined</span>
            </div>
          </div>
          <div className="stat-box-mini">
            <div className="stat-icon-bg green">
              <TrendingUp size={18} />
            </div>
            <div className="stat-content-mini">
              <span className="stat-val-mini">₹{stats.totalSaved.toLocaleString()}</span>
              <span className="stat-label-mini">Total Saved</span>
            </div>
          </div>
          <div className="stat-box-mini">
            <div className="stat-icon-bg orange">
              <Users size={18} />
            </div>
            <div className="stat-content-mini">
              <span className="stat-val-mini">{stats.activeGroups}</span>
              <span className="stat-label-mini">Active Groups</span>
            </div>
          </div>
        </div>


        {/* Filters & Tabs */}
        <div className="my-deals-filters">
          <div className="filter-tabs-group">
            <button 
              className={`filter-tab-pill ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Deals
            </button>
            <button 
              className={`filter-tab-pill ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active
            </button>
            <button 
              className={`filter-tab-pill ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed
            </button>
          </div>

          <div className="role-switcher">
            <button 
              className={`role-btn ${roleTab === 'all' ? 'active' : ''}`}
              onClick={() => setRoleTab('all')}
            >
              Everyone
            </button>
            <button 
              className={`role-btn ${roleTab === 'joined' ? 'active' : ''}`}
              onClick={() => setRoleTab('joined')}
            >
              Joined
            </button>
            <button 
              className={`role-btn ${roleTab === 'posted' ? 'active' : ''}`}
              onClick={() => setRoleTab('posted')}
            >
              Posted
            </button>
          </div>
        </div>

        {filteredDeals.length > 0 ? (
          <div className="my-deals-list">
            {filteredDeals.map((deal) => {
              const progressPercent = (deal.joinedCount / deal.totalRequired) * 100;
              return (
                <div key={deal.id} className="my-deal-row-card">
                  <div className="my-deal-image-wrap">
                    <img src={deal.image} alt={deal.title} />
                    <span className={`role-badge ${deal.role}`}>{deal.role}</span>
                  </div>
                  
                  <div className="my-deal-main-info">
                    <div className="my-deal-header">
                      <span className="store-tag-mini">{deal.store}</span>
                      <h3 onClick={() => navigate(`/deal/${deal.id}`)}>{deal.title}</h3>
                    </div>
                    
                    <div className="my-deal-progress-wrap">
                      <div className="progress-bar-container-mini">
                        <div className="progress-bar-fill-mini" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                      <div className="progress-info-mini">
                        <span>{deal.joinedCount}/{deal.totalRequired} Joined</span>
                        <span className="progress-status-text">
                          {deal.status === 'completed' ? 'Group Full' : `${deal.totalRequired - deal.joinedCount} more needed`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="my-deal-side-info">
                    <div className="price-tag-large">{deal.price}</div>
                    <div className={`status-tag-row ${deal.status}`}>
                      {deal.status === 'completed' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      <span>{deal.status}</span>
                    </div>
                  </div>

                  <div className="my-deal-actions">
                    <button className="btn-icon-round" title="Share">
                      <Share2 size={18} />
                    </button>
                    <button className="btn-icon-round" title="More">
                      <MoreVertical size={18} />
                    </button>
                    <button 
                      className="btn-view-status"
                      onClick={() => navigate(`/deal/${deal.id}`)}
                    >
                      Track
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state-v2">
            <div className="empty-state-illustration">
              <Package size={64} className="box-icon" />
              <div className="empty-circles"></div>
            </div>
            <h2>No deals found</h2>
            <p>You haven't {roleTab === 'posted' ? 'posted' : 'joined'} any {activeTab === 'all' ? '' : activeTab} deals yet. Explore the dashboard to find great bargains!</p>
            <button className="btn-primary-large" onClick={() => navigate('/dashboard')}>
              Browse Deals
            </button>
          </div>
        )}
      </main>

      <ShareDealModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

export default MyDeals;
