import { useState, useEffect } from 'react';
import { getEvent, createRegistration, cancelRegistration, deleteRegistration, deleteEvent, updateEvent } from '../api';

export default function EventDetail({ eventId, onBack, onEdit, addToast, refresh, currentUser, onNavigate }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegForm, setShowRegForm] = useState(false);
  const [regForm, setRegForm] = useState({ full_name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadEvent(); }, [eventId]);

  useEffect(() => {
    if (currentUser) {
      setRegForm({
        full_name: currentUser.full_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      });
    }
  }, [currentUser]);

  async function loadEvent() {
    try {
      const res = await getEvent(eventId);
      setEvent(res.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!regForm.full_name || !regForm.email) {
      addToast('Vui lòng nhập họ tên và email', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await createRegistration({ event_id: eventId, ...regForm });
      addToast('Đăng ký tham gia thành công! 🎉');
      setShowRegForm(false);
      loadEvent();
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelReg(regId) {
    if (!confirm('Bạn có muốn hủy đăng ký tham gia sự kiện này?')) return;
    try {
      await cancelRegistration(regId);
      addToast('Đã hủy đăng ký sự kiện');
      loadEvent();
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleDeleteReg(regId) {
    if (!confirm('Xóa đăng ký này?')) return;
    try {
      await deleteRegistration(regId);
      addToast('Đã xóa đăng ký');
      loadEvent();
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleDeleteEvent() {
    if (!confirm('Bạn có chắc muốn xóa sự kiện này? Tất cả đăng ký sẽ bị xóa.')) return;
    try {
      await deleteEvent(eventId);
      addToast('Đã xóa sự kiện');
      refresh();
      onBack();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleStatusChange(newStatus) {
    try {
      await updateEvent(eventId, { status: newStatus });
      addToast(`Đã cập nhật trạng thái: ${statusLabel(newStatus)}`);
      loadEvent();
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!event) return <div className="empty-state"><div className="empty-text">Không tìm thấy sự kiện</div></div>;

  const confirmedRegs = (event.registrations || []).filter(r => r.status === 'confirmed');
  const cancelledRegs = (event.registrations || []).filter(r => r.status === 'cancelled');
  const isFull = event.max_participants > 0 && confirmedRegs.length >= event.max_participants;

  // Check if current user is registered
  const myReg = currentUser ? (event.registrations || []).find(r => r.user_id === currentUser.id) : null;
  const isRegistered = myReg && myReg.status === 'confirmed';
  const isCancelled = myReg && myReg.status === 'cancelled';
  const isAdmin = currentUser && currentUser.role === 'admin';

  return (
    <div className="animate-fade">
      <button className="back-btn" onClick={onBack}>← Quay lại danh sách</button>

      <div className="detail-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <h1 className="detail-title">{event.title}</h1>
              <span className={`badge badge-${event.status}`}>{statusLabel(event.status)}</span>
            </div>
            <p className="detail-desc">{event.description || 'Không có mô tả'}</p>
          </div>
          
          {isAdmin && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                value={event.status}
                onChange={e => handleStatusChange(e.target.value)}
                style={{ width: 'auto', minWidth: '140px' }}
              >
                <option value="upcoming">Sắp diễn ra</option>
                <option value="ongoing">Đang diễn ra</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
              <button className="btn btn-secondary btn-sm" onClick={() => onEdit(event)}>✏️ Sửa</button>
              <button className="btn btn-danger btn-sm" onClick={handleDeleteEvent}>🗑️ Xóa</button>
            </div>
          )}
        </div>

        <div className="detail-info-grid" style={{ marginTop: '1.5rem' }}>
          <div className="detail-info-item">
            <span className="detail-info-label">📍 Địa điểm</span>
            <span className="detail-info-value">{event.location || 'Chưa xác định'}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">🗓️ Ngày tổ chức</span>
            <span className="detail-info-value">{formatDate(event.event_date)}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">👥 Số người đăng ký</span>
            <span className="detail-info-value">
              {confirmedRegs.length}{event.max_participants > 0 ? ` / ${event.max_participants}` : ''} người
            </span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">📅 Ngày tạo</span>
            <span className="detail-info-value">{event.created_at ? new Date(event.created_at).toLocaleDateString('vi-VN') : ''}</span>
          </div>
        </div>

        {event.max_participants > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <div className="progress-bar" style={{ width: '100%', height: '8px' }}>
              <div
                className={`progress-fill ${getProgressClass(confirmedRegs.length, event.max_participants)}`}
                style={{ width: `${Math.min(100, (confirmedRegs.length / event.max_participants) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* User Registration Section */}
      {!isAdmin && (
        <div style={{ marginBottom: '2rem' }}>
          {!currentUser ? (
            <div className="detail-card" style={{ textAlign: 'center', border: '1px dashed var(--border-color)', background: 'var(--bg-glass)' }}>
              <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                Vui lòng đăng nhập để đăng ký tham gia sự kiện này.
              </p>
              <button className="btn btn-primary" onClick={() => onNavigate('login')}>
                🔑 Đăng nhập ngay
              </button>
            </div>
          ) : isRegistered ? (
            <div className="detail-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0, 184, 148, 0.3)', background: 'rgba(0, 184, 148, 0.05)' }}>
              <div>
                <h3 style={{ color: 'var(--accent-success)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>✓</span> Bạn đã đăng ký sự kiện này thành công
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Họ tên: {myReg.full_name} | Email: {myReg.email}
                </p>
              </div>
              {event.status === 'upcoming' && (
                <button className="btn btn-danger btn-sm" onClick={() => handleCancelReg(myReg.id)}>
                  Hủy đăng ký
                </button>
              )}
            </div>
          ) : isCancelled ? (
            <div className="detail-card" style={{ border: '1px solid rgba(225, 112, 85, 0.3)', background: 'rgba(225, 112, 85, 0.05)' }}>
              <h3 style={{ color: 'var(--accent-danger)', marginBottom: '0.25rem' }}>
                ✕ Đăng ký của bạn đã bị hủy
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Bạn đã hủy lượt đăng ký của sự kiện này trước đó.
              </p>
              {event.status !== 'cancelled' && !isFull && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowRegForm(true)}>
                  Đăng ký lại
                </button>
              )}
            </div>
          ) : (
            <>
              {event.status !== 'cancelled' && event.status !== 'completed' && !isFull && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                  {!showRegForm && (
                    <button className="btn btn-primary btn-lg" onClick={() => setShowRegForm(true)} style={{ padding: '14px 28px' }}>
                      ➕ Đăng ký tham gia ngay
                    </button>
                  )}
                </div>
              )}
              {isFull && (
                <div className="detail-card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  ⚠️ Sự kiện đã hết chỗ đăng ký
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Registration Form Modal/Box for Logged In Users */}
      {showRegForm && !isAdmin && currentUser && (
        <div className="detail-card animate-slide" style={{ marginBottom: '1.5rem', border: '1px solid var(--border-glow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>📝 Điền thông tin đăng ký tham gia</h3>
            <button className="btn-icon" onClick={() => setShowRegForm(false)}>✕</button>
          </div>
          <form onSubmit={handleRegister}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Họ và tên *</label>
                <input
                  className="form-input"
                  placeholder="Nhập họ và tên"
                  value={regForm.full_name}
                  onChange={e => setRegForm({ ...regForm, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="example@email.com"
                  value={regForm.email}
                  onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input
                  className="form-input"
                  placeholder="0901234567"
                  value={regForm.phone}
                  onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRegForm(false)} style={{ width: '40%' }}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '60%' }}>
                  {submitting ? 'Đang xử lý...' : '✅ Xác nhận đăng ký'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Admin Participants Table (Only Visible to Admin) */}
      {isAdmin && (
        <>
          <div className="section-header" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">👥 Danh sách người tham gia ({confirmedRegs.length})</h2>
            <div className="section-actions">
              {event.status !== 'cancelled' && !isFull && (
                <button className="btn btn-primary" onClick={() => setShowRegForm(!showRegForm)}>
                  {showRegForm ? '✕ Đóng' : '➕ Đăng ký hộ (Admin)'}
                </button>
              )}
              {isFull && <span className="badge badge-cancelled" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Đã hết chỗ</span>}
            </div>
          </div>

          {showRegForm && (
            <div className="detail-card animate-slide" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>📝 Đăng ký cho thành viên</h3>
              <form onSubmit={handleRegister}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Họ và tên *</label>
                    <input
                      className="form-input"
                      placeholder="Nhập họ và tên"
                      value={regForm.full_name}
                      onChange={e => setRegForm({ ...regForm, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="example@email.com"
                      value={regForm.email}
                      onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      className="form-input"
                      placeholder="0901234567"
                      value={regForm.phone}
                      onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
                      {submitting ? 'Đang xử lý...' : '✅ Xác nhận đăng ký'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {confirmedRegs.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>SĐT</th>
                    <th>Ngày đăng ký</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmedRegs.map((reg, i) => (
                    <tr key={reg.id}>
                      <td>{i + 1}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{reg.full_name}</td>
                      <td>{reg.email}</td>
                      <td>{reg.phone || '—'}</td>
                      <td>{reg.registered_at ? new Date(reg.registered_at).toLocaleDateString('vi-VN') : ''}</td>
                      <td><span className="badge badge-confirmed">Đã xác nhận</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button className="btn btn-danger btn-sm" onClick={() => handleCancelReg(reg.id)}>Hủy</button>
                          <button className="btn-icon" title="Xóa" onClick={() => handleDeleteReg(reg.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <div className="empty-text">Chưa có người đăng ký</div>
              <div className="empty-sub">Hãy chia sẻ sự kiện để mọi người tham gia</div>
            </div>
          )}

          {cancelledRegs.length > 0 && (
            <>
              <h3 style={{ margin: '2rem 0 1rem', color: 'var(--text-muted)', fontSize: '1rem' }}>
                ❌ Đã hủy ({cancelledRegs.length})
              </h3>
              <div className="table-container" style={{ opacity: 0.7 }}>
                <table className="table">
                  <thead><tr><th>#</th><th>Họ tên</th><th>Email</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                  <tbody>
                    {cancelledRegs.map((reg, i) => (
                      <tr key={reg.id}>
                        <td>{i + 1}</td>
                        <td style={{ textDecoration: 'line-through' }}>{reg.full_name}</td>
                        <td style={{ textDecoration: 'line-through' }}>{reg.email}</td>
                        <td><span className="badge badge-cancelled">Đã hủy</span></td>
                        <td><button className="btn-icon" title="Xóa" onClick={() => handleDeleteReg(reg.id)}>🗑️</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function statusLabel(s) {
  return { upcoming: 'Sắp diễn ra', ongoing: 'Đang diễn ra', completed: 'Hoàn thành', cancelled: 'Đã hủy' }[s] || s;
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getProgressClass(count, max) {
  const pct = (count / max) * 100;
  if (pct >= 100) return 'full';
  if (pct >= 75) return 'high';
  return '';
}
