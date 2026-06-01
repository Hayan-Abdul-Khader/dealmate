import React from 'react';
import { UserCheck, ShieldCheck, Clock, MapPin } from 'lucide-react';
import './MemberList.css';

function MemberList({ members = [], creatorId, requiredMembers = 5 }) {
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const filledSlots = members.length;
  const remainingSlots = Math.max(0, requiredMembers - filledSlots);

  return (
    <div className="member-list-container">
      <div className="member-list-header">
        <UserCheck size={20} />
        <h3>Group Members</h3>
        <span className="member-count">{filledSlots} / {requiredMembers} Joined</span>
      </div>

      <div className="members-grid">
        {members.map((member, index) => {
          const isLeader = member.user_id === creatorId;
          const name = member.profiles?.full_name || 'Anonymous User';
          const initials = getInitials(name);
          const location = member.profiles?.city || 'Online';
          const joinedTime = formatDate(member.joined_at);

          return (
            <div key={member.id || index} className={`member-card-item ${isLeader ? 'leader-card' : ''}`}>
              <div className="member-avatar-large">
                {initials}
                {isLeader && (
                  <div className="leader-badge-icon" title="Group Leader">
                    <ShieldCheck size={14} />
                  </div>
                )}
              </div>
              
              <div className="member-info-detail">
                <div className="member-name-row">
                  <h4>{name}</h4>
                  {isLeader && <span className="role-tag">Leader</span>}
                </div>
                
                <div className="member-meta-grid">
                  <div className="meta-info-item">
                    <MapPin size={12} />
                    <span>{location}</span>
                  </div>
                  <div className="meta-info-item">
                    <Clock size={12} />
                    <span>Joined {joinedTime}</span>
                  </div>
                </div>

                <div className="status-pill verified">
                  <ShieldCheck size={12} />
                  <span>Verified Buyer</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty Slot Placeholders */}
        {[...Array(remainingSlots)].map((_, i) => (
          <div key={`placeholder-${i}`} className="member-card-item placeholder-card">
            <div className="member-avatar-placeholder">?</div>
            <div className="member-info-detail">
              <h4>Waiting for member...</h4>
              <p>{remainingSlots} more {remainingSlots === 1 ? 'person' : 'people'} needed to unlock deal</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MemberList;
