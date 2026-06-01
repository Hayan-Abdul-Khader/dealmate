import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Smartphone, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import './Payment.css';

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const dealId = location.state?.dealId;
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'upi'

  useEffect(() => {
    if (!dealId || !user) {
      navigate('/dashboard');
      return;
    }
    fetchDealData();
  }, [dealId, user]);

  const fetchDealData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();

      if (error) throw error;
      setDeal(data);
    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(async () => {
      try {
        // Save paid status
        const paidDeals = JSON.parse(localStorage.getItem('paid_deals') || '[]');
        if (!paidDeals.includes(dealId)) {
          paidDeals.push(dealId);
          localStorage.setItem('paid_deals', JSON.stringify(paidDeals));
        }
        
        navigate(`/deal/${dealId}`);
      } catch (err) {
        alert('Payment processed, but error joining group: ' + err.message);
        setProcessing(false);
      }
    }, 1500);
  };

  if (loading) return <div className="page-loading">Loading Payment...</div>;

  const discountedPrice = Math.round(deal.original_price * (1 - (deal.discount_percent || 0) / 100));

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content payment-main">
        <div className="payment-container">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            Back
          </button>
          
          <div className="payment-grid">
            <div className="payment-form-section">
              <h2>Select Payment Method</h2>
              <p className="payment-subtitle">Choose how you want to pay for this deal</p>
              
              <div className="payment-methods">
                <button 
                  type="button"
                  className={`payment-method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={24} />
                  <span>Credit / Debit Card</span>
                </button>
                <button 
                  type="button"
                  className={`payment-method-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <Smartphone size={24} />
                  <span>UPI Payment</span>
                </button>
              </div>

              <form className="checkout-form" onSubmit={handlePayment}>
                {paymentMethod === 'card' ? (
                  <>
                    <div className="form-group-full">
                      <label>Card Number</label>
                      <input type="text" placeholder="XXXX XXXX XXXX XXXX" required pattern="\d{16}" title="16 digit card number" />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <input type="text" placeholder="MM/YY" required pattern="\d\d/\d\d" title="Format: MM/YY" />
                      </div>
                      <div className="form-group">
                        <label>CVV</label>
                        <input type="password" placeholder="XXX" required pattern="\d{3,4}" title="3 or 4 digit CVV" />
                      </div>
                    </div>
                    <div className="form-group-full">
                      <label>Cardholder Name</label>
                      <input type="text" placeholder="John Doe" required />
                    </div>
                  </>
                ) : (
                  <div className="form-group-full">
                    <label>UPI ID</label>
                    <input type="text" placeholder="username@bank" required />
                  </div>
                )}
                
                <button type="submit" className="btn-pay-now" disabled={processing}>
                  {processing ? <><Loader2 size={18} className="spin-icon" /> Processing...</> : `Pay ₹${discountedPrice.toLocaleString()}`}
                </button>
              </form>
              
              <div className="secure-badge">
                <ShieldCheck size={16} />
                <span>Secure 256-bit SSL Encryption</span>
              </div>
            </div>

            <div className="payment-summary-section">
              <h3>Order Summary</h3>
              <div className="deal-summary-card">
                <img src={deal.image_url || deal.image} alt={deal.title} className="summary-image" />
                <div className="summary-info">
                  <h4>{deal.title}</h4>
                  <span className="summary-store">{deal.store_name}</span>
                </div>
              </div>
              
              <div className="summary-breakdown">
                <div className="summary-row">
                  <span>Original Price</span>
                  <span>₹{deal.original_price?.toLocaleString()}</span>
                </div>
                <div className="summary-row discount">
                  <span>Group Buy Discount ({deal.discount_percent}%)</span>
                  <span>- ₹{(deal.original_price - discountedPrice).toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <hr className="summary-divider" />
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <span>₹{discountedPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Payment;
