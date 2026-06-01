import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, ShoppingBag, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import './SearchResults.css';

const MOCK_ALL_DEALS = [
  {
    id: 1,
    store: 'Amazon',
    title: 'MacBook Pro 16" M3 Pro - Space Black',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    offerText: 'Save 40% for 5 items',
    joinedCount: 3,
    totalRequired: 5,
    category: 'Tech'
  },
  {
    id: 2,
    store: 'Best Buy',
    title: 'Sony WH-1000XM5 Wireless Headphones',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800',
    offerText: 'Buy 1 Get 1 Free when 2 join',
    joinedCount: 2,
    totalRequired: 2,
    category: 'Tech'
  },
  {
    id: 3,
    store: 'Costco',
    title: 'iPhone 15 Pro Max 256GB',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
    offerText: 'Save 25% for 4 items',
    joinedCount: 2,
    totalRequired: 4,
    category: 'Tech'
  },
  {
    id: 4,
    store: 'Target',
    title: 'Nike Air Jordan 1 High Retro',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    offerText: 'Buy 2 Get 3 when 5 join',
    joinedCount: 2,
    totalRequired: 5,
    category: 'Fashion'
  }
];

function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API search
    setIsLoading(true);
    setTimeout(() => {
      const filtered = MOCK_ALL_DEALS.filter(deal => 
        deal.title.toLowerCase().includes(query.toLowerCase()) ||
        deal.store.toLowerCase().includes(query.toLowerCase()) ||
        deal.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsLoading(false);
    }, 600);
  }, [query]);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <main className="main-content search-results-main">
        <header className="content-header">
          <div className="search-header-left">
            <button className="btn-back-icon" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="search-title">Search Results</h1>
              <p className="page-subtitle">Showing results for "{query}"</p>
            </div>
          </div>
          
          <div className="search-header-actions">
            <button className="btn-filter-secondary">
              <SlidersHorizontal size={18} />
              <span>Filters</span>
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="search-loading">
            <div className="loading-spinner"></div>
            <p>Searching for best deals...</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="results-count">
              Found {results.length} {results.length === 1 ? 'deal' : 'deals'}
            </div>
            
            <div className="deals-grid">
              {results.map((deal) => {
                const progressPercent = (deal.joinedCount / deal.totalRequired) * 100;
                return (
                  <div 
                    key={deal.id} 
                    className="deal-card"
                    onClick={() => navigate(`/deal/${deal.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="deal-image-container">
                      <span className="store-badge">{deal.store}</span>
                      <img src={deal.image} alt={deal.title} className="deal-image" />
                    </div>
                    
                    <div className="deal-content">
                      <h3 className="deal-title">{deal.title}</h3>
                      <div className="offer-box">{deal.offerText}</div>
                      
                      <div className="progress-section">
                        <div className="progress-stats">
                          <span className="joined-text">{deal.joinedCount}/{deal.totalRequired} Joined</span>
                          <span className="percent-text">{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div 
                            className="progress-bar-fill" 
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                      </div>

                      <button className="btn-join">Join Group</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="empty-state-container">
            <div className="empty-state-content">
              <div className="empty-icon-wrapper">
                <Search size={48} className="empty-search-icon" />
              </div>
              <h2>No results found</h2>
              <p>We couldn't find any deals matching "{query}". Try checking your spelling or using more general terms.</p>
              
              <div className="empty-suggestions">
                <h4>Try searching for:</h4>
                <div className="suggestion-pills">
                  <button onClick={() => navigate('/search?q=macbook')}>MacBook</button>
                  <button onClick={() => navigate('/search?q=iphone')}>iPhone</button>
                  <button onClick={() => navigate('/search?q=headphones')}>Headphones</button>
                  <button onClick={() => navigate('/search?q=nike')}>Nike</button>
                </div>
              </div>

              <button 
                className="btn-primary-empty"
                onClick={() => navigate('/dashboard')}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SearchResults;
