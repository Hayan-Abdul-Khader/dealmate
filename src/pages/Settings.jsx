import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  CreditCard, 
  Shield, 
  LogOut,
  Camera,
  ChevronRight,
  Globe,
  Lock,
  Eye,
  Trash2,
  ArrowLeft,
  Smartphone,
  Monitor,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import './Settings.css';

function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [securityView, setSecurityView] = useState('menu'); // 'menu' | 'change-password' | 'login-activity'
  
  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Login activity states
  const getDeviceDetails = () => {
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    let os = "Unknown OS";
    let deviceType = "desktop";

    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";

    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Macintosh") || ua.includes("Mac OS")) os = "macOS";
    else if (ua.includes("iPhone") || ua.includes("iPad")) {
      os = "iOS";
      deviceType = "mobile";
    } else if (ua.includes("Android")) {
      os = "Android";
      deviceType = "mobile";
    }

    return { browser, os, deviceType };
  };

  const device = getDeviceDetails();
  const [sessions, setSessions] = useState([
    {
      browser: device.browser,
      os: device.os,
      deviceType: device.deviceType,
      ip: "192.168.1.102",
      location: "Mumbai, India",
      time: "Active now",
      current: true
    },
    {
      browser: "Safari",
      os: "iOS",
      deviceType: "mobile",
      ip: "103.241.12.89",
      location: "Bengaluru, India",
      time: "2 hours ago",
      current: false
    },
    {
      browser: "Firefox",
      os: "Windows",
      deviceType: "desktop",
      ip: "157.48.204.11",
      location: "New Delhi, India",
      time: "3 days ago",
      current: false
    }
  ]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      setUpdatingPassword(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSuccess('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleRevokeSession = (index) => {
    setSessions(prev => prev.filter((_, idx) => idx !== index));
    alert('Session revoked successfully!');
  };

  const handleRevokeAllOther = () => {
    setSessions(prev => prev.filter(s => s.current));
    alert('Logged out of all other sessions successfully!');
  };

  // Payment states and handlers
  const [savedCards, setSavedCards] = useState([
    { brand: 'Visa', last4: '4242', expiry: '12/28', isDefault: true },
    { brand: 'Mastercard', last4: '8888', expiry: '09/27', isDefault: false }
  ]);
  const [billingHistory, setBillingHistory] = useState([
    { date: 'May 25, 2026', description: 'MacBook Pro 16 M3 Pro (Group Buy)', amount: '₹1,24,999', status: 'Paid' },
    { date: 'May 10, 2026', description: 'Nike Air Max Running Shoes (Group Buy)', amount: '₹8,499', status: 'Paid' },
    { date: 'Apr 28, 2026', description: 'Sony WH-1000XM5 Headset (Group Buy)', amount: '₹22,999', status: 'Paid' }
  ]);
  const [showAddCardForm, setShowAddCardForm] = useState(false);

  const handleSetDefaultCard = (index) => {
    setSavedCards(prev => prev.map((card, idx) => ({
      ...card,
      isDefault: idx === index
    })));
  };

  const handleDeleteCard = (index) => {
    setSavedCards(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddCardSubmit = (e) => {
    e.preventDefault();
    const name = e.target[0].value;
    const number = e.target[1].value;
    const expiry = e.target[2].value;
    const last4 = number.slice(-4) || '1111';
    setSavedCards(prev => [...prev, {
      brand: 'Visa',
      last4: last4,
      expiry: expiry,
      isDefault: false
    }]);
    setShowAddCardForm(false);
    alert('Payment method added successfully!');
  };

  // Language preferences states
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedTimezone, setSelectedTimezone] = useState('IST');
  const [selectedCurrency, setSelectedCurrency] = useState('INR');

  return (
    <div className="dashboard-layout">
      <Sidebar />

      {/* Main Content */}
      <main className="main-content settings-main">
        <header className="content-header">
          <div>
            <h1 className="settings-page-title">
              <SettingsIcon className="settings-icon-header" size={28} />
              Settings
            </h1>
            <p className="page-subtitle">Personalize your experience and manage your account</p>
          </div>
        </header>

        <div className="settings-layout-grid">
          {/* Settings Navigation */}
          <aside className="settings-sidebar-nav">
            <button 
              className={`settings-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              <User size={20} />
              <span>Profile</span>
            </button>
            <button 
              className={`settings-nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveSection('notifications')}
            >
              <Bell size={20} />
              <span>Notifications</span>
            </button>
            <button 
              className={`settings-nav-item ${activeSection === 'payment' ? 'active' : ''}`}
              onClick={() => setActiveSection('payment')}
            >
              <CreditCard size={20} />
              <span>Payment</span>
            </button>
            <button 
              className={`settings-nav-item ${activeSection === 'security' ? 'active' : ''}`}
              onClick={() => setActiveSection('security')}
            >
              <Shield size={20} />
              <span>Security</span>
            </button>
            <button 
              className={`settings-nav-item ${activeSection === 'language' ? 'active' : ''}`}
              onClick={() => setActiveSection('language')}
            >
              <Globe size={20} />
              <span>Language</span>
            </button>
          </aside>

          {/* Settings Content */}
          <div className="settings-content-area">
            {activeSection === 'profile' && (
              <section className="settings-panel">
                <div className="panel-header">
                  <h2>Public Profile</h2>
                  <p>This information will be displayed publicly to other group members.</p>
                </div>

                <div className="profile-upload-section">
                  <div className="profile-avatar-large">
                    JD
                    <button className="btn-upload-avatar">
                      <Camera size={16} />
                    </button>
                  </div>
                  <div className="profile-upload-info">
                    <h3>Profile Picture</h3>
                    <p>PNG, JPG or GIF. Max size of 1MB.</p>
                    <div className="upload-actions">
                      <button className="btn-secondary-sm">Upload New</button>
                      <button className="btn-text-danger">Remove</button>
                    </div>
                  </div>
                </div>

                <div className="settings-form">
                  <div className="form-row-settings">
                    <div className="form-group-settings">
                      <label>First Name</label>
                      <input type="text" defaultValue="John" />
                    </div>
                    <div className="form-group-settings">
                      <label>Last Name</label>
                      <input type="text" defaultValue="Doe" />
                    </div>
                  </div>
                  <div className="form-group-settings">
                    <label>Email Address</label>
                    <input type="email" defaultValue="john.doe@example.com" disabled />
                    <span className="input-hint">Email cannot be changed once verified.</span>
                  </div>
                  <div className="form-group-settings">
                    <label>Bio</label>
                    <textarea defaultValue="Tech enthusiast and bargain hunter. Love finding the best group deals for gadgets!" rows="3"></textarea>
                  </div>
                  <div className="form-actions-settings">
                    <button className="btn-save-settings">Save Changes</button>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'notifications' && (
              <section className="settings-panel">
                <div className="panel-header">
                  <h2>Notifications</h2>
                  <p>Choose when and how you want to be notified.</p>
                </div>

                <div className="notification-settings-list">
                  <div className="setting-item-toggle">
                    <div className="setting-text">
                      <h4>Deal Success Alerts</h4>
                      <p>Notify me when a group I joined is full and the deal is active.</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="setting-item-toggle">
                    <div className="setting-text">
                      <h4>New Deal Suggestions</h4>
                      <p>Receive recommendations based on your categories.</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="setting-item-toggle">
                    <div className="setting-text">
                      <h4>Discussion Mentions</h4>
                      <p>Notify me when someone replies to my comments.</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'security' && (
              <section className="settings-panel">
                {securityView === 'menu' ? (
                  <>
                    <div className="panel-header">
                      <h2>Security</h2>
                      <p>Manage your password and security preferences.</p>
                    </div>

                    <div className="security-options-list">
                      <div className="security-option-item" onClick={() => setSecurityView('change-password')}>
                        <div className="option-icon-bg">
                          <Lock size={20} />
                        </div>
                        <div className="option-text">
                          <h4>Change Password</h4>
                          <p>Update your password to keep your account secure.</p>
                        </div>
                        <ChevronRight size={20} className="chevron-muted" />
                      </div>
                      <div className="security-option-item" onClick={() => setSecurityView('login-activity')}>
                        <div className="option-icon-bg">
                          <Eye size={20} />
                        </div>
                        <div className="option-text">
                          <h4>Login Activity</h4>
                          <p>Check recent logins and active sessions.</p>
                        </div>
                        <ChevronRight size={20} className="chevron-muted" />
                      </div>
                    </div>

                    <div className="danger-zone">
                      <h3>Danger Zone</h3>
                      <div className="danger-item">
                        <div className="danger-text">
                          <h4>Delete Account</h4>
                          <p>Once you delete your account, there is no going back. Please be certain.</p>
                        </div>
                        <button className="btn-danger-outline">
                          <Trash2 size={18} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                ) : securityView === 'change-password' ? (
                  <>
                    <div className="security-sub-header">
                      <button className="btn-back" onClick={() => {
                        setSecurityView('menu');
                        setPasswordError('');
                        setPasswordSuccess('');
                      }}>
                        <ArrowLeft size={16} /> Back to Security
                      </button>
                      <h3>Change Password</h3>
                      <p>Update your password to secure your account.</p>
                    </div>

                    <form onSubmit={handleChangePassword} className="settings-form">
                      <div className="form-group-settings">
                        <label>New Password</label>
                        <input 
                          type="password" 
                          placeholder="Min 6 characters" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group-settings">
                        <label>Confirm New Password</label>
                        <input 
                          type="password" 
                          placeholder="Confirm new password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      {passwordError && <div className="error-message-settings">{passwordError}</div>}
                      {passwordSuccess && <div className="success-message-settings">{passwordSuccess}</div>}
                      <div className="form-actions-settings">
                        <button type="submit" className="btn-save-settings" disabled={updatingPassword}>
                          {updatingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="security-sub-header">
                      <button className="btn-back" onClick={() => setSecurityView('menu')}>
                        <ArrowLeft size={16} /> Back to Security
                      </button>
                      <h3>Login Activity</h3>
                      <p>These are the devices that have logged into your account.</p>
                    </div>

                    <div className="login-activity-list">
                      {sessions.map((session, index) => (
                        <div className="session-item" key={index}>
                          <div className="session-icon-bg">
                            {session.deviceType === 'mobile' ? <Smartphone size={20} /> : <Monitor size={20} />}
                          </div>
                          <div className="session-details">
                            <div className="session-title">
                              {session.browser} on {session.os}
                              {session.current && <span className="current-badge">Current Session</span>}
                            </div>
                            <div className="session-meta">
                              <span>{session.ip}</span> • <span>{session.location}</span> • <span>{session.time}</span>
                            </div>
                          </div>
                          {session.current ? null : (
                            <button 
                              className="btn-revoke-session" 
                              onClick={() => handleRevokeSession(index)}
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="session-actions-footer">
                      <button className="btn-revoke-all" onClick={handleRevokeAllOther}>
                        Log Out of All Other Sessions
                      </button>
                    </div>
                  </>
                )}
              </section>
            )}

            {activeSection === 'payment' && (
              <section className="settings-panel">
                <div className="panel-header">
                  <h2>Payment Settings</h2>
                  <p>Manage your payment methods and view billing history.</p>
                </div>

                <div className="payment-methods-section">
                  <h3>Saved Payment Methods</h3>
                  <div className="saved-cards-list">
                    {savedCards.map((card, index) => (
                      <div className="card-item" key={index}>
                        <div className="card-brand">
                          <CreditCard size={24} className="card-icon" />
                          <span>{card.brand} ending in {card.last4}</span>
                        </div>
                        <div className="card-details-row">
                          <span className="card-expiry">Expires {card.expiry}</span>
                          {card.isDefault && <span className="default-card-badge">Default</span>}
                        </div>
                        <div className="card-actions">
                          {!card.isDefault && (
                            <button className="btn-card-action" onClick={() => handleSetDefaultCard(index)}>
                              Set Default
                            </button>
                          )}
                          <button className="btn-card-action delete" onClick={() => handleDeleteCard(index)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="btn-add-card" onClick={() => setShowAddCardForm(true)}>
                    + Add New Card
                  </button>
                </div>

                {showAddCardForm && (
                  <div className="add-card-overlay">
                    <div className="add-card-form-container">
                      <h4>Add Payment Method</h4>
                      <form onSubmit={handleAddCardSubmit} className="add-card-form">
                        <div className="form-group-settings">
                          <label>Cardholder Name</label>
                          <input type="text" placeholder="John Doe" required />
                        </div>
                        <div className="form-group-settings">
                          <label>Card Number</label>
                          <input type="text" placeholder="1234 5678 1234 5678" maxLength="19" required />
                        </div>
                        <div className="form-row-settings">
                          <div className="form-group-settings">
                            <label>Expiry Date</label>
                            <input type="text" placeholder="MM/YY" maxLength="5" required />
                          </div>
                          <div className="form-group-settings">
                            <label>CVC</label>
                            <input type="password" placeholder="123" maxLength="3" required />
                          </div>
                        </div>
                        <div className="add-card-actions">
                          <button type="button" className="btn-cancel" onClick={() => setShowAddCardForm(false)}>
                            Cancel
                          </button>
                          <button type="submit" className="btn-save-settings">
                            Save Card
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="billing-history-section">
                  <h3>Billing History</h3>
                  <div className="billing-table-wrapper">
                    <table className="billing-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingHistory.map((bill, index) => (
                          <tr key={index}>
                            <td>{bill.date}</td>
                            <td>{bill.description}</td>
                            <td>{bill.amount}</td>
                            <td>
                              <span className="status-badge-paid">
                                {bill.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'language' && (
              <section className="settings-panel">
                <div className="panel-header">
                  <h2>Language and Region</h2>
                  <p>Customize your language, timezone, and regional preferences.</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); alert('Region settings saved successfully!'); }} className="settings-form">
                  <div className="form-group-settings">
                    <label>Preferred Language</label>
                    <div className="select-wrapper">
                      <select 
                        value={selectedLanguage} 
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="settings-select"
                      >
                        <option value="English">English (United States)</option>
                        <option value="Hindi">Hindi (भारत)</option>
                        <option value="Spanish">Spanish (Español)</option>
                        <option value="French">French (Français)</option>
                        <option value="German">German (Deutsch)</option>
                      </select>
                      <ChevronDown className="select-icon-settings" size={16} />
                    </div>
                  </div>

                  <div className="form-group-settings">
                    <label>Time Zone</label>
                    <div className="select-wrapper">
                      <select 
                        value={selectedTimezone} 
                        onChange={(e) => setSelectedTimezone(e.target.value)}
                        className="settings-select"
                      >
                        <option value="IST">GMT+05:30 (India Standard Time)</option>
                        <option value="EST">GMT-05:00 (Eastern Standard Time)</option>
                        <option value="PST">GMT-08:00 (Pacific Standard Time)</option>
                        <option value="GMT">GMT+00:00 (Greenwich Mean Time)</option>
                        <option value="CET">GMT+01:00 (Central European Time)</option>
                      </select>
                      <ChevronDown className="select-icon-settings" size={16} />
                    </div>
                  </div>

                  <div className="form-group-settings">
                    <label>Default Currency</label>
                    <div className="select-wrapper">
                      <select 
                        value={selectedCurrency} 
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className="settings-select"
                      >
                        <option value="INR">INR (₹) - Indian Rupee</option>
                        <option value="USD">USD ($) - United States Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                        <option value="GBP">GBP (£) - British Pound Sterling</option>
                      </select>
                      <ChevronDown className="select-icon-settings" size={16} />
                    </div>
                  </div>

                  <div className="form-actions-settings">
                    <button type="submit" className="btn-save-settings">Save Regional Settings</button>
                  </div>
                </form>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
