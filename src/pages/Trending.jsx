import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Flame, TrendingUp, Plus, MessageSquare, Eye, Users, ChevronRight, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import ShareDealModal from '../components/ShareDealModal';
import './Trending.css';

const FALLBACK_TRENDING_DEALS = [
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
    viewsCount: 2450,
    velocityText: '📈 +180% views this hour',
    likesCount: 142
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
    viewsCount: 1890,
    velocityText: '🔥 8 joins in last 30m',
    likesCount: 98
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
    viewsCount: 940,
    velocityText: '⚡ 40% growth today',
    likesCount: 65
  }
];

const FILTERS = ['All', 'Amazon', 'Flipkart', 'Costco', 'Best Buy', 'Target'];

function Trending() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrendingDeals();
  }, []);

  const fetchTrendingDeals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select('*, group_members(user_id)')
        .eq('status', 'active');

      if (error) throw error;
      
      if (data && data.length > 0) {
        const formatted = data.map((deal, idx) => {
          const joinedCount = deal.group_members ? deal.group_members.length : 0;
          const totalRequired = deal.required_members || 5;
          
          // Generate realistic mock engagement stats based on ID code
          const seed = deal.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const viewsCount = 100 + (seed % 1500);
          const likesCount = Math.round(viewsCount * 0.08);
          
          let velocityText = '📈 Active popularity';
          if (seed % 3 === 0) velocityText = `🔥 ${joinedCount + 2} joins recently`;
          else if (seed % 3 === 1) velocityText = `📈 +${10 + (seed % 90)}% views this hour`;
          else velocityText = `⚡ Rapid savings potential`;

          return {
            ...deal,
            store: deal.store_name,
            image: deal.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
            joinedCount,
            totalRequired,
            completed: joinedCount >= totalRequired,
            badge: deal.discount_percent ? `${deal.discount_percent}% Off` : null,
            viewsCount,
            likesCount,
            velocityText
          };
        });

        // Sort by joined percentage (ratio) or absolute joins to see what's actually "trending"
        const sorted = formatted.sort((a, b) => {
          const ratioA = a.joinedCount / a.totalRequired;
          const ratioB = b.joinedCount / b.totalRequired;
          return ratioB - ratioA; // Higher fill ratio first
        });

        setDeals(sorted);
      } else {
        setDeals(FALLBACK_TRENDING_DEALS);
      }
    } catch (err) {
      console.error('Using fallback trending deals:', err.message);
      setDeals(FALLBACK_TRENDING_DEALS);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeals = deals.filter(deal => {
    let matchesFilter = activeFilter === 'All' || (deal.store_name || deal.store) === activeFilter;
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Unique sparkline path helper
  const generateSparkline = (id) => {
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const points = [];
    for (let i = 0; i <= 6; i++) {
      const x = i * 20; // 0 to 120 width
      // Let's generate a rising line for trending deals
      const y = 30 - (3 + ((seed * (i + 2)) % 22) + (i * 2));
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="main-content trending-main">
        <header className="content-header trending-header-section" style={{ marginBottom: '24px' }}>
          <div>
            <h1 className="trending-page-title">
              <Flame className="fire-icon-main" size={28} />
              Hot 100 Leaderboard
            </h1>
            <p className="page-subtitle">Ranked list of the highest velocity group buys in the community today.</p>
          </div>
          <button 
            className="btn-primary share-deal-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} />
            Share a Deal
          </button>
        </header>

        <div className="search-filter-section trending-search-filter">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search trending leaderboard..." 
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

        {/* Leaderboard Rows List */}
        <div className="leaderboard-list">
          {filteredDeals.map((deal, index) => {
            const rank = index + 1;
            const progressPercent = (deal.joinedCount / deal.totalRequired) * 100;
            const discountedPrice = Math.round(deal.original_price * (1 - (deal.discount_percent || 0) / 100));
            const sparklinePath = generateSparkline(deal.id);

            return (
              <div 
                key={deal.id} 
                className={`leaderboard-row ${rank <= 3 ? `top-rank rank-${rank}` : ''}`}
                onClick={() => navigate(`/deal/${deal.id}`)}
              >
                {/* Rank Badge */}
                <div className="leaderboard-rank-badge">
                  {rank <= 3 ? (
                    <div className="rank-award">
                      <Award size={20} className={`award-icon-${rank}`} />
                      <span>{rank}</span>
                    </div>
                  ) : (
                    <span className="rank-num">#{rank}</span>
                  )}
                </div>

                {/* Product Thumbnail */}
                <div className="leaderboard-thumb">
                  <img src={deal.image_url || deal.image} alt={deal.title} />
                  <span className="leaderboard-store-lbl">{deal.store_name || deal.store}</span>
                </div>

                {/* Main Product Info */}
                <div className="leaderboard-info">
                  <div className="leaderboard-title-row">
                    <h3>{deal.title}</h3>
                    {deal.badge && <span className="leaderboard-discount">{deal.badge}</span>}
                  </div>
                  
                  <div className="leaderboard-meta">
                    <span className="velocity-tag">{deal.velocityText}</span>
                    <span className="engagement-item">
                      <Eye size={12} />
                      {deal.viewsCount} views
                    </span>
                    <span className="engagement-item">
                      <MessageSquare size={12} />
                      {deal.likesCount} discussions
                    </span>
                  </div>
                </div>

                {/* Sparkline Graph */}
                <div className="leaderboard-chart-box">
                  <span className="chart-label">Velocity 24h</span>
                  <svg className="sparkline-svg" viewBox="0 0 120 35">
                    <path 
                      d={sparklinePath} 
                      fill="none" 
                      stroke={rank <= 3 ? "#e11d48" : "#2563eb"} 
                      strokeWidth="2" 
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Price and Progress */}
                <div className="leaderboard-stats-box">
                  <div className="leaderboard-prices">
                    <span className="price-current">₹{discountedPrice.toLocaleString()}</span>
                    <span className="price-prev">₹{deal.original_price?.toLocaleString()}</span>
                  </div>
                  
                  <div className="leaderboard-progress-col">
                    <div className="progress-details-row">
                      <span>{deal.joinedCount}/{deal.totalRequired} Joined</span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className={`progress-bar-fill ${progressPercent >= 100 ? 'completed' : ''}`}
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Navigation Arrow / Join Action */}
                <div className="leaderboard-action-box">
                  <button className="btn-leaderboard-action">
                    <span>Lobby</span>
                    <ChevronRight size={16} />
                  </button>
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

export default Trending;
