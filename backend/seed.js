/**
 * Seed data script cho Supabase
 * Tạo superuser admin + dữ liệu test
 * 
 * Usage: node seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function seed() {
  console.log('🚀 Seeding database...\n');

  // Check if Supabase credentials are valid
  const isSupabaseConfigured = process.env.SUPABASE_URL &&
    !process.env.SUPABASE_URL.includes('test.supabase') &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('test_');

  if (!isSupabaseConfigured) {
    console.log('⚠️  Supabase credentials are placeholders. Writing local fallback data.');
    const fs = require('fs');
    const path = require('path');

    const usersFallback = [
      { id: 1, username: 'admin', full_name: 'Quản trị viên', email: 'admin@eventhub.com', phone: '', role: 'admin' },
      { id: 2, username: 'user', full_name: 'Nguyễn Văn Đăng', email: 'user@gmail.com', phone: '0901234567', role: 'user' }
    ];

    const eventsFallback = [
      { id: 1, title: 'Hội thảo Công nghệ AI 2026', description: 'Hội thảo chia sẻ về AI', location: 'GEM Center', event_date: '2026-05-15', max_participants: 100, status: 'upcoming', created_at: new Date().toISOString() },
      { id: 2, title: 'Workshop React & Node.js', description: 'Workshop thực hành', location: 'ĐH Bách Khoa', event_date: '2026-05-20', max_participants: 40, status: 'upcoming', created_at: new Date().toISOString() }
    ];

    const registrationsFallback = [
      { id: 1, event_id: 1, full_name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', phone: '0901234567', status: 'confirmed', registered_at: new Date().toISOString() }
    ];

    const out = { users: usersFallback, events: eventsFallback, registrations: registrationsFallback };
    const outPath = path.join(__dirname, 'local_data.json');
    try {
      fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
      console.log(`✅ Local seed written to ${outPath}`);
    } catch (err) {
      console.error('❌ Could not write local seed file:', err.message);
    }

    console.log('💡 To seed into Supabase, update .env with real credentials:');
    console.log('   SUPABASE_URL=https://your-project.supabase.co');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=your_real_key_here');
    return;
  }

  // Clear existing data
  try {
    await supabase.from('registrations').delete().neq('id', 0);
    await supabase.from('events').delete().neq('id', 0);
    await supabase.from('users').delete().neq('id', 0);
    console.log('🗑️  Cleared old data\n');
  } catch (err) {
    console.log('⚠️  Could not clear data:', err.message);
    return;
  }

  // Seed Users
  const salt = bcrypt.genSaltSync(10);
  const adminPassword = bcrypt.hashSync('admin123', salt);
  const userPassword = bcrypt.hashSync('user123', salt);

  const users = [
    { username: 'admin', password: adminPassword, full_name: 'Quản trị viên', email: 'admin@eventhub.com', phone: '', role: 'admin' },
    { username: 'user', password: userPassword, full_name: 'Nguyễn Văn Đăng', email: 'user@gmail.com', phone: '0901234567', role: 'user' },
    { username: 'an_nguyen', password: userPassword, full_name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', phone: '0901234567', role: 'user' },
    { username: 'bich_tran', password: userPassword, full_name: 'Trần Thị Bích', email: 'bich.tran@yahoo.com', phone: '0912345678', role: 'user' },
    { username: 'cuong_le', password: userPassword, full_name: 'Lê Hoàng Cường', email: 'cuong.le@outlook.com', phone: '0923456789', role: 'user' },
    { username: 'duc_pham', password: userPassword, full_name: 'Phạm Minh Đức', email: 'duc.pham@gmail.com', phone: '0934567890', role: 'user' },
  ];

  const { data: insertedUsers, error: userError } = await supabase
    .from('users')
    .insert(users)
    .select('id, username, role');

  if (userError) { console.error('❌ User insert error:', userError.message); return; }
  console.log(`👤 Added ${insertedUsers.length} users:`);
  insertedUsers.forEach(u => console.log(`   ${u.role === 'admin' ? '👑' : '  '} ${u.username} (id: ${u.id})`));

  // Build user ID map by username
  const userMap = {};
  insertedUsers.forEach(u => { userMap[u.username] = u.id; });

  // Seed Events
  const events = [
    { title: 'Hội thảo Công nghệ AI 2026', description: 'Hội thảo chia sẻ kiến thức về trí tuệ nhân tạo, machine learning và ứng dụng thực tế trong doanh nghiệp Việt Nam.', location: 'Trung tâm Hội nghị GEM Center, TP.HCM', event_date: '2026-05-15', max_participants: 100, status: 'upcoming' },
    { title: 'Workshop React & Node.js', description: 'Workshop thực hành xây dựng ứng dụng web fullstack với React và Node.js. Phù hợp cho sinh viên và junior developer.', location: 'Đại học Bách Khoa TP.HCM, Phòng H6-601', event_date: '2026-05-20', max_participants: 40, status: 'upcoming' },
    { title: 'Tech Meetup Sài Gòn #12', description: 'Giao lưu networking giữa các developer, chia sẻ kinh nghiệm làm việc và công nghệ mới.', location: 'The Coffee House, 86 Cao Thắng, Q.3', event_date: '2026-04-25', max_participants: 30, status: 'ongoing' },
    { title: 'Khóa học Docker & Kubernetes', description: 'Khóa học 1 ngày về containerization và orchestration. Yêu cầu có kiến thức Linux cơ bản.', location: 'VNG Campus, TP. Thủ Đức', event_date: '2026-06-01', max_participants: 25, status: 'upcoming' },
    { title: 'Hackathon Green Tech 2026', description: 'Cuộc thi lập trình 24h với chủ đề công nghệ xanh, giải pháp bảo vệ môi trường.', location: 'Khu CNC Sài Gòn, Q.9', event_date: '2026-06-15', max_participants: 200, status: 'upcoming' },
    { title: 'Seminar Cybersecurity', description: 'Hội thảo về an ninh mạng, bảo mật ứng dụng web và phòng chống tấn công mạng.', location: 'Khách sạn Rex, Q.1, TP.HCM', event_date: '2026-04-10', max_participants: 50, status: 'completed' },
    { title: 'Career Fair IT 2026', description: 'Ngày hội việc làm công nghệ thông tin - kết nối sinh viên với các công ty hàng đầu.', location: 'Nhà Văn hóa Thanh Niên, Q.1', event_date: '2026-03-20', max_participants: 500, status: 'completed' },
    { title: 'Workshop UI/UX Design', description: 'Workshop thiết kế giao diện người dùng với Figma. Không yêu cầu kinh nghiệm.', location: 'WeWork Emart, Q.2, TP.HCM', event_date: '2026-05-28', max_participants: 35, status: 'upcoming' },
  ];

  const { data: insertedEvents, error: eventError } = await supabase
    .from('events')
    .insert(events)
    .select('id, title');

  if (eventError) { console.error('❌ Event insert error:', eventError.message); return; }
  console.log(`\n📅 Added ${insertedEvents.length} events`);

  // Build event ID map by title
  const eventMap = {};
  insertedEvents.forEach(e => { eventMap[e.title] = e.id; });

  // Seed Registrations
  const registrations = [
    { event_title: 'Hội thảo Công nghệ AI 2026', username: 'an_nguyen', full_name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', phone: '0901234567', status: 'confirmed' },
    { event_title: 'Hội thảo Công nghệ AI 2026', username: 'bich_tran', full_name: 'Trần Thị Bích', email: 'bich.tran@yahoo.com', phone: '0912345678', status: 'confirmed' },
    { event_title: 'Hội thảo Công nghệ AI 2026', username: 'cuong_le', full_name: 'Lê Hoàng Cường', email: 'cuong.le@outlook.com', phone: '0923456789', status: 'confirmed' },
    { event_title: 'Hội thảo Công nghệ AI 2026', username: 'duc_pham', full_name: 'Phạm Minh Đức', email: 'duc.pham@gmail.com', phone: '0934567890', status: 'confirmed' },
    { event_title: 'Hội thảo Công nghệ AI 2026', username: 'user', full_name: 'Nguyễn Văn Đăng', email: 'user@gmail.com', phone: '0901234567', status: 'cancelled' },
    { event_title: 'Workshop React & Node.js', username: 'user', full_name: 'Nguyễn Văn Đăng', email: 'user@gmail.com', phone: '0901234567', status: 'confirmed' },
    { event_title: 'Workshop React & Node.js', username: 'an_nguyen', full_name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', phone: '0901234567', status: 'confirmed' },
    { event_title: 'Workshop React & Node.js', username: 'bich_tran', full_name: 'Trần Thị Bích', email: 'bich.tran@yahoo.com', phone: '0912345678', status: 'confirmed' },
    { event_title: 'Tech Meetup Sài Gòn #12', username: 'cuong_le', full_name: 'Lê Hoàng Cường', email: 'cuong.le@outlook.com', phone: '0923456789', status: 'confirmed' },
    { event_title: 'Tech Meetup Sài Gòn #12', username: 'duc_pham', full_name: 'Phạm Minh Đức', email: 'duc.pham@gmail.com', phone: '0934567890', status: 'confirmed' },
    { event_title: 'Tech Meetup Sài Gòn #12', username: 'user', full_name: 'Nguyễn Văn Đăng', email: 'user@gmail.com', phone: '0901234567', status: 'confirmed' },
    { event_title: 'Seminar Cybersecurity', username: 'an_nguyen', full_name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', phone: '0901234567', status: 'confirmed' },
    { event_title: 'Seminar Cybersecurity', username: 'bich_tran', full_name: 'Trần Thị Bích', email: 'bich.tran@yahoo.com', phone: '0912345678', status: 'confirmed' },
    { event_title: 'Career Fair IT 2026', username: 'cuong_le', full_name: 'Lê Hoàng Cường', email: 'cuong.le@outlook.com', phone: '0923456789', status: 'confirmed' },
    { event_title: 'Career Fair IT 2026', username: 'duc_pham', full_name: 'Phạm Minh Đức', email: 'duc.pham@gmail.com', phone: '0934567890', status: 'confirmed' },
    { event_title: 'Career Fair IT 2026', username: 'user', full_name: 'Nguyễn Văn Đăng', email: 'user@gmail.com', phone: '0901234567', status: 'confirmed' },
    { event_title: 'Hackathon Green Tech 2026', username: 'an_nguyen', full_name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', phone: '0901234567', status: 'confirmed' },
  ];

  const regInserts = registrations.map(r => ({
    event_id: eventMap[r.event_title],
    user_id: userMap[r.username],
    full_name: r.full_name,
    email: r.email,
    phone: r.phone,
    status: r.status,
  }));

  const { data: insertedRegs, error: regError } = await supabase
    .from('registrations')
    .insert(regInserts)
    .select('id');

  if (regError) { console.error('❌ Registration insert error:', regError.message); return; }
  console.log(`\n🎟️  Added ${insertedRegs.length} registrations`);

  console.log('\n🎉 Seed complete!');
  console.log('\n📋 Tài khoản đăng nhập:');
  console.log('   👑 Admin: username=admin, password=admin123');
  console.log('   👤 User:  username=user,  password=user123');
  console.log('   (Tất cả user test đều dùng password: user123)');
}

seed().catch(err => { console.error('❌', err); process.exit(1); });
