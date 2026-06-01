import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, Users, Flame, Clock, Trash2, MoreHorizontal } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import './Notifications.css';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'success',
    title: 'Group Completed!',
    message: 'Your MacBook Pro group is full. You can now complete your purchase with the 40% discount.',
    time: '5 mins ago',
    read: false,
    category: 'deals'
  },
  {
    id: 2,
    type: 'group',
    title: 'New Member Joined',
    message: 'Sarah Miller joined your "iPhone 15 Pro Max" group. Only 1 more person needed!',
    time: '2 hours ago',
    read: false,
    category: 'groups'
  },
  {
    id: 3,
    type: 'trending',
    title: 'Trending Deal',
    message: 'The Sony WH-1000XM5 headphones deal is filling up fast in Mumbai!',
    time: '5 hours ago',
    read: true,
    category: 'deals'
  },
  {
    id: 4,
    type: 'expiry',
    title: 'Deal Expiring Soon',
    message: 'Your saved deal "Premium Winter Puffer Jacket" expires in 3 hours.',
    time: '1 day ago',
    read: true,
    category: 'deals'
  }
];

function Notifications() {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('dealmate_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Unread' | 'Deals' | 'Groups'
  const [activeMenuId, setActiveMenuId] = useState(null);

  useEffect(() => {
    localStorage.setItem('dealmate_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="icon-success" />;
      case 'group':
        return <Users size={20} className="icon-group" />;
      case 'trending':
        return <Flame size={20} className="icon-trending" />;
      case 'expiry':
        return <Clock size={20} className="icon-expiry" />;
      default:
        return <Bell size={20} className="icon-default" />;
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteAll = () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      setNotifications([]);
    }
  };

  const handleToggleRead = (id) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        return { ...n, read: !n.read };
      }
      return n;
    }));
  };

  const handleDeleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLoadOlder = () => {
    const older = [
      {
        id: 101,
        type: 'group',
        title: 'New Member Joined',
        message: 'David K. joined your "Ergonomic Office Chair" group.',
        time: '3 days ago',
        read: true,
        category: 'groups'
      },
      {
        id: 102,
        type: 'trending',
        title: 'Hot Deal in Fashion',
        message: 'Levi\'s 501 jeans deal has reached 90% member participation!',
        time: '5 days ago',
        read: true,
        category: 'deals'
      }
    ];
    setNotifications(prev => {
      const existingIds = prev.map(n => n.id);
      const uniqueOlder = older.filter(o => !existingIds.includes(o.id));
      return [...prev, ...uniqueOlder];
    });
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'Unread') return !notif.read;
    if (activeTab === 'Deals') return notif.category === 'deals';
    if (activeTab === 'Groups') return notif.category === 'groups';
    return true;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <main className="main-content">
        <header className="content-header">
          <div>
            <h1 className="notifications-title">
              <Bell className="bell-icon" size={28} />
              Notifications
            </h1>
            <p className="page-subtitle">Stay updated on your deals and group activity</p>
          </div>
          <div className="notification-actions-header">
            <button className="btn-secondary-light" onClick={handleMarkAllAsRead}>
              Mark all as read
            </button>
            <button className="btn-icon-grey" onClick={handleDeleteAll}>
              <Trash2 size={20} />
            </button>
          </div>
        </header>

        <div className="notifications-list-container">
          <div className="notifications-tabs">
            {['All', 'Unread', 'Deals', 'Groups'].map(tab => (
              <button 
                key={tab}
                className={`notif-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="notifications-list">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notification-card ${notif.read ? 'read' : 'unread'}`}
                  onClick={() => handleToggleRead(notif.id)}
                >
                  <div className="notif-icon-container">
                    {getIcon(notif.type)}
                  </div>
                  
                  <div className="notif-content-detail">
                    <div className="notif-header-row">
                      <h3>{notif.title}</h3>
                      <span className="notif-time">{notif.time}</span>
                    </div>
                    <p>{notif.message}</p>
                  </div>

                  <div className="notif-actions" style={{ position: 'relative' }}>
                    {!notif.read && <div className="unread-dot"></div>}
                    <button 
                      className="btn-notif-more"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === notif.id ? null : notif.id);
                      }}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {activeMenuId === notif.id && (
                      <div className="notif-menu-dropdown">
                        <button onClick={() => handleToggleRead(notif.id)}>
                          {notif.read ? 'Mark as Unread' : 'Mark as Read'}
                        </button>
                        <button className="delete-btn" onClick={() => handleDeleteNotification(notif.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="notifications-empty">
                <Bell size={48} />
                <p>No notifications found in this tab.</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notifications-footer">
              <button className="btn-load-more" onClick={handleLoadOlder}>
                Load older notifications
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Notifications;
