import { useState, useEffect } from 'react';
import { getEventStats, getEvents } from '../api';

export default function Dashboard({ onViewEvent, onCreateEvent }) {
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          getEventStats(),
          getEvents()
        ]);
        setStats(statsRes.data);
        setRecentEvents(eventsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const upcoming = recentEvents.filter(e => e.status === 'upcoming').slice(0, 4);

  return (
    <div className="animate-fade">
      <div className="section-header">
        <h1 className="section-title">📊 Tổng quan hệ thống</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-label">Tổng sự kiện</div>
          <div className="stat-value">{stats?.totalEvents || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-label">Sắp diễn ra</div>
          <div className="stat-value">{stats?.upcoming || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔴</div>
          <div className="stat-label">Đang diễn ra</div>
          <div className="stat-value">{stats?.ongoing || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-label">Đã hoàn thành</div>
          <div className="stat-value">{stats?.completed || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-label">Tổng đăng ký</div>
          <div className="stat-value">{stats?.totalRegistrations || 0}</div>
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-title">🎯 Sự kiện sắp diễn ra</h2>
        <button className="btn btn-primary" onClick={onCreateEvent}>➕ Tạo sự kiện mới</button>
      </div>

      {upcoming.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-text">Chưa có sự kiện sắp diễn ra</div>
          <div className="empty-sub">Tạo sự kiện mới để bắt đầu!</div>
        </div>
      ) : (
        <div className="events-grid">
          {upcoming.map(event => (
            <div key={event.id} className="event-card" onClick={() => onViewEvent(event.id)}>
              <div className="event-card-header">
                <div className="event-title">{event.title}</div>
                <span className={`badge badge-${event.status}`}>{statusLabel(event.status)}</span>
              </div>
              <div className="event-desc">{event.description}</div>
              <div className="event-meta">
                <div className="event-meta-item">
                  <span className="event-meta-icon">📍</span>
                  {event.location || 'Chưa xác định'}
                </div>
                <div className="event-meta-item">
                  <span className="event-meta-icon">🗓️</span>
                  {formatDate(event.event_date)}
                </div>
              </div>
              <div className="event-footer">
                <div className="participants-bar">
                  <span>👥 {event.registered_count || 0}{event.max_participants > 0 ? `/${event.max_participants}` : ''}</span>
                  {event.max_participants > 0 && (
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${getProgressClass(event.registered_count, event.max_participants)}`}
                        style={{ width: `${Math.min(100, ((event.registered_count || 0) / event.max_participants) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Xem chi tiết →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function statusLabel(status) {
  const map = { upcoming: 'Sắp diễn ra', ongoing: 'Đang diễn ra', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
  return map[status] || status;
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getProgressClass(count, max) {
  const pct = (count / max) * 100;
  if (pct >= 100) return 'full';
  if (pct >= 75) return 'high';
  return '';
}
