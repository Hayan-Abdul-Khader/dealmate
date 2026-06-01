import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Share2, 
  Heart,
  TrendingUp,
  Clock,
  MessageSquare,
  Info,
  UserCheck,
  X,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import GroupDiscussion from '../components/GroupDiscussion';
import MemberList from '../components/MemberList';
import './DealDetails.css';

const MOCK_DEAL_DETAILS = {
  'fb-1': {
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
    location: 'Online',
    expiry_date: 'June 15, 2026',
    required_members: 5,
    features: ['Aerospace-grade titanium design', 'A17 Pro chip with 6-core GPU', 'Pro camera system (48MP Main)', 'USB-C supporting USB 3']
  },
  'fb-2': {
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
    location: 'Online',
    expiry_date: 'June 18, 2026',
    required_members: 4,
    features: ['Textile and synthetic leather upper', 'Point-loaded Max Air cushioning', 'Foam midsole for extra bounce']
  },
  'fb-3': {
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
    location: 'Online',
    expiry_date: 'June 20, 2026',
    required_members: 3,
    features: ['Breathable high-density mesh', 'Adjustable 3D armrests & headrest', 'Synchro-tilt mechanism (90-135°)', 'BIFMA certified gas lift class 4']
  }
};

function DealDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deal, setDeal] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    address_line: '', city: '', state: '', zip_code: '', country: ''
  });
  const [isSaved, setIsSaved] = useState(false);
  const [shareText, setShareText] = useState('Share');
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    fetchDealData();
    const saved = JSON.parse(localStorage.getItem('saved_deals') || '[]');
    setIsSaved(saved.includes(id));
    const paid = JSON.parse(localStorage.getItem('paid_deals') || '[]');
    setHasPaid(paid.includes(id));
  }, [id, user]);

  const fetchDealData = async () => {
    try {
      setLoading(true);
      
      // If it is a fallback mock ID, load it directly
      if (id && id.startsWith('fb-')) {
        const mockDeal = MOCK_DEAL_DETAILS[id];
        if (mockDeal) {
          setDeal(mockDeal);
          // Set mock members
          setMembers([
            { id: 'm-1', user_id: 'u-1', profiles: { full_name: 'Aarav Sharma', avatar_url: '', city: 'Mumbai' } },
            { id: 'm-2', user_id: 'u-2', profiles: { full_name: 'Dia Patel', avatar_url: '', city: 'Ahmedabad' } }
          ].slice(0, mockDeal.required_members - 1));
          return;
        }
      }

      // Fetch main deal details
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', id)
        .single();

      if (dealError) {
        console.error('Deal fetch error:', dealError.message);
        throw dealError;
      }
      setDeal(dealData);

      // Fetch group members in a separate isolated try-catch block
      try {
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select('*, profiles(full_name, avatar_url, city)')
          .eq('deal_id', id);

        if (membersError) {
          console.warn('Non-fatal members fetch error:', membersError.message);
        } else {
          setMembers(membersData || []);
          if (user) {
            setIsMember(membersData?.some(m => m.user_id === user.id));
          }
        }
      } catch (memErr) {
        console.warn('Error fetching group members (non-fatal):', memErr.message);
      }

    } catch (err) {
      console.error('Fetch error:', err.message);
      if (id && id.startsWith('fb-')) {
        setDeal(MOCK_DEAL_DETAILS[id]);
      } else {
        setDeal(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async () => {
    if (!user) {
      alert('Please log in to join!');
      navigate('/login');
      return;
    }
    try {
      setJoining(true);

      // Handle mock deal join
      if (id && id.startsWith('fb-')) {
        setTimeout(() => {
          navigate('/join-success', { state: { dealId: id } });
        }, 800);
        return;
      }

      // Ensure profile exists and check address
      const { data: profileData, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileCheckError && profileCheckError.code === 'PGRST116') {
        const { error: profileInsertError } = await supabase.from('profiles').insert([
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'User',
            referral_code: user.email.split('@')[0].toUpperCase() + Math.floor(Math.random() * 1000)
          }
        ]);
        
        if (profileInsertError) {
          throw new Error('Failed to create user profile: ' + profileInsertError.message);
        }
        // If it's a brand new profile, they don't have an address yet
        setJoining(false);
        setShowAddressModal(true);
        return;
      } else if (profileCheckError) {
        throw profileCheckError;
      }

      // Check if they have an address
      if (!profileData.address_line) {
        setJoining(false);
        setShowAddressModal(true);
        return;
      }

      const { error } = await supabase
        .from('group_members')
        .insert([{ deal_id: id, user_id: user.id }]);
      if (error) throw error;
      fetchDealData();
      navigate('/join-success', { state: { dealId: id } });
    } catch (err) {
      alert(err.message);
    } finally {
      setJoining(false);
    }
  };

  const handleSaveAddressAndJoin = async (e) => {
    e.preventDefault();
    try {
      setJoining(true);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          address_line: shippingAddress.address_line,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip_code: shippingAddress.zip_code,
          country: shippingAddress.country
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      setShowAddressModal(false);
      
      // Now actually join the deal
      const { error } = await supabase
        .from('group_members')
        .insert([{ deal_id: id, user_id: user.id }]);
      if (error) throw error;
      
      fetchDealData();
      navigate('/join-success', { state: { dealId: id } });
    } catch (err) {
      alert('Error saving address: ' + err.message);
    } finally {
      setJoining(false);
    }
  };

  const handleSave = () => {
    const saved = JSON.parse(localStorage.getItem('saved_deals') || '[]');
    if (isSaved) {
      const updated = saved.filter(dealId => dealId !== id);
      localStorage.setItem('saved_deals', JSON.stringify(updated));
      setIsSaved(false);
    } else {
      saved.push(id);
      localStorage.setItem('saved_deals', JSON.stringify(saved));
      setIsSaved(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: deal?.title || 'Check out this deal!',
          text: `Join this group buy for ${deal?.title} on Dealmate!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareText('Copied!');
      setTimeout(() => setShareText('Share'), 2000);
    }
  };


  if (loading) return <div className="page-loading">Loading...</div>;
  if (!deal) return <div className="page-error">Deal not found</div>;

  const joinedCount = members.length || 0;
  const totalRequired = deal.required_members || 5;
  const progressPercent = (joinedCount / totalRequired) * 100;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <main className="main-content">
        <div className="deal-details-container">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            Back to Deals
          </button>

          <div className="deal-details-grid">
            {/* Left Column - Image and Tabs */}
            <div className="details-left">
              <div className="main-image-container">
                <img src={deal.image_url || deal.image} alt={deal.title} className="main-deal-image" />
              </div>
              
              <div className="details-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  <Info size={18} />
                  Product Details
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'discussion' ? 'active' : ''}`}
                  onClick={() => setActiveTab('discussion')}
                >
                  <MessageSquare size={18} />
                  Discussion
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
                  onClick={() => setActiveTab('members')}
                >
                  <UserCheck size={18} />
                  Members
                </button>
              </div>

              <div className="details-card section-card">
                {activeTab === 'details' && (
                  <>
                    <h2>Product Details</h2>
                    <p className="product-description">{deal.description}</p>
                    
                    {deal.features && deal.features.length > 0 && (
                      <>
                        <h3>Key Features</h3>
                        <ul className="features-list">
                          {deal.features.map((feature, index) => (
                            <li key={index}>
                              <CheckCircle size={18} className="check-icon" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </>
                )}
                {activeTab === 'discussion' && <GroupDiscussion dealId={id} />}
                 {activeTab === 'members' && <MemberList members={members} creatorId={deal.creator_id} requiredMembers={deal.required_members} />}
              </div>
            </div>

            {/* Right Column - Pricing and Group Info */}
            <div className="details-right">
              <div className="details-card info-card">
                <div className="store-header">
                  <div className="store-badge-large">
                    <span>{deal.store_name || deal.store}</span>
                  </div>
                </div>
                
                <h1 className="detail-title">{deal.title}</h1>
                
                <div className="meta-info">
                  <div className="meta-item">
                    <MapPin size={16} />
                    <span>{deal.location || 'Online'}</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>Expires {deal.expiry_date || deal.expires}</span>
                  </div>
                </div>
              </div>

              <div className="details-card price-card">
                <div className="price-section">
                  <span className="label">Pricing</span>
                  <div className="price-row">
                    <span className="current-price">₹{deal.current_price?.toLocaleString() || (deal.original_price * (1 - deal.discount_percent/100))?.toLocaleString()}</span>
                    <span className="original-price">₹{deal.original_price?.toLocaleString()}</span>
                  </div>
                  <div className="savings-badge">
                    {deal.discount_percent}% Discount Applied
                  </div>
                </div>
              </div>

              <div className="details-card status-card">
                <div className="status-header">
                  <span className="label">Group Status</span>
                  <span className="status-badge-orange">
                    <TrendingUp size={14} />
                    {joinedCount >= totalRequired ? 'Completed' : 'Filling Fast'}
                  </span>
                </div>
                
                <div className="progress-section-large">
                  <div className="progress-stats-large">
                    <div className="joined-count">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span>{joinedCount} / {totalRequired} Joined</span>
                    </div>
                    <span className="percent-large">{Math.round(progressPercent)}%</span>
                  </div>
                  
                  <div className="progress-bar-bg-large">
                    <div className="progress-bar-fill-large" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  
                  <p className="needed-text">
                    {joinedCount >= totalRequired ? 'Group is full!' : `${totalRequired - joinedCount} more people needed to activate this deal`}
                  </p>
                </div>
              </div>

              <div className="action-buttons">
                {!isMember ? (
                  <button 
                    className="btn-join-large" 
                    onClick={joinGroup}
                    disabled={joining || joinedCount >= totalRequired}
                  >
                    {joining ? 'Joining...' : 'Join This Group'}
                  </button>
                ) : joinedCount < totalRequired ? (
                  <button 
                    className="btn-join-large joined" 
                    disabled
                  >
                    ✓ Joined - Waiting for Group
                  </button>
                ) : !hasPaid ? (
                  <button 
                    className="btn-join-large" 
                    onClick={() => navigate('/payment', { state: { dealId: id } })}
                  >
                    Complete Payment
                  </button>
                ) : (
                  <button 
                    className="btn-join-large joined" 
                    disabled
                  >
                    ✓ Payment Complete
                  </button>
                )}
                <div className="secondary-actions">
                  <button className="btn-secondary" onClick={handleShare}>
                    <Share2 size={18} />
                    {shareText}
                  </button>
                  <button className={`btn-secondary ${isSaved ? 'saved' : ''}`} onClick={handleSave}>
                    <Heart size={18} fill={isSaved ? "#ff4b4b" : "none"} color={isSaved ? "#ff4b4b" : "currentColor"} />
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>

              {joinedCount < totalRequired && (
                <div className="payment-helper-text">
                  <Info size={14} />
                  <span>Payment option will be enabled once the group is complete.</span>
                </div>
              )}

              <div className="trust-badges">
                <div className="trust-item">
                  <CheckCircle size={16} className="trust-icon" />
                  <span>Verified seller and product</span>
                </div>
                <div className="trust-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="trust-icon">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                  <span>Free shipping on group orders</span>
                </div>
                <div className="trust-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="trust-icon">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <span>Money-back guarantee if group doesn't fill</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAddressModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowAddressModal(false)}>
              <X size={20} />
            </button>
            <div className="modal-header">
              <h2>Shipping Address Required</h2>
              <p>Please provide your shipping details so the vendor can send you the product once the deal unlocks.</p>
              <div className="privacy-notice">
                <ShieldCheck size={16} />
                <span>Don't worry, your shipping details are sent securely and directly to the concerned company for order fulfillment only.</span>
              </div>
            </div>
            <form className="manual-form" onSubmit={handleSaveAddressAndJoin}>
              <div className="form-group-full">
                <label>Address Line *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="123 Main St, Apt 4B"
                  value={shippingAddress.address_line}
                  onChange={e => setShippingAddress({...shippingAddress, address_line: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Mumbai"
                    value={shippingAddress.city}
                    onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Maharashtra"
                    value={shippingAddress.state}
                    onChange={e => setShippingAddress({...shippingAddress, state: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Zip / Postal Code *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="400001"
                    value={shippingAddress.zip_code}
                    onChange={e => setShippingAddress({...shippingAddress, zip_code: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Country *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="India"
                    value={shippingAddress.country}
                    onChange={e => setShippingAddress({...shippingAddress, country: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-actions-modal">
                <button type="button" className="btn-modal-back" onClick={() => setShowAddressModal(false)}>Cancel</button>
                <button type="submit" className="btn-modal-post" disabled={joining}>
                  {joining ? 'Saving & Joining...' : 'Save & Join Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DealDetails;
