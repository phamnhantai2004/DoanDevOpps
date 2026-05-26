import { useState, useEffect } from 'react';
import { getUsers, deleteUser } from '../api';
import UserForm from './UserForm';

export default function UserManagement({ addToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // State quản lý Modal UserForm
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.data || []);
    } catch (err) {
      addToast(err.message || 'Lỗi khi tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(user) {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.username}" (Họ tên: ${user.full_name})?`)) {
      try {
        await deleteUser(user.id);
        addToast(`Đã xóa tài khoản "${user.username}" thành công`);
        loadUsers();
      } catch (err) {
        addToast(err.message || 'Lỗi khi xóa tài khoản', 'error');
      }
    }
  }

  function handleOpenCreate() {
    setEditingUser(null);
    setShowForm(true);
  }

  function handleOpenEdit(user) {
    setEditingUser(user);
    setShowForm(true);
  }

  function handleFormSuccess(msg) {
    setShowForm(false);
    setEditingUser(null);
    addToast(msg);
    loadUsers();
  }

  // Lọc danh sách người dùng theo query và role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone || '').includes(searchQuery);
      
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-fade">
      <div className="section-header">
        <h1 className="section-title">👥 Quản lý người dùng ({filteredUsers.length})</h1>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          👤 Thêm người dùng mới
        </button>
      </div>

      {/* Thanh lọc & tìm kiếm */}
      <div className="filter-bar">
        <input
          className="form-input"
          placeholder="Tìm kiếm username, tên, email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        
        <select
          className="form-select"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="all">Tất cả vai trò</option>
          <option value="user">Người dùng (User)</option>
          <option value="admin">Quản trị viên (Admin)</option>
        </select>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <div className="empty-text">Không tìm thấy người dùng phù hợp</div>
          <div className="empty-sub">Hãy thử đổi từ khóa tìm kiếm hoặc lọc lại!</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên đăng nhập</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, index) => (
                <tr key={u.id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {u.username}
                  </td>
                  <td>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || <span style={{ color: 'var(--text-muted)' }}>Chưa cấu hình</span>}</td>
                  <td>
                    <span className={`badge badge-${u.role}`}>
                      {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                  </td>
                  <td>{u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : ''}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenEdit(u)}
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(u)}
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Hiển thị Form Thêm/Sửa */}
      {showForm && (
        <UserForm
          user={editingUser}
          onClose={() => { setShowForm(false); setEditingUser(null); }}
          onSuccess={handleFormSuccess}
          addToast={addToast}
        />
      )}
    </div>
  );
}
