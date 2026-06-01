import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Shirt,
  Home,
  ShoppingBag,
  Tag,
  Sparkles,
  Clock,
  ArrowRight,
  Copy,
  Check,
  Grid
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ShareDealModal from '../components/ShareDealModal';
import './Dashboard.css';

const CATEGORIES = [
  { name: 'All', icon: <Grid size={18} /> },
  { name: 'Electronics', icon: <Smartphone size={18} /> },
  { name: 'Fashion', icon: <Shirt size={18} /> },
  { name: 'Home', icon: <Home size={18} /> },
  { name: 'Groceries', icon: <ShoppingBag size={18} /> }
];

const PROMO_CODES = [
  { id: 1, store: 'Amazon', code: 'AMZTECH15', discount: '15% OFF Electronics', desc: 'Min. spend ₹5,000' },
  { id: 2, store: 'Flipkart', code: 'FKFEST20', discount: '20% OFF Clothing', desc: 'No min. spend' },
  { id: 3, store: 'Costco', code: 'COSTBUY50', discount: '₹500 OFF Groceries', desc: 'On select bulk packages' }
];

const FALLBACK_DEALS = [
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
    description: 'Get the latest iPhone 15 Pro with Aerospace-grade titanium design and A17 Pro chip.',
    offerText: 'Get the latest iPhone 15 Pro with titanium...',
    joinedCount: 4,
    totalRequired: 5,
    status: 'active'
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
    description: 'Nike Air Max Pulse pulls inspiration from the London music scene, bringing an underground touch.',
    offerText: 'Nike Air Max Pulse pulls inspiration...',
    joinedCount: 2,
    totalRequired: 4,
    status: 'active'
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
    description: 'High-back mesh ergonomic office chair with adjustable headrest, armrests, and dynamic lumbar support.',
    offerText: 'High-back mesh ergonomic office chair...',
    joinedCount: 1,
    totalRequired: 3,
    status: 'active'
  }
];

function Dashboard() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const bannerTimer = useRef(null);

  useEffect(() => {
    fetchDeals();
    return () => clearInterval(bannerTimer.current);
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select('*, group_members(user_id)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedDeals = data.map(deal => {
          const joinedCount = deal.group_members ? deal.group_members.length : 0;
          return {
            ...deal,
            store: deal.store_name,
            image: deal.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
            offerText: deal.description ? (deal.description.substring(0, 50) + (deal.description.length > 50 ? '...' : '')) : '',
            joinedCount: joinedCount,
            totalRequired: deal.required_members || 5,
            badge: deal.discount_percent ? `${deal.discount_percent}% Off` : null
          };
        });
        setDeals(formattedDeals);
      } else {
        setDeals(FALLBACK_DEALS);
      }
    } catch (err) {
      console.log('Using fallback data:', err.message);
      setDeals(FALLBACK_DEALS);
    } finally {
      setLoading(false);
    }
  };

  // Start Carousel autoplay
  useEffect(() => {
    const bannerCount = featuredBannerDeals.length;
    if (bannerCount > 1) {
      clearInterval(bannerTimer.current);
      bannerTimer.current = setInterval(() => {
        setCurrentBannerIndex(prev => (prev + 1) % bannerCount);
      }, 6000);
    }
    return () => clearInterval(bannerTimer.current);
  }, [deals]);

  const featuredBannerDeals = deals
    .filter(d => d.discount_percent && d.status === 'active')
    .sort((a, b) => b.discount_percent - a.discount_percent)
    .slice(0, 3);

  // If no deals found matching category sorting, use active category mapping
  const filteredDeals = deals.filter(deal => {
    const matchesCategory = activeCategory === 'All' || 
      (deal.category && deal.category.toLowerCase().includes(activeCategory.toLowerCase()));
    
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deal.store_name && deal.store_name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const nextBanner = () => {
    setCurrentBannerIndex(prev => (prev + 1) % featuredBannerDeals.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex(prev => (prev - 1 + featuredBannerDeals.length) % featuredBannerDeals.length);
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter recommendations: active deals close to filling (e.g. 1 space left or high ratio)
  const recommendations = deals
    .filter(d => d.status === 'active' && d.joinedCount < d.totalRequired && d.joinedCount > 0)
    .sort((a, b) => (b.joinedCount / b.totalRequired) - (a.joinedCount / a.totalRequired))
    .slice(0, 2);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="main-content dashboard-main">
        {/* Top Header */}
        <header className="dashboard-top-header">
          <div className="dashboard-header-content">
            <h1>Discover Deals</h1>
            <div className="dashboard-subtitle-row">
              <p className="dashboard-page-subtitle">Join group buys or start a new group buy to save together</p>
              <button 
                className="btn-primary share-deal-header-btn"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus size={16} />
                Share a New Deal
              </button>
            </div>
          </div>
        </header>

        {/* Banner Section */}
        {featuredBannerDeals.length > 0 && (
          <section className="featured-banner-section">
            <div className="banner-slider">
              {featuredBannerDeals.map((deal, idx) => (
                <div 
                  key={deal.id} 
                  className={`banner-slide ${idx === currentBannerIndex ? 'active' : ''}`}
                  style={{ backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.9) 30%, rgba(15, 23, 42, 0.4) 100%), url(${deal.image})` }}
                >
                  <div className="banner-content">
                    <span className="banner-badge">
                      <Sparkles size={14} />
                      HOT GROUP BUY
                    </span>
                    <h1>{deal.title}</h1>
                    <p className="banner-desc">{deal.description || 'Join this group buy now and unlock wholesale rates!'}</p>
                    
                    <div className="banner-price-info">
                      <div className="price-item">
                        <span className="price-lbl">Original</span>
                        <span className="price-val original">₹{deal.original_price?.toLocaleString()}</span>
                      </div>
                      <div className="price-item highlighted">
                        <span className="price-lbl">Group Price</span>
                        <span className="price-val discount">
                          ₹{Math.round(deal.original_price * (1 - (deal.discount_percent || 0) / 100)).toLocaleString()}
                        </span>
                      </div>
                      <div className="banner-save-pill">
                        Save {deal.discount_percent}%
                      </div>
                    </div>

                    <div className="banner-footer">
                      <div className="banner-joined">
                        <div className="joined-dots">
                          {[...Array(Math.min(deal.joinedCount, 4))].map((_, i) => (
                            <span key={i} className="dot-avatar" style={{ left: `${i * 12}px` }}>
                              {String.fromCharCode(65 + i)}
                            </span>
                          ))}
                          <span className="joined-lbl" style={{ paddingLeft: `${Math.min(deal.joinedCount, 4) * 12 + 10}px` }}>
                            {deal.joinedCount} active members joined
                          </span>
                        </div>
                      </div>
                      <button className="btn-banner-action" onClick={() => navigate(`/deal/${deal.id}`)}>
                        View Lobby Room
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {featuredBannerDeals.length > 1 && (
              <>
                <button className="banner-arrow prev" onClick={prevBanner}>
                  <ChevronLeft size={24} />
                </button>
                <button className="banner-arrow next" onClick={nextBanner}>
                  <ChevronRight size={24} />
                </button>
                <div className="banner-dots-indicators">
                  {featuredBannerDeals.map((_, idx) => (
                    <span 
                      key={idx} 
                      className={`banner-indicator-dot ${idx === currentBannerIndex ? 'active' : ''}`}
                      onClick={() => setCurrentBannerIndex(idx)}
                    ></span>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* Categories Bar */}
        <section className="categories-bubble-section">
          <div className="section-header-row">
            <h2>Browse Categories</h2>
          </div>
          <div className="categories-bubble-container">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat.name} 
                className={`category-bubble-pill ${activeCategory === cat.name ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.name)}
              >
                <div className="category-bubble-icon">
                  {cat.icon}
                </div>
                <span className="category-bubble-lbl">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Dashboard 2-Column Content */}
        <div className="dashboard-content-layout">
          {/* Left Column: Curated Deals List */}
          <div className="dashboard-deals-col">
            <div className="section-header-row search-header-row">
              <h2 className="section-title-main">
                {activeCategory === 'All' ? 'Curated Deals' : `${activeCategory} Deals`}
                {searchQuery && ` (Matching "${searchQuery}")`}
              </h2>
              <div className="dashboard-search-bar">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Filter deals..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredDeals.length > 0 ? (
              <div className="dashboard-deals-list">
                {filteredDeals.map((deal) => {
                  const progressPercent = (deal.joinedCount / deal.totalRequired) * 100;
                  const discountedPrice = Math.round(deal.original_price * (1 - (deal.discount_percent || 0) / 100));
                  return (
                    <div 
                      key={deal.id} 
                      className="dashboard-deal-row-card"
                      onClick={() => navigate(`/deal/${deal.id}`)}
                    >
                      <div className="row-card-img-box">
                        <img src={deal.image} alt={deal.title} />
                        <span className="row-card-store-badge">{deal.store || 'Store'}</span>
                      </div>
                      
                      <div className="row-card-info">
                        <div className="row-card-header">
                          <h3>{deal.title}</h3>
                          {deal.badge && <span className="row-card-discount-badge">{deal.badge}</span>}
                        </div>
                        <p className="row-card-desc">{deal.description || 'No description provided.'}</p>
                        
                        <div className="row-card-footer">
                          <div className="row-card-prices">
                            <span className="row-card-price">₹{discountedPrice.toLocaleString()}</span>
                            <span className="row-card-price-original">₹{deal.original_price?.toLocaleString()}</span>
                          </div>
                          
                          <div className="row-card-progress">
                            <div className="progress-stats">
                              <span className="joined-text">{deal.joinedCount}/{deal.totalRequired} Joined</span>
                              <span className="percent-text">{Math.round(progressPercent)}%</span>
                            </div>
                            <div className="progress-bar-bg">
                              <div 
                                className={`progress-bar-fill ${deal.status === 'completed' ? 'completed' : ''}`} 
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                          </div>

                          <button className={`row-card-btn ${deal.status === 'completed' ? 'completed' : ''}`}>
                            {deal.status === 'completed' ? 'View Details' : 'Join Room'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <p>No deals found matching your criteria.</p>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar Widgets */}
          <aside className="dashboard-sidebar-col">
            {/* Quick Action Button */}
            <button 
              className="btn-primary share-deal-sidebar-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} />
              Share a New Deal
            </button>

            {/* Active Recs Widget */}
            {recommendations.length > 0 && (
              <div className="sidebar-widget recs-widget">
                <h3>Lobbies Filling Fast</h3>
                <div className="recs-list">
                  {recommendations.map(rec => {
                    const ratio = Math.round((rec.joinedCount / rec.totalRequired) * 100);
                    return (
                      <div key={rec.id} className="rec-mini-card" onClick={() => navigate(`/deal/${rec.id}`)}>
                        <img src={rec.image} alt={rec.title} />
                        <div className="rec-mini-info">
                          <h4>{rec.title}</h4>
                          <div className="rec-mini-meta">
                            <span className="rec-store">{rec.store_name || rec.store}</span>
                            <span className="rec-ratio text-orange">{ratio}% full</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Promo Coupons Widget */}
            <div className="sidebar-widget coupons-widget">
              <h3>
                <Tag size={16} className="coupon-header-icon" />
                Store Promo Codes
              </h3>
              <p className="widget-subtitle">Copy and apply these codes to complete your group orders.</p>
              <div className="coupons-list">
                {PROMO_CODES.map(coupon => (
                  <div key={coupon.id} className="coupon-code-card">
                    <div className="coupon-left">
                      <span className="coupon-store-tag">{coupon.store}</span>
                      <span className="coupon-discount">{coupon.discount}</span>
                      <span className="coupon-desc">{coupon.desc}</span>
                    </div>
                    <button 
                      className={`btn-copy-coupon ${copiedId === coupon.id ? 'copied' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCode(coupon.code, coupon.id);
                      }}
                    >
                      {copiedId === coupon.id ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedId === coupon.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <ShareDealModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

export default Dashboard;
