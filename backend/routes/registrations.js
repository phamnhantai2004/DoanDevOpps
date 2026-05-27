const express = require('express');
const router = express.Router();
const { supabase } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/registrations - Lấy danh sách đăng ký (Admin thấy hết, User chỉ thấy của mình)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { event_id, status } = req.query;

    let query = supabase
      .from('registrations')
      .select('*, events!inner(title, event_date)');

    // Phân quyền: Nếu không phải Admin, lọc theo user_id của người đăng nhập
    if (req.user.role !== 'admin') {
      query = query.eq('user_id', req.user.id);
    } else if (req.query.user_id) {
      // Cho phép Admin lọc theo user cụ thể nếu muốn
      query = query.eq('user_id', Number(req.query.user_id));
    }

    if (event_id) {
      query = query.eq('event_id', Number(event_id));
    }
    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('registered_at', { ascending: false });

    const { data: regs, error } = await query;
    if (error) throw error;

    // Flatten the joined events data to match the old response format
    const flatRegs = regs.map(r => {
      const { events, ...rest } = r;
      return {
        ...rest,
        event_title: events?.title || '',
        event_date: events?.event_date || '',
      };
    });

    res.json({ success: true, data: flatRegs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/registrations - Đăng ký tham gia sự kiện (Yêu cầu đăng nhập)
router.post('/', authenticateToken, async (req, res) => {
  try {
    let { event_id, full_name, email, phone } = req.body;
    if (!event_id) {
      return res.status(400).json({ success: false, error: 'event_id là bắt buộc' });
    }

    // Lấy thông tin user hiện tại để điền nếu thiếu
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy thông tin tài khoản người dùng' });
    }

    if (!full_name) full_name = user.full_name;
    if (!email) email = user.email;
    if (!phone) phone = user.phone;

    // Check event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', Number(event_id))
      .single();

    if (eventError || !event) {
      return res.status(404).json({ success: false, error: 'Sự kiện không tồn tại' });
    }

    // Check if event is cancelled
    if (event.status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Sự kiện đã bị hủy' });
    }

    // Check max participants
    if (event.max_participants > 0) {
      const { count, error: countError } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', Number(event_id))
        .eq('status', 'confirmed');

      if (countError) throw countError;

      if (count >= event.max_participants) {
        return res.status(400).json({ success: false, error: 'Sự kiện đã đủ số lượng người tham gia' });
      }
    }

    // Check duplicate email / user_id for same event
    const { data: existing } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', Number(event_id))
      .eq('status', 'confirmed')
      .or(`email.eq.${email},user_id.eq.${req.user.id}`)
      .limit(1)
      .single();

    if (existing) {
      return res.status(409).json({ success: false, error: 'Bạn đã đăng ký sự kiện này rồi' });
    }

    const { data: newReg, error: insertError } = await supabase.from('registrations').insert({
      event_id: Number(event_id),
      user_id: req.user.id,
      full_name,
      email,
      phone: phone || '',
    }).select().single();

    if (insertError) throw insertError;

    res.status(201).json({ success: true, data: newReg });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/registrations/:id/cancel - Hủy đăng ký (Admin hoặc Chủ sở hữu)
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { data: reg, error: findError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', Number(req.params.id))
      .single();

    if (findError || !reg) {
      return res.status(404).json({ success: false, error: 'Đăng ký không tồn tại' });
    }

    // Kiểm tra quyền: Chỉ Admin hoặc chính chủ được hủy
    if (req.user.role !== 'admin' && reg.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Bạn không có quyền hủy đăng ký này' });
    }

    const { data: updated, error } = await supabase
      .from('registrations')
      .update({ status: 'cancelled' })
      .eq('id', Number(req.params.id))
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/registrations/:id - Xóa đăng ký (Admin duy nhất)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data: reg, error: findError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', Number(req.params.id))
      .single();

    if (findError || !reg) {
      return res.status(404).json({ success: false, error: 'Đăng ký không tồn tại' });
    }

    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('id', Number(req.params.id));

    if (error) throw error;

    res.json({ success: true, message: 'Đã xóa đăng ký thành công' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
