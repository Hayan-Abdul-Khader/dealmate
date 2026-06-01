import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './SignUp.css';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#000000"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#000000"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#000000"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#000000"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073C24 5.405 18.627 0 12 0C5.373 0 0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24V15.562H7.078V12.073H10.125V9.412C10.125 6.408 11.916 4.75 14.656 4.75C15.969 4.75 17.344 4.984 17.344 4.984V7.938H15.831C14.34 7.938 13.875 8.864 13.875 9.816V12.073H17.203L16.671 15.562H13.875V24C19.612 23.094 24 18.1 24 12.073Z"/>
  </svg>
);

function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    const { data, error } = await signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName
        }
      }
    });

    if (error) {
      setError(error.message);
    } else {
      // Create profile record to fix foreign key constraints
      if (data?.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name: formData.fullName,
            referral_code: data.user.email.split('@')[0].toUpperCase() + Math.floor(Math.random() * 1000)
          }
        ]);
        
        if (profileError) {
          console.error("Error creating profile:", profileError);
          // Don't show to user since auth succeeded, but it's good for debugging
        }
      }

      alert('Sign up successful! Please check your email for verification.');
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        
        {/* Header */}
        <div className="signup-header">
          <div className="brand-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <div className="logo-d">D</div>
            <div className="brand-name">DealMate</div>
          </div>
          <p className="signup-subtitle">Create your account to start saving with group buying</p>
          {error && <div className="auth-error-message" style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center', border: '1px solid #fee2e2' }}>{error}</div>}
        </div>

        {/* Form */}
        <form className="signup-form" onSubmit={handleSignUp}>
          <div className="input-group">
            <label htmlFor="fullName">Full Name</label>
            <input 
              type="text" 
              id="fullName" 
              placeholder="John Doe" 
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="john@example.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <span className="help-text">Must be at least 8 characters</span>
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              placeholder="••••••••" 
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          </div>

          <div className="checkbox-group">
            <input type="checkbox" id="terms" />
            <label htmlFor="terms">
              I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
            </label>
          </div>

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="signup-divider">
          <span>Or sign up with</span>
        </div>

        {/* Social Login */}
        <div className="social-login-container">
          <button type="button" className="social-btn">
            <GoogleIcon />
            <span>Google</span>
          </button>
          <button type="button" className="social-btn">
            <FacebookIcon />
            <span>Facebook</span>
          </button>
        </div>

        {/* Login Link */}
        <div className="login-link-container">
          Already have an account? <Link to="/login" className="login-link">Sign in</Link>
        </div>

      </div>
    </div>
  );
}

export default SignUp;
