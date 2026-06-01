import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, ArrowRight, TrendingUp, Filter, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import './Categories.css';

const CATEGORY_LIST = [
  { id: 1, name: 'Tech', value: 'tech', icon: '💻', bg: '#DBEAFE', color: '#2563eb' },
  { id: 2, name: 'Fashion', value: 'fashion', icon: '👗', bg: '#FCE7F3', color: '#db2777' },
  { id: 3, name: 'Home', value: 'home', icon: '🏠', bg: '#DCFCE7', color: '#059669' },
  { id: 4, name: 'Beauty', value: 'beauty', icon: '💄', bg: '#F3E8FF', color: '#7c3aed' },
  { id: 5, name: 'Sports', value: 'sports', icon: '⚽', bg: '#FFEDD5', color: '#d97706' },
  { id: 6, name: 'Books', value: 'books', icon: '📚', bg: '#FEF08A', color: '#a16207' },
  { id: 7, name: 'Food', value: 'food', icon: '🍕', bg: '#FEE2E2', color: '#dc2626' },
];

function Categories() {
  const [selectedCat, setSelectedCat] = useState('Tech');
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByPrice, setSortByPrice] = useState(false);
  const [sortByNewest, setSortByNewest] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      setDeals(data || []);
    } catch (err) {
      console.error('Error fetching deals:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryCount = (categoryValue) => {
    return deals.filter(deal => deal.category && deal.category.toLowerCase() === categoryValue).length;
  };

  const filteredDeals = deals.filter(deal => {
    const matchesCategory = deal.category && deal.category.toLowerCase() === selectedCat.toLowerCase();
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (deal.store_name && deal.store_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  let sortedDeals = [...filteredDeals];
  if (sortByPrice) {
    sortedDeals.sort((a, b) => {
      const priceA = a.original_price * (1 - (a.discount_percent || 0) / 100);
      const priceB = b.original_price * (1 - (b.discount_percent || 0) / 100);
      return priceA - priceB;
    });
  } else if (sortByNewest) {
    sortedDeals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="main-content categories-main">
        <header className="content-header">
          <div>
            <h1 className="categories-title">
              <Tag className="tag-icon" size={28} />
              Explore Categories
            </h1>
            <p className="page-subtitle">Find the best group deals tailored to your interests</p>
          </div>
          <div className="category-search">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search deals..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {/* Categories Horizontal Scroll */}
        <div className="categories-scroll-wrapper">
          <div className="categories-list-horizontal">
            {CATEGORY_LIST.map(category => {
              const count = getCategoryCount(category.value);
              return (
                <button 
                  key={category.id} 
                  className={`cat-pill ${selectedCat === category.name ? 'active' : ''}`}
                  style={{ '--cat-bg': category.bg, '--cat-color': category.color }}
                  onClick={() => setSelectedCat(category.name)}
                >
                  <span className="cat-pill-icon">{category.icon}</span>
                  <span className="cat-pill-name">{category.name}</span>
                  <span className="cat-pill-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="category-content-grid">
          {/* Main Focused Category */}
          <section className="focused-category-section">
            <div className="focused-header">
              <div className="focused-title-group">
                <TrendingUp size={20} className="trending-icon-cat" />
                <h2>Trending in {selectedCat}</h2>
              </div>
            </div>

            <div className="cat-deals-grid">
              {loading ? (
                <div className="cat-loading-state">
                  <p>Loading active deals...</p>
                </div>
              ) : sortedDeals.length > 0 ? (
                sortedDeals.map(deal => {
                  const discountedPrice = Math.round(deal.original_price * (1 - (deal.discount_percent || 0) / 100));
                  return (
                    <div 
                      key={deal.id} 
                      className="cat-deal-card"
                      onClick={() => navigate(`/deal/${deal.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="cat-deal-image">
                        <img src={deal.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'} alt={deal.title} />
                        {deal.discount_percent && (
                          <span className="cat-deal-discount">{deal.discount_percent}% Off</span>
                        )}
                      </div>
                      <div className="cat-deal-info">
                        <h3>{deal.title}</h3>
                        <p className="cat-deal-price">₹{discountedPrice.toLocaleString()}</p>
                        <button className="btn-join-sm">Join Group</button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="cat-empty-state">
                  <div className="cat-empty-icon">🏷️</div>
                  <p>No active deals in {selectedCat} matching your criteria right now.</p>
                </div>
              )}
            </div>
          </section>

          {/* Sub-Categories / Filters */}
          <aside className="category-sidebar">
            <div className="sidebar-box">
              <div className="box-header">
                <Filter size={18} />
                <h3>Refine {selectedCat}</h3>
              </div>
              <div className="sub-cat-list">
                <label className="sub-cat-item">
                  <input 
                    type="checkbox" 
                    checked={!sortByPrice && !sortByNewest} 
                    onChange={() => {
                      setSortByPrice(false);
                      setSortByNewest(false);
                    }} 
                  />
                  <span>All {selectedCat}</span>
                </label>
                <label className="sub-cat-item">
                  <input 
                    type="checkbox" 
                    checked={sortByPrice} 
                    onChange={(e) => {
                      setSortByPrice(e.target.checked);
                      if (e.target.checked) setSortByNewest(false);
                    }} 
                  />
                  <span>Price: Low to High</span>
                </label>
                <label className="sub-cat-item">
                  <input 
                    type="checkbox" 
                    checked={sortByNewest} 
                    onChange={(e) => {
                      setSortByNewest(e.target.checked);
                      if (e.target.checked) setSortByPrice(false);
                    }} 
                  />
                  <span>Newest Arrivals</span>
                </label>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Categories;
