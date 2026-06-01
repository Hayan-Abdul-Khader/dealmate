import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import './Login.css'; // Re-use the layout styles from Login

function ForgotPassword() {
  return (
    <div className="login-container">
      {/* Left Pane - Branding & Hero (Re-used from Login for consistency) */}
      <div className="login-left">
        <div className="brand-header">
          <div className="logo-d">D</div>
          <div className="brand-name">DealMate</div>
        </div>
        
        <div className="hero-content">
          <h1>Never Miss a Deal</h1>
          <p>Get back to finding the best group savings with your community</p>
          <img 
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop" 
            alt="Two women looking at shopping bags" 
            className="hero-image"
          />
        </div>
      </div>

      {/* Right Pane - Forgot Password Form */}
      <div className="login-right">
        <div className="login-form-wrapper">
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px', fontWeight: '500' }}>
            <ArrowLeft size={18} />
            Back to login
          </Link>
          
          <h2>Forgot Password</h2>
          <p className="login-subtitle">
            Enter your email address and we'll send you a link to reset your password
          </p>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" />
                <input type="email" id="email" placeholder="you@example.com" />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
              Send Reset Link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
