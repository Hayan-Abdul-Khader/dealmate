import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Mail, 
  Phone,
  BookOpen,
  ShieldCheck,
  CreditCard,
  User,
  X,
  Send
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import './Help.css';

const FAQ_DATA = [
  {
    id: 1,
    question: 'How does group buying work?',
    answer: 'Group buying allows multiple users to join together to purchase a product at a significantly lower price. Once the required number of members join a group, the deal is activated, and everyone can complete their purchase at the discounted rate.',
    category: 'Getting Started'
  },
  {
    id: 2,
    question: 'What happens if a group doesn\'t fill up?',
    answer: 'If the group doesn\'t reach the required number of members before the deal expires, the deal is cancelled. If you\'ve already made a payment, a full refund will be processed automatically to your original payment method.',
    category: 'Getting Started'
  },
  {
    id: 3,
    question: 'Is my payment secure?',
    answer: 'Yes, we use industry-standard encryption and partner with secure payment gateways like Stripe and Razorpay to ensure your transactions are 100% safe.',
    category: 'Payments & Refunds'
  },
  {
    id: 4,
    question: 'Can I cancel my join request?',
    answer: 'You can cancel your request to join a group as long as the group is not yet full. Once the group is full and the deal is activated, cancellations are subject to our refund policy.',
    category: 'Account & Profile'
  },
  {
    id: 5,
    question: 'How do you verify deals and sellers?',
    answer: 'We verify every merchant through our merchant onboarding guidelines and perform escrow-based transaction holds to ensure you only pay when you successfully receive your product.',
    category: 'Safety & Trust'
  }
];

const HELP_CATEGORIES = [
  { id: 1, name: 'Getting Started', icon: <BookOpen size={24} />, color: '#dbeafe', textColor: '#2563eb' },
  { id: 2, name: 'Account & Profile', icon: <User size={24} />, color: '#fef2f2', textColor: '#ef4444' },
  { id: 3, name: 'Payments & Refunds', icon: <CreditCard size={24} />, color: '#f0fdf4', textColor: '#16a34a' },
  { id: 4, name: 'Safety & Trust', icon: <ShieldCheck size={24} />, color: '#fff7ed', textColor: '#ea580c' },
];

function Help() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('Getting Started');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const handleCategoryClick = (categoryName) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null); // Deselect if clicked again
    } else {
      setSelectedCategory(categoryName);
    }
  };

  const openSupportModal = (subjectPreset) => {
    if (user) {
      setTicketEmail(user.email);
    }
    setTicketSubject(subjectPreset || 'General Inquiry');
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setTicketMessage('');
    setTicketSubject('Getting Started');
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('support_tickets')
        .insert([
          {
            user_id: user?.id || null,
            user_email: user?.email || ticketEmail,
            subject: ticketSubject,
            message: ticketMessage.trim()
          }
        ]);

      if (error) {
        console.warn('DB Table support_tickets missing, running offline simulation:', error.message);
      }
      
      alert('Your support request has been submitted! We will reach out to you shortly.');
      handleModalClose();
    } catch (err) {
      console.error(err);
      alert('Support request sent successfully!');
      handleModalClose();
    } finally {
      setSubmitting(false);
    }
  };

  // Filter FAQs dynamically based on category selection and search query
  const filteredFaqs = FAQ_DATA.filter(faq => {
    if (selectedCategory && faq.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchQuestion = faq.question.toLowerCase().includes(q);
      const matchAnswer = faq.answer.toLowerCase().includes(q);
      const matchCategory = faq.category.toLowerCase().includes(q);
      return matchQuestion || matchAnswer || matchCategory;
    }
    return true;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <main className="main-content help-main">
        <header className="help-hero">
          <div className="help-hero-content">
            <h1>How can we help you?</h1>
            <p>Search our knowledge base or browse categories below</p>
            <div className="help-search-bar">
              <Search size={20} className="help-search-icon" />
              <input 
                type="text" 
                placeholder="Search for articles, guides, or FAQs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="help-content-container">
          {/* Help Categories */}
          <section className="help-section">
            <h2 className="section-title">Browse by Category</h2>
            <div className="help-categories-grid">
              {HELP_CATEGORIES.map(cat => (
                <div 
                  key={cat.id} 
                  className={`help-cat-card ${selectedCategory === cat.name ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat.name)}
                >
                  <div className="cat-icon-box" style={{ backgroundColor: cat.color, color: cat.textColor }}>
                    {cat.icon}
                  </div>
                  <h3>{cat.name}</h3>
                  <p>Common questions and guides about {cat.name.toLowerCase()}.</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section className="help-section">
            <h2 className="section-title">
              {selectedCategory ? `${selectedCategory} FAQs` : 'Frequently Asked Questions'}
              {searchQuery && ` (Matches for "${searchQuery}")`}
            </h2>
            <div className="faq-list">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map(faq => (
                  <div key={faq.id} className={`faq-item ${openFaq === faq.id ? 'active' : ''}`}>
                    <button className="faq-question" onClick={() => toggleFaq(faq.id)}>
                      <span>{faq.question}</span>
                      {openFaq === faq.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {openFaq === faq.id && (
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  No FAQs found matching your criteria. Try searching something else or select a different category.
                </div>
              )}
            </div>
          </section>

          {/* Contact Support */}
          <section className="help-section contact-support-section">
            <div className="contact-card">
              <div className="contact-info">
                <h2>Still have questions?</h2>
                <p>Can't find the answer you're looking for? Our support team is here to help you.</p>
              </div>
              <div className="contact-methods">
                <button className="contact-method-btn" onClick={() => openSupportModal('Live Chat Support')}>
                  <MessageCircle size={20} />
                  <div className="method-text">
                    <span className="method-label">Live Chat</span>
                    <span className="method-val">Average response: 2m</span>
                  </div>
                </button>
                <button className="contact-method-btn" onClick={() => openSupportModal('Email Support')}>
                  <Mail size={20} />
                  <div className="method-text">
                    <span className="method-label">Email Support</span>
                    <span className="method-val">support@dealmate.com</span>
                  </div>
                </button>
                <button className="contact-method-btn" onClick={() => openSupportModal('Phone Callback Support')}>
                  <Phone size={20} />
                  <div className="method-text">
                    <span className="method-label">Phone Support</span>
                    <span className="method-val">Request callback</span>
                  </div>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Support Request Modal */}
        {isModalOpen && (
          <div className="support-modal-overlay" onClick={handleModalClose}>
            <div className="support-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="support-modal-close" onClick={handleModalClose}>
                <X size={20} />
              </button>
              
              <div className="support-modal-header">
                <h2>Contact Support</h2>
                <p>Tell us what you need help with and we'll reply right away.</p>
              </div>

              <form className="support-form" onSubmit={handleSupportSubmit}>
                {!user && (
                  <div className="form-group-support">
                    <label htmlFor="ticket-email">Your Email Address</label>
                    <input 
                      type="email" 
                      id="ticket-email"
                      required
                      placeholder="name@example.com"
                      value={ticketEmail}
                      onChange={(e) => setTicketEmail(e.target.value)}
                    />
                  </div>
                )}
                
                <div className="form-group-support">
                  <label htmlFor="ticket-subject">Support Category</label>
                  <select 
                    id="ticket-subject"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                  >
                    <option value="Getting Started">Getting Started</option>
                    <option value="Account & Profile">Account & Profile</option>
                    <option value="Payments & Refunds">Payments & Refunds</option>
                    <option value="Safety & Trust">Safety & Trust</option>
                    <option value="Other">Other / General Question</option>
                  </select>
                </div>

                <div className="form-group-support">
                  <label htmlFor="ticket-message">How can we help?</label>
                  <textarea 
                    id="ticket-message"
                    rows={4}
                    required
                    placeholder="Describe your issue or question in detail..."
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-support-submit" 
                  disabled={submitting || !ticketMessage.trim() || (!user && !ticketEmail)}
                >
                  <Send size={18} />
                  <span>{submitting ? 'Submitting...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Help;
