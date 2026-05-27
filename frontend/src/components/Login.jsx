import { useState } from 'react';
import { login } from '../api';

export default function Login({ onLoginSuccess, onSwitchToRegister, addToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password) {
      addToast('Vui lòng nhập tên đăng nhập và mật khẩu', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await login({ username, password });
      addToast('Đăng nhập thành công! Chào mừng trở lại 🎉');
      onLoginSuccess(res.data.token, res.data.user);
    } catch (err) {
      addToast(err.message || 'Đăng nhập thất bại', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container animate-fade">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">🔑</span>
            <h2>Đăng Nhập</h2>
          </div>
          <p className="auth-subtitle">Chào mừng bạn đến với EventHub</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Tên đăng nhập hoặc Email</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nhập tên đăng nhập hoặc email"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
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

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? <span className="spinner spinner-sm"></span> : 'Đăng nhập'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Chưa có tài khoản?</span>
          <button className="auth-switch-btn" onClick={onSwitchToRegister}>
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
}
