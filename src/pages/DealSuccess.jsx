import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Share2, ArrowRight, LayoutDashboard } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import './DealSuccess.css';

function DealSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const dealId = location.state?.dealId;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <main className="main-content deal-success-main">
        <div className="success-container">
          <div className="success-card">
            <div className="success-icon-wrapper">
              <div className="success-icon-bg">
                <CheckCircle size={64} className="success-check" />
              </div>
              <div className="confetti-placeholder"></div>
            </div>

            <h1>Deal Posted Successfully!</h1>
            <p>Your deal has been shared with the community. Other members can now see and join your group to unlock the discount.</p>

            <div className="success-actions">
              <button 
                className="btn-view-deal" 
                onClick={() => navigate(dealId ? `/deal/${dealId}` : '/dashboard')}
              >
                <span>View Your Deal</span>
                <ArrowRight size={20} />
              </button>

              
              <div className="secondary-actions-success">
                <button 
                  className="btn-success-outline"
                  onClick={() => navigate('/dashboard')}
                >
                  <LayoutDashboard size={20} />
                  <span>Go to Dashboard</span>
                </button>
                <button className="btn-success-outline">
                  <Share2 size={20} />
                  <span>Share with Friends</span>
                </button>
              </div>
            </div>

            <div className="next-steps">
              <h3>What's next?</h3>
              <ul>
                <li>
                  <div className="step-num">1</div>
                  <p>Wait for other members to join your group.</p>
                </li>
                <li>
                  <div className="step-num">2</div>
                  <p>Once the required number of members is reached, the deal activates.</p>
                </li>
                <li>
                  <div className="step-num">3</div>
                  <p>You'll receive a notification to complete your purchase at the discounted price.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DealSuccess;
