import { useState } from 'react';
import { createEvent, updateEvent } from '../api';

export default function EventForm({ event, onClose, onSuccess, addToast }) {
  const isEdit = !!event?.id;
  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    location: event?.location || '',
    event_date: event?.event_date || '',
    max_participants: event?.max_participants || 0,
    status: event?.status || 'upcoming',
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.event_date) {
      addToast('Vui lòng nhập tiêu đề và ngày sự kiện', 'error');
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateEvent(event.id, { ...form, max_participants: Number(form.max_participants) });
        onSuccess('Đã cập nhật sự kiện! ✅');
      } else {
        await createEvent({ ...form, max_participants: Number(form.max_participants) });
        onSuccess('Đã tạo sự kiện mới! 🎉');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? '✏️ Sửa sự kiện' : '➕ Tạo sự kiện mới'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Tiêu đề sự kiện *</label>
              <input
                className="form-input"
                placeholder="VD: Workshop React & Node.js"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mô tả</label>
              <textarea
                className="form-textarea"
                placeholder="Mô tả chi tiết về sự kiện..."
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">📍 Địa điểm</label>
              <input
                className="form-input"
                placeholder="VD: Đại học Bách Khoa TP.HCM"
                value={form.location}
                onChange={e => handleChange('location', e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">🗓️ Ngày tổ chức *</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.event_date}
                  onChange={e => handleChange('event_date', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">👥 Số người tối đa</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="0 = không giới hạn"
                  value={form.max_participants}
                  onChange={e => handleChange('max_participants', e.target.value)}
                />
              </div>
            </div>
            {isEdit && (
              <div className="form-group">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={e => handleChange('status', e.target.value)}
                >
                  <option value="upcoming">Sắp diễn ra</option>
                  <option value="ongoing">Đang diễn ra</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Đang xử lý...' : isEdit ? '💾 Lưu thay đổi' : '✅ Tạo sự kiện'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
