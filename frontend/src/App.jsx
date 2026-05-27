import { useState, useCallback, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import EventList from './components/EventList';
import EventDetail from './components/EventDetail';
import EventForm from './components/EventForm';
import Toast from './components/Toast';
import Login from './components/Login';
import Register from './components/Register';
import MyRegistrations from './components/MyRegistrations';
import UserManagement from './components/UserManagement';
import { getMe } from './api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Default page is dashboard for Admin, events for everyone else
  const [page, setPage] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      const u = savedUser ? JSON.parse(savedUser) : null;
      return u && u.role === 'admin' ? 'dashboard' : 'events';
    } catch {
      return 'events';
    }
  });

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    addToast('Đăng nhập thành công');
    if (newUser.role === 'admin') {
      setPage('dashboard');
    } else {
      setPage('events');
    }
  };

  const handleRegisterSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    addToast('Đăng ký tài khoản thành công');
    setPage('events');
  };

  const handleLogout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    addToast('Đã đăng xuất tài khoản');
    setPage('events');
    setSelectedEventId(null);
  }, [addToast]);

  // Verify token on mount or token change
  useEffect(() => {
    if (token) {
      getMe()
        .then(res => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch(err => {
          console.error("Token verification failed", err);
          handleLogout();
        });
    }
  }, [token, handleLogout]);

  const viewEvent = (id) => {
    setSelectedEventId(id);
    setPage('detail');
  };

  const openCreateForm = () => {
    setEditEvent(null);
    setShowEventForm(true);
  };

  const openEditForm = (event) => {
    setEditEvent(event);
    setShowEventForm(true);
  };

  const handleFormSuccess = (msg) => {
    setShowEventForm(false);
    setEditEvent(null);
    addToast(msg);
    refresh();
  };

  const goBack = () => {
    setSelectedEventId(null);
    setPage('events');
  };

  const navigateTo = (destination) => {
    setSelectedEventId(null);
    setPage(destination);
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={() => { navigateTo(isAdmin ? 'dashboard' : 'events'); }}>
            <div className="logo-icon">📅</div>
            EventHub
          </div>
          <nav className="nav">
            {/* Admin Menu */}
            {isAdmin && (
              <>
                <button
                  className={`nav-btn ${page === 'dashboard' ? 'active' : ''}`}
                  onClick={() => navigateTo('dashboard')}
                >
                  📊 Tổng quan
                </button>
                <button
                  className={`nav-btn ${page === 'events' || page === 'detail' ? 'active' : ''}`}
                  onClick={() => navigateTo('events')}
                >
                  📋 Quản lý sự kiện
                </button>
                <button
                  className={`nav-btn ${page === 'users' ? 'active' : ''}`}
                  onClick={() => navigateTo('users')}
                >
                  👥 Quản lý người dùng
                </button>
                <button className="nav-btn" onClick={openCreateForm}>
                  ➕ Tạo sự kiện
                </button>
              </>
            )}

            {/* Regular User Menu */}
            {user && !isAdmin && (
              <>
                <button
                  className={`nav-btn ${page === 'events' || page === 'detail' ? 'active' : ''}`}
                  onClick={() => navigateTo('events')}
                >
                  📋 Sự kiện
                </button>
                <button
                  className={`nav-btn ${page === 'my-registrations' ? 'active' : ''}`}
                  onClick={() => navigateTo('my-registrations')}
                >
                  🎟️ Sự kiện của tôi
                </button>
              </>
            )}

            {/* Guest Menu */}
            {!user && (
              <>
                <button
                  className={`nav-btn ${page === 'events' || page === 'detail' ? 'active' : ''}`}
                  onClick={() => navigateTo('events')}
                >
                  📋 Sự kiện
                </button>
                <button
                  className={`nav-btn ${page === 'login' ? 'active' : ''}`}
                  onClick={() => navigateTo('login')}
                >
                  🔑 Đăng nhập
                </button>
                <button
                  className={`nav-btn ${page === 'register' ? 'active' : ''}`}
                  onClick={() => navigateTo('register')}
                >
                  📝 Đăng ký
                </button>
              </>
            )}
          </nav>

          {/* User Profile / Logout section */}
          {user && (
            <div className="user-profile-nav">
              <span className="welcome-text">
                {isAdmin ? '👑' : '👤'} {user.full_name}
              </span>
              <button className="logout-btn" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="main">
        {page === 'dashboard' && isAdmin && (
          <Dashboard
            key={refreshKey}
            onViewEvent={viewEvent}
            onCreateEvent={openCreateForm}
          />
        )}
        {page === 'users' && isAdmin && (
          <UserManagement
            key={refreshKey}
            addToast={addToast}
          />
        )}
        {(page === 'events' || (page === 'dashboard' && !isAdmin)) && (
          <EventList
            key={refreshKey}
            onViewEvent={viewEvent}
            onCreateEvent={openCreateForm}
            onEditEvent={openEditForm}
            addToast={addToast}
            refresh={refresh}
            currentUser={user}
          />
        )}
        {page === 'my-registrations' && user && (
          <MyRegistrations
            key={refreshKey}
            onViewEvent={viewEvent}
            addToast={addToast}
          />
        )}
        {page === 'detail' && selectedEventId && (
          <EventDetail
            key={`${selectedEventId}-${refreshKey}`}
            eventId={selectedEventId}
            onBack={goBack}
            onEdit={openEditForm}
            addToast={addToast}
            refresh={refresh}
            currentUser={user}
            onNavigate={navigateTo}
          />
        )}
        {page === 'login' && !user && (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setPage('register')}
            addToast={addToast}
          />
        )}
        {page === 'register' && !user && (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setPage('login')}
            addToast={addToast}
          />
        )}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '1rem',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border)',
        marginTop: 'auto'
      }}>
        EventHub v1.0.0 &copy; {new Date().getFullYear()} &mdash; Hệ thống quản lý sự kiện
      </footer>

      {showEventForm && isAdmin && (
        <EventForm
          event={editEvent}
          onClose={() => { setShowEventForm(false); setEditEvent(null); }}
          onSuccess={handleFormSuccess}
          addToast={addToast}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}

export default App;
