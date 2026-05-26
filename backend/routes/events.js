const express = require('express');
const router = express.Router();
const { supabase } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/events - Lấy tất cả sự kiện
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = supabase.from('events').select('*');

    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }

    query = query.order('event_date', { ascending: true });

    const { data: events, error } = await query;
    if (error) throw error;

    // Attach registration count for each event
    const eventsWithCount = [];
    for (const event of events) {
      const { count, error: countError } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('status', 'confirmed');

      if (countError) throw countError;
      eventsWithCount.push({ ...event, registered_count: count || 0 });
    }

    res.json({ success: true, data: eventsWithCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/events/stats - Thống kê
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { count: totalEvents } = await supabase.from('events').select('*', { count: 'exact', head: true });
    const { count: upcoming } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'upcoming');
    const { count: ongoing } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'ongoing');
    const { count: completed } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'completed');
    const { count: totalRegistrations } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'confirmed');

    res.json({
      success: true,
      data: { totalEvents, upcoming, ongoing, completed, totalRegistrations }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/events/:id - Chi tiết sự kiện + danh sách người tham gia
router.get('/:id', async (req, res) => {
  try {
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', Number(req.params.id))
      .single();

    if (error || !event) {
      return res.status(404).json({ success: false, error: 'Sự kiện không tồn tại' });
    }

    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', Number(req.params.id))
      .order('registered_at', { ascending: false });

    if (regError) throw regError;

    const confirmedCount = registrations.filter(r => r.status === 'confirmed').length;

    res.json({
      success: true,
      data: { ...event, registrations, registered_count: confirmedCount }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/events - Tạo sự kiện mới
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, location, event_date, max_participants, status } = req.body;
    if (!title || !event_date) {
      return res.status(400).json({ success: false, error: 'Tiêu đề và ngày sự kiện là bắt buộc' });
    }

    const { data: newEvent, error } = await supabase.from('events').insert({
      title,
      description: description || '',
      location: location || '',
      event_date,
      max_participants: max_participants || 0,
      status: status || 'upcoming',
    }).select().single();

    if (error) throw error;

    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/events/:id - Cập nhật sự kiện
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data: event, error: findError } = await supabase
      .from('events')
      .select('*')
      .eq('id', Number(req.params.id))
      .single();

    if (findError || !event) {
      return res.status(404).json({ success: false, error: 'Sự kiện không tồn tại' });
    }

    const { title, description, location, event_date, max_participants, status } = req.body;

    const { data: updated, error } = await supabase.from('events').update({
      title: title || event.title,
      description: description !== undefined ? description : event.description,
      location: location !== undefined ? location : event.location,
      event_date: event_date || event.event_date,
      max_participants: max_participants !== undefined ? max_participants : event.max_participants,
      status: status || event.status,
    }).eq('id', Number(req.params.id)).select().single();

    if (error) throw error;

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/events/:id - Xóa sự kiện
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data: event, error: findError } = await supabase
      .from('events')
      .select('*')
      .eq('id', Number(req.params.id))
      .single();

    if (findError || !event) {
      return res.status(404).json({ success: false, error: 'Sự kiện không tồn tại' });
    }

    // Delete registrations first (CASCADE should handle this, but explicit for safety)
    await supabase.from('registrations').delete().eq('event_id', Number(req.params.id));
    
    const { error } = await supabase.from('events').delete().eq('id', Number(req.params.id));
    if (error) throw error;

    res.json({ success: true, message: 'Đã xóa sự kiện' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
