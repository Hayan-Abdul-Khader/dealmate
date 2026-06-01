import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Bell, ShoppingBag, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import './JoinSuccess.css';

function JoinSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const dealId = location.state?.dealId;
  const [deal, setDeal] = useState(null);
  const [joinedCount, setJoinedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dealId) {
      fetchDealProgress();
    } else {
      setLoading(false);
    }
  }, [dealId]);

  const fetchDealProgress = async () => {
    try {
      setLoading(true);
      
      // Fetch deal
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();
      if (dealError) throw dealError;
      setDeal(dealData);

      // Fetch member count
      const { count, error: countError } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('deal_id', dealId);
      if (countError) throw countError;
      setJoinedCount(count || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalRequired = deal?.required_members || 5;
  const progressPercent = Math.min((joinedCount / totalRequired) * 100, 100);
  const isAlmostFull = progressPercent >= 80 && progressPercent < 100;
  const isFull = progressPercent >= 100;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <main className="main-content join-success-main">
        <div className="success-container">
          <div className="success-card join-card">
            <div className="success-icon-wrapper">
              <div className="success-icon-bg blue-bg">
                <Users size={64} className="success-check" />
              </div>
            </div>

            <h1>Request Sent!</h1>
            <p>You've successfully requested to join this group. We've added you to the queue, and you're one step closer to unlocking this deal.</p>

            <div className="info-box-success">
              <Bell size={20} className="info-icon" />
              <p>We'll notify you as soon as the group is full and the deal is ready to be claimed.</p>
            </div>

            <div className="success-actions">
              <button 
                className="btn-primary-success" 
                onClick={() => navigate('/my-deals')}
              >
                <ShoppingBag size={20} />
                <span>Track in My Deals</span>
              </button>
              
              <button 
                className="btn-outline-success"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft size={20} />
                <span>Browse More Deals</span>
              </button>
            </div>

            {!loading && deal && (
              <div className="waiting-list-preview">
                <h3>Group Progress</h3>
                <div className="mini-progress-section">
                  <div className="mini-stats">
                    <span>{joinedCount} / {totalRequired} Joined</span>
                    <span className="almost-there">
                      {isFull ? 'Group buy active!' : isAlmostFull ? 'Almost there!' : 'Filling up...'}
                    </span>
                  </div>
                  <div className="mini-progress-bar">
                    <div className="mini-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <p className="mini-hint">
                    {isFull 
                      ? 'The group is complete!' 
                      : `Just ${totalRequired - joinedCount} more ${totalRequired - joinedCount === 1 ? 'person' : 'people'} needed to activate this deal.`
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default JoinSuccess;
