import { useState } from 'react';
import { register } from '../api';

export default function Register({ onRegisterSuccess, onSwitchToLogin, addToast }) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !fullName || !email || !password) {
      addToast('Vui lòng điền đầy đủ các thông tin bắt buộc', 'error');
      return;
    }
    if (password !== confirmPassword) {
      addToast('Mật khẩu xác nhận không khớp', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await register({
        username,
        password,
        full_name: fullName,
        email,
        phone
      });
      addToast('Đăng ký tài khoản thành công! 🎉');
      onRegisterSuccess(res.data.token, res.data.user);
    } catch (err) {
      addToast(err.message || 'Đăng ký tài khoản thất bại', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container animate-fade">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">📝</span>
            <h2>Đăng Ký Tài Khoản</h2>
          </div>
          <p className="auth-subtitle">Tham gia EventHub để đăng ký các sự kiện hấp dẫn</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Tên đăng nhập *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Họ và tên *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nhập họ và tên của bạn"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-input"
                placeholder="example@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input
                type="text"
                className="form-input"
                placeholder="0901234567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mật khẩu *</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu *</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? <span className="spinner spinner-sm"></span> : 'Đăng ký tài khoản'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Đã có tài khoản?</span>
          <button className="auth-switch-btn" onClick={onSwitchToLogin}>
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
}
