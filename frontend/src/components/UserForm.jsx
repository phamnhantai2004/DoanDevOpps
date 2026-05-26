import { useState } from 'react';
import { createUser, updateUser } from '../api';

export default function UserForm({ user, onClose, onSuccess, addToast }) {
  const isEdit = !!user?.id;
  const [form, setForm] = useState({
    username: user?.username || '',
    password: '',
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'user',
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.username || !form.full_name || !form.email) {
      addToast('Vui lòng điền đầy đủ các thông tin bắt buộc', 'error');
      return;
    }
    
    if (!isEdit && !form.password) {
      addToast('Vui lòng nhập mật khẩu cho tài khoản mới', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        // Gửi thông tin cập nhật, chỉ gửi password nếu người dùng có điền mật khẩu mới
        const submitData = { ...form };
        if (!submitData.password) {
          delete submitData.password;
        }
        await updateUser(user.id, submitData);
        onSuccess('Đã cập nhật thông tin người dùng! ✅');
      } else {
        await createUser(form);
        onSuccess('Đã thêm người dùng mới thành công! 🎉');
      }
    } catch (err) {
      addToast(err.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? '✏️ Chỉnh sửa người dùng' : '👤 Thêm người dùng mới'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Tên đăng nhập (Username) *</label>
              <input
                className="form-input"
                placeholder="VD: nguyenvanan"
                value={form.username}
                onChange={e => handleChange('username', e.target.value)}
                disabled={isEdit}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Mật khẩu {isEdit ? '' : '*'}</label>
              <input
                className="form-input"
                type="password"
                placeholder={isEdit ? 'Nhập mật khẩu mới nếu muốn đổi (bỏ trống để giữ nguyên)' : 'Nhập mật khẩu tài khoản'}
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                required={!isEdit}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input
                className="form-input"
                placeholder="VD: Nguyễn Văn An"
                value={form.full_name}
                onChange={e => handleChange('full_name', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                className="form-input"
                type="email"
                placeholder="VD: an.nguyen@example.com"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input
                  className="form-input"
                  placeholder="VD: 0987654321"
                  value={form.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Vai trò *</label>
                <select
                  className="form-select"
                  value={form.role}
                  onChange={e => handleChange('role', e.target.value)}
                  required
                >
                  <option value="user">Người dùng thường (User)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Đang xử lý...' : isEdit ? '💾 Lưu thay đổi' : '✅ Thêm người dùng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
