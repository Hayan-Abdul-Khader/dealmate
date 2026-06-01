import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './GroupDiscussion.css';

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const getInitials = (fullName) => {
  if (!fullName) return '?';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

function GroupDiscussion({ dealId }) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    if (dealId) {
      fetchComments();
      
      // Real-time channel subscription
      const channel = supabase
        .channel(`deal-discussion-${dealId}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'deal_discussion', 
          filter: `deal_id=eq.${dealId}` 
        }, () => {
          fetchComments();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [dealId]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('deal_discussion')
        .select('*, profiles(full_name, avatar_url)')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;

    try {
      // Ensure profile exists (workaround for RLS/signup sync issues)
      const { data: profileData, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
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
      } else if (profileCheckError) {
        throw profileCheckError;
      }

      const { error } = await supabase
        .from('deal_discussion')
        .insert([
          {
            deal_id: dealId,
            user_id: user.id,
            message: comment.trim(),
            type: 'user'
          }
        ]);

      if (error) throw error;
      setComment('');
      fetchComments();
    } catch (err) {
      alert('Error sending message: ' + err.message);
    }
  };

  const currentUserInitials = user?.user_metadata?.full_name 
    ? getInitials(user.user_metadata.full_name) 
    : user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <div className="discussion-container">
      <div className="discussion-header">
        <MessageSquare size={20} />
        <h3>Group Discussion</h3>
        <span className="comment-count">
          {comments.filter(c => c.type === 'user').length} Comments
        </span>
      </div>

      <div className="comments-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>Loading comments...</div>
        ) : comments.length > 0 ? (
          comments.map((item) => {
            const isSystem = item.type === 'system';
            const authorName = isSystem ? 'System' : (item.profiles?.full_name || 'User');
            const authorInitials = isSystem ? null : getInitials(authorName);

            return (
              <div key={item.id} className={`comment-item ${isSystem ? 'system-msg' : ''}`}>
                {!isSystem && (
                  <div className="comment-avatar">{authorInitials}</div>
                )}
                <div className="comment-content">
                  {!isSystem && (
                    <div className="comment-meta">
                      <span className="user-name">{authorName}</span>
                      <span className="comment-time">{formatTimeAgo(item.created_at)}</span>
                    </div>
                  )}
                  <div className="comment-text">
                    {item.message}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
            No comments yet. Start the conversation!
          </div>
        )}
        <div ref={commentsEndRef} />
      </div>

      <form onSubmit={handleSend} className="comment-input-wrapper">
        <div className="user-mini-avatar">{currentUserInitials}</div>
        <div className="input-container">
          <input 
            type="text" 
            placeholder="Ask a question or share your thoughts..." 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button type="submit" className="btn-send" disabled={!comment.trim()}>
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default GroupDiscussion;
