import { useState, useEffect } from 'react';
import { getEvents, deleteEvent } from '../api';

export default function EventList({ onViewEvent, onCreateEvent, onEditEvent, addToast, refresh, currentUser }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const isAdmin = currentUser && currentUser.role === 'admin';

  useEffect(() => {
    loadEvents();
  }, [filter]);

  async function loadEvents() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set('status', filter);
      if (search) params.set('search', search);
      const res = await getEvents(params.toString());
      setEvents(res.data || []);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    loadEvents();
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!confirm('Bạn có chắc muốn xóa sự kiện này?')) return;
    try {
      await deleteEvent(id);
      addToast('Đã xóa sự kiện');
      loadEvents();
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  return (
    <div className="animate-fade">
      <div className="section-header">
        <h1 className="section-title">📋 Danh sách sự kiện</h1>
        {isAdmin && <button className="btn btn-primary" onClick={onCreateEvent}>➕ Tạo sự kiện mới</button>}
      </div>

      <div className="filter-bar">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
          <input
            className="form-input"
            placeholder="🔍 Tìm kiếm sự kiện..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">Tìm</button>
        </form>
        <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="upcoming">Sắp diễn ra</option>
          <option value="ongoing">Đang diễn ra</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-text">Không tìm thấy sự kiện</div>
          <div className="empty-sub">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <div key={event.id} className="event-card" onClick={() => onViewEvent(event.id)}>
              <div className="event-card-header">
                <div className="event-title">{event.title}</div>
                <span className={`badge badge-${event.status}`}>{statusLabel(event.status)}</span>
              </div>
              <div className="event-desc">{event.description || 'Không có mô tả'}</div>
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
                
                {isAdmin ? (
                  <div style={{ display: 'flex', gap: '0.25rem' }} onClick={e => e.stopPropagation()}>
                    <button className="btn-icon" title="Sửa" onClick={() => onEditEvent(event)}>✏️</button>
                    <button className="btn-icon" title="Xóa" onClick={(e) => handleDelete(e, event.id)}>🗑️</button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Xem chi tiết →</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function statusLabel(s) {
  return { upcoming: 'Sắp diễn ra', ongoing: 'Đang diễn ra', completed: 'Hoàn thành', cancelled: 'Đã hủy' }[s] || s;
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('vi-VN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

function getProgressClass(count, max) {
  const pct = (count / max) * 100;
  if (pct >= 100) return 'full';
  if (pct >= 75) return 'high';
  return '';
}
