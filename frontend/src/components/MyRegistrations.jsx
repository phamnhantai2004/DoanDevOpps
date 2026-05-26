import { useState, useEffect } from 'react';
import { getRegistrations, cancelRegistration } from '../api';

export default function MyRegistrations({ onViewEvent, addToast }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyRegistrations();
  }, []);

  async function loadMyRegistrations() {
    try {
      const res = await getRegistrations();
      setRegistrations(res.data || []);
    } catch (err) {
      addToast(err.message || 'Lỗi khi tải danh sách đăng ký', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(regId) {
    if (!confirm('Bạn có chắc chắn muốn hủy đăng ký tham gia sự kiện này?')) return;
    try {
      await cancelRegistration(regId);
      addToast('Đã hủy đăng ký sự kiện thành công');
      loadMyRegistrations();
    } catch (err) {
      addToast(err.message || 'Lỗi khi hủy đăng ký', 'error');
    }
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-fade">
      <div className="section-header">
        <h1 className="section-title">🎟️ Sự kiện của tôi ({registrations.length})</h1>
      </div>

      {registrations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎟️</div>
          <div className="empty-text">Bạn chưa đăng ký sự kiện nào</div>
          <div className="empty-sub">Hãy khám phá danh sách sự kiện và đăng ký tham gia ngay!</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên sự kiện</th>
                <th>Ngày diễn ra</th>
                <th>Ngày đăng ký</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg, index) => (
                <tr key={reg.id}>
                  <td>{index + 1}</td>
                  <td>
                    <button
                      className="link-btn"
                      onClick={() => onViewEvent(reg.event_id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        padding: 0,
                        fontSize: 'inherit',
                        fontFamily: 'inherit'
                      }}
                      onMouseEnter={e => e.target.style.color = 'var(--accent-primary)'}
                      onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}
                    >
                      {reg.event_title}
                    </button>
                  </td>
                  <td>{formatDate(reg.event_date)}</td>
                  <td>{reg.registered_at ? new Date(reg.registered_at).toLocaleDateString('vi-VN') : ''}</td>
                  <td>
                    <span className={`badge badge-${reg.status}`}>
                      {reg.status === 'confirmed' ? 'Đã xác nhận' : 'Đã hủy'}
                    </span>
                  </td>
                  <td>
                    {reg.status === 'confirmed' ? (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(reg.id)}
                      >
                        Hủy đăng ký
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Không có thao tác</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
