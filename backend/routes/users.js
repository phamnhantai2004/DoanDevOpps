const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { supabase } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Tất cả các route trong này đều yêu cầu đăng nhập và có quyền Admin
router.use(authenticateToken, requireAdmin);

// GET /api/users - Lấy danh sách tất cả người dùng
router.get('/', async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, full_name, email, phone, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/users - Thêm người dùng mới
router.post('/', async (req, res) => {
  try {
    const { username, password, full_name, email, phone, role } = req.body;

    if (!username || !password || !full_name || !email) {
      return res.status(400).json({ success: false, error: 'Tên đăng nhập, mật khẩu, họ tên và email là bắt buộc' });
    }

    // Kiểm tra tên đăng nhập tồn tại
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Tên đăng nhập đã tồn tại' });
    }

    // Kiểm tra email tồn tại
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingEmail) {
      return res.status(400).json({ success: false, error: 'Email đã được sử dụng bởi tài khoản khác' });
    }

    // Hash mật khẩu
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username,
        password: hashedPassword,
        full_name,
        email,
        phone: phone || '',
        role: role || 'user',
      })
      .select('id, username, full_name, email, phone, role, created_at')
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, message: 'Tạo tài khoản thành công', data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:id - Cập nhật thông tin chi tiết người dùng hoặc thay đổi vai trò
router.put('/:id', async (req, res) => {
  try {
    const { username, password, full_name, email, phone, role } = req.body;
    const userId = req.params.id;

    // Kiểm tra người dùng tồn tại
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('id', userId)
      .maybeSingle();

    if (!existingUser) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra trùng lặp username
    if (username && username !== existingUser.username) {
      const { data: duplicateUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', userId)
        .maybeSingle();
      
      if (duplicateUser) {
        return res.status(400).json({ success: false, error: 'Tên đăng nhập đã được sử dụng' });
      }
    }

    // Kiểm tra trùng lặp email
    if (email && email !== existingUser.email) {
      const { data: duplicateEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', userId)
        .maybeSingle();
      
      if (duplicateEmail) {
        return res.status(400).json({ success: false, error: 'Email đã được sử dụng' });
      }
    }

    const updates = {
      username,
      full_name,
      email,
      phone: phone || '',
      role: role || 'user'
    };

    // Chỉ cập nhật mật khẩu nếu được cung cấp
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      updates.password = bcrypt.hashSync(password, salt);
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, username, full_name, email, phone, role, created_at')
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'Cập nhật tài khoản thành công', data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/users/:id - Xóa người dùng (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Không cho phép tự xóa chính mình
    if (userId.toString() === req.user.id.toString()) {
      return res.status(400).json({ success: false, error: 'Bạn không thể tự xóa tài khoản của chính mình' });
    }

    // Kiểm tra người dùng tồn tại
    const { data: user, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (checkError || !user) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
    }

    // Xóa người dùng
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) throw deleteError;

    res.json({ success: true, message: 'Xóa tài khoản thành công' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
