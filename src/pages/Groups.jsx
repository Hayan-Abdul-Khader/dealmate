import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronRight, TrendingUp, Plus, Users, Clock, Flame } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import ShareDealModal from '../components/ShareDealModal';
import './Groups.css';

const TICKER_ITEMS = [
  '🔥 Amit K. just joined the Apple iPhone 15 Pro group buy!',
  '⚡ Flipkart Smart TV group is now 80% full - 1 slot remaining!',
  '🎉 Amazon Echo Dot group was successfully completed!',
  '👥 Sanya D. created a new group buy for ergonomic office chairs',
  '💰 Total savings this week: ₹1,24,500!'
];

const FALLBACK_GROUPS = [
  {
    id: 'fb-1',
    title: 'Apple iPhone 15 Pro (128GB) - Blue Titanium',
    store_name: 'Amazon',
    store: 'Amazon',
    category: 'Electronics',
    original_price: 134900,
    discount_percent: 18,
    image_url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=800',
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=800',
    joinedCount: 4,
    totalRequired: 5,
    status: 'active',
    location: 'Delhi NCR',
    group_members: [
      { profiles: { full_name: 'Amit Kumar', email: 'amit@gmail.com' } },
      { profiles: { full_name: 'Sanya Das', email: 'sanya@gmail.com' } },
      { profiles: { full_name: 'Rahul Jain', email: 'rahul@gmail.com' } },
      { profiles: { full_name: 'Pooja Singh', email: 'pooja@gmail.com' } }
    ]
  },
  {
    id: 'fb-2',
    title: 'Nike Air Max Pulse Sneakers',
    store_name: 'Flipkart',
    store: 'Flipkart',
    category: 'Fashion',
    original_price: 12999,
    discount_percent: 35,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    joinedCount: 2,
    totalRequired: 4,
    status: 'active',
    location: 'Mumbai',
    group_members: [
      { profiles: { full_name: 'Hayan Sheikh', email: 'hayan@gmail.com' } },
      { profiles: { full_name: 'Karan Malhotra', email: 'karan@gmail.com' } }
    ]
  },
  {
    id: 'fb-3',
    title: 'Ergonomic Office Desk Chair',
    store_name: 'Costco',
    store: 'Costco',
    category: 'Home',
    original_price: 18500,
    discount_percent: 45,
    image_url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=800',
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=800',
    joinedCount: 1,
    totalRequired: 3,
    status: 'active',
    location: 'Bengaluru',
    group_members: [
      { profiles: { full_name: 'Vikram Seth', email: 'vikram@gmail.com' } }
    ]
  }
];

const FILTERS = ['All', 'Amazon', 'Flipkart', 'Costco', 'Best Buy', 'Target'];

function Groups() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select('*, group_members(user_id, profiles(full_name, email))')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const formatted = data.map(deal => {
          const joinedCount = deal.group_members ? deal.group_members.length : 0;
          const totalRequired = deal.required_members || 5;
          const progressPercent = (joinedCount / totalRequired) * 100;
          
          let statusOutline = 'Active';
          if (progressPercent >= 100) statusOutline = 'Completed';
          else if (progressPercent > 80) statusOutline = 'Almost Full';
          else if (progressPercent > 50) statusOutline = 'Filling Fast';
          
          return {
            ...deal,
            store: deal.store_name,
            image: deal.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
            joinedCount,
            totalRequired,
            completed: joinedCount >= totalRequired,
            statusOutline,
            badge: deal.discount_percent ? `${deal.discount_percent}% Off` : null,
            location: deal.location || 'Online'
          };
        });
        setGroups(formatted);
      } else {
        setGroups(FALLBACK_GROUPS);
      }
    } catch (err) {
      console.error('Using fallback groups:', err.message);
      setGroups(FALLBACK_GROUPS);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(group => {
    let matchesFilter = activeFilter === 'All' || (group.store_name || group.store) === activeFilter;
    const matchesSearch = group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.location && group.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Almost Full': return 'lobby-status-almost-full';
      case 'Filling Fast': return 'lobby-status-filling-fast';
      case 'Completed': return 'lobby-status-completed';
      default: return 'lobby-status-active';
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="main-content groups-main">
        {/* Ticker Row */}
        <section className="live-ticker-container">
          <div className="ticker-label">
            <span className="live-dot"></span>
            LIVE ACTIVITY
          </div>
          <div className="ticker-scroll-window">
            <div className="ticker-scroll-content">
              {TICKER_ITEMS.map((item, index) => (
                <span key={index} className="ticker-item">{item}</span>
              ))}
              {/* Duplicate for infinite loop */}
              {TICKER_ITEMS.map((item, index) => (
                <span key={`dup-${index}`} className="ticker-item">{item}</span>
              ))}
            </div>
          </div>
        </section>

        <header className="content-header lobby-header">
          <div>
            <h1>Lobby Buying Rooms</h1>
            <p className="page-subtitle">Co-purchase items in active multiplayer rooms to unlock wholesale pricing.</p>
          </div>
          <button 
            className="btn-primary share-deal-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} />
            Launch A Group Buy
          </button>
        </header>

        <div className="search-filter-section lobby-search-filter">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by product, store, or city location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filters-container">
            {FILTERS.map((filter) => (
              <button 
                key={filter} 
                className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="lobby-rooms-grid">
          {filteredGroups.map((group) => {
            const joinedCount = group.joinedCount || 0;
            const totalRequired = group.required_members || group.totalRequired || 5;
            const progressPercent = (joinedCount / totalRequired) * 100;
            
            let statusOutline = 'Active';
            if (progressPercent >= 100) statusOutline = 'Completed';
            else if (progressPercent > 80) statusOutline = 'Almost Full';
            else if (progressPercent > 50) statusOutline = 'Filling Fast';

            // Extract profiles for avatar display
            const membersList = group.group_members || [];

            return (
              <div 
                key={group.id} 
                className="lobby-room-card"
                onClick={() => navigate(`/deal/${group.id}`)}
              >
                {/* Image Section */}
                <div className="lobby-card-image-box">
                  <span className="lobby-store-tag">{group.store_name || group.store}</span>
                  {group.badge && <span className="lobby-discount-badge">{group.badge}</span>}
                  <img src={group.image_url || group.image} alt={group.title} />
                  
                  {/* Status Indicator overlay */}
                  <span className={`lobby-status-indicator ${getStatusColorClass(statusOutline)}`}>
                    <span className="status-indicator-dot"></span>
                    {statusOutline}
                  </span>
                </div>

                {/* Content Section */}
                <div className="lobby-card-content">
                  <h3 className="lobby-title">{group.title}</h3>
                  
                  <div className="lobby-meta-row">
                    <div className="lobby-location">
                      <MapPin size={14} />
                      <span>{group.location || 'Online'}</span>
                    </div>
                    {statusOutline === 'Almost Full' && (
                      <div className="lobby-urgency-tag">
                        <Clock size={12} />
                        <span>Hurry!</span>
                      </div>
                    )}
                    {progressPercent > 70 && statusOutline !== 'Completed' && (
                      <div className="lobby-hot-tag">
                        <Flame size={12} fill="currentColor" />
                        <span>Hot</span>
                      </div>
                    )}
                  </div>

                  {/* Overlapping Avatars Section */}
                  <div className="lobby-members-avatar-section">
                    <span className="avatar-section-lbl">LOBBY MEMBERS</span>
                    <div className="lobby-members-row">
                      <div className="lobby-avatar-stack">
                        {membersList.slice(0, 3).map((member, i) => {
                          const name = member.profiles?.full_name || member.profiles?.email || 'User';
                          const initials = getInitials(name);
                          return (
                            <div 
                              key={i} 
                              className="lobby-member-avatar"
                              title={name}
                              style={{ zIndex: 5 - i }}
                            >
                              {initials}
                            </div>
                          );
                        })}
                        {membersList.length > 3 && (
                          <div className="lobby-member-avatar plus-count" style={{ zIndex: 1 }}>
                            +{membersList.length - 3}
                          </div>
                        )}
                        {membersList.length === 0 && (
                          <div className="lobby-member-avatar empty-avatar">
                            ?
                          </div>
                        )}
                      </div>
                      
                      <span className="lobby-members-count-desc">
                        {joinedCount > 0 ? (
                          <>
                            <strong>{joinedCount}</strong> joined this lobby
                          </>
                        ) : (
                          'Be the first to join!'
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Progress section */}
                  <div className="lobby-progress-container">
                    <div className="lobby-progress-stats">
                      <span className="lobby-ratio">{joinedCount} / {totalRequired} slots filled</span>
                      <span className="lobby-percent">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="lobby-progress-bar-bg">
                      <div 
                        className={`lobby-progress-bar-fill ${statusOutline === 'Completed' ? 'completed' : ''}`}
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Button */}
                  {statusOutline === 'Completed' ? (
                    <button className="btn-lobby-completed" onClick={(e) => { e.stopPropagation(); navigate(`/deal/${group.id}`); }}>
                      ✓ Completed Order
                    </button>
                  ) : (
                    <button className="btn-lobby-join">
                      Enter Buying Room
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <ShareDealModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

export default Groups;
