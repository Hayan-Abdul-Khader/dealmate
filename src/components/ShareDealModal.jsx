import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Link as LinkIcon, Image as ImageIcon, ChevronDown, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './ShareDealModal.css';

function ShareDealModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: URL, 2: Manual Form
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    store: '',
    category: '',
    originalPrice: '',
    discount: '',
    requiredMembers: '',
    location: '',
    expiryDate: '',
    imageUrl: '',
    description: ''
  });

  if (!isOpen) return null;

  const handleManualEntry = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleFetchDetails = async (e) => {
    e.preventDefault();
    const urlInput = document.getElementById('product-url').value;
    if (!urlInput) {
      alert('Please enter a URL first');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(urlInput)}`);
      const json = await res.json();
      
      if (json.status === 'success' && json.data) {
        const metadata = json.data;
        
        let cleanTitle = metadata.title || '';
        cleanTitle = cleanTitle.split('|')[0].trim();
        cleanTitle = cleanTitle.split('-')[0].trim();
        if (cleanTitle.length > 80) {
          cleanTitle = cleanTitle.substring(0, 80) + '...';
        }

        let detectedStore = '';
        const lowerUrl = urlInput.toLowerCase();
        if (lowerUrl.includes('amazon') || lowerUrl.includes('amzn')) {
          detectedStore = 'Amazon';
        } else if (lowerUrl.includes('flipkart')) {
          detectedStore = 'Flipkart';
        } else if (lowerUrl.includes('myntra')) {
          detectedStore = 'Myntra';
        } else if (lowerUrl.includes('costco')) {
          detectedStore = 'Costco';
        } else {
          detectedStore = metadata.publisher || 'Online Store';
        }

        const detectedImage = metadata.image?.url || metadata.logo?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800';

        setFormData(prev => ({
          ...prev,
          title: cleanTitle,
          store: detectedStore,
          imageUrl: detectedImage,
          description: metadata.description || ''
        }));
        
        setStep(2);
      } else {
        throw new Error('Could not parse metadata from URL');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to automatically fetch product details. Moving to manual form.');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };


  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handlePostDeal = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to post a deal');
      return;
    }

    try {
      setLoading(true);

      // 1. Ensure profile exists (workaround for RLS/signup sync issues)
      const { data: profileData, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileCheckError && profileCheckError.code === 'PGRST116') {
        // PGRST116 means zero rows returned (profile doesn't exist)
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
      } else if (profileCheckError) {
        throw profileCheckError;
      }

      // 2. Insert the deal
      const { data, error } = await supabase
        .from('deals')
        .insert([
          {
            creator_id: user.id,
            title: formData.title,
            store_name: formData.store,
            category: formData.category,
            original_price: parseFloat(formData.originalPrice),
            discount_percent: parseInt(formData.discount),
            required_members: parseInt(formData.requiredMembers),
            expiry_date: formData.expiryDate,
            image_url: formData.imageUrl,
            description: formData.description,
            status: 'active'
          }
        ])
        .select();

      if (error) throw error;


      setStep(1);
      onClose();
      navigate('/deal-success', { state: { dealId: data?.[0]?.id } });
    } catch (err) {
      alert('Error posting deal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="modal-overlay">
      <div className={`modal-content ${step === 2 ? 'manual-step' : ''}`}>
        <button className="modal-close" onClick={handleClose}>
          <X size={20} />
        </button>

        {step === 1 ? (
          <>
            <div className="modal-header">
              <h2>Share a Deal</h2>
              <p>Found a great deal? Share it with the community! Paste the product URL to get started.</p>
            </div>

            <div className="modal-body">
              <div className="input-section">
                <label htmlFor="product-url">Product URL</label>
                <div className="url-input-wrapper">
                  <div className="url-input-container">
                    <LinkIcon size={18} className="url-icon" />
                    <input 
                      type="text" 
                      id="product-url" 
                      placeholder="https://amazon.in/product-link or https://flipkar..." 
                    />
                  </div>
                  <button 
                    className="btn-fetch"
                    onClick={handleFetchDetails}
                    disabled={loading}
                  >
                    {loading ? 'Fetching...' : 'Fetch Details'}
                  </button>

                </div>
                <p className="input-hint">Supports Amazon, Flipkart, Costco, and other major retailers</p>
              </div>

              <div className="modal-divider">
                <span>OR</span>
              </div>

              <button className="btn-manual" onClick={handleManualEntry}>
                Enter Details Manually
              </button>
            </div>
          </>
        ) : (
          <div className="manual-form-container">
            <div className="modal-header">
              <h2>Share a Deal</h2>
              <p>Complete the deal details and set up group buying</p>
            </div>

            <form className="manual-form" onSubmit={handlePostDeal}>
              <div className="form-group-full">
                <label>Product Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. MacBook Pro 16 M3 Pro" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Store *</label>
                  <div className="select-wrapper">
                    <select 
                      value={formData.store} 
                      onChange={(e) => setFormData({...formData, store: e.target.value})}
                      required
                    >
                      <option value="" disabled>Select store</option>
                      <option value="Amazon">Amazon</option>
                      <option value="Flipkart">Flipkart</option>
                      <option value="Costco">Costco</option>
                      <option value="Best Buy">Best Buy</option>
                      <option value="Target">Target</option>
                    </select>
                    <ChevronDown className="select-icon" size={16} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <div className="select-wrapper">
                    <select 
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      <option value="" disabled>Select category</option>
                      <option value="tech">Tech</option>
                      <option value="fashion">Fashion</option>
                      <option value="home">Home</option>
                      <option value="beauty">Beauty</option>
                    </select>
                    <ChevronDown className="select-icon" size={16} />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Original Price (Rs.) *</label>
                  <input 
                    type="number" 
                    placeholder="29999" 
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Discount % *</label>
                  <input 
                    type="number" 
                    placeholder="35" 
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Required Members *</label>
                  <input 
                    type="number" 
                    placeholder="5" 
                    value={formData.requiredMembers}
                    onChange={(e) => setFormData({...formData, requiredMembers: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <input 
                    type="text" 
                    placeholder="Mumbai" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group-full">
                <label>Expiry Date *</label>
                <div className="date-input-wrapper">
                  <input 
                    type="date" 
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    required
                  />
                  <Calendar className="date-icon" size={18} />
                </div>
              </div>


              <div className="form-group-full">
                <label>Image URL *</label>
                <div className="url-input-container">
                  <ImageIcon size={18} className="url-icon" />
                  <input 
                    type="text" 
                    placeholder="https://images.example.com/product.jpg" 
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group-full">
                <label>Description *</label>
                <textarea 
                  placeholder="Detailed product description..." 
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                ></textarea>
              </div>

              <div className="form-actions-modal">
                <button type="button" className="btn-modal-back" onClick={handleBack}>
                  Back
                </button>
                <button type="submit" className="btn-modal-post" disabled={loading}>
                  {loading ? 'Posting...' : 'Post Deal'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShareDealModal;
