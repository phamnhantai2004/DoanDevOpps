/**
 * One-time migration script: SQLite (events.db) → Supabase PostgreSQL
 * 
 * Usage: node migrate-to-supabase.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const DB_PATH = path.join(__dirname, 'events.db');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function readAllFromSqlite(db, table) {
  const stmt = db.prepare(`SELECT * FROM ${table}`);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

async function migrate() {
  console.log('🚀 Starting migration: SQLite → Supabase\n');

  // 1. Open SQLite
  if (!fs.existsSync(DB_PATH)) {
    console.error(`❌ SQLite file not found: ${DB_PATH}`);
    process.exit(1);
  }

  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(buffer);
  console.log('✅ SQLite database loaded\n');

  // 2. Read all data from SQLite
  const users = readAllFromSqlite(db, 'users');
  const events = readAllFromSqlite(db, 'events');
  const registrations = readAllFromSqlite(db, 'registrations');

  console.log(`📊 SQLite data:`);
  console.log(`   Users: ${users.length}`);
  console.log(`   Events: ${events.length}`);
  console.log(`   Registrations: ${registrations.length}\n`);

  // 3. Clear existing Supabase data (if any)
  console.log('🗑️  Clearing existing Supabase data...');
  await supabase.from('registrations').delete().neq('id', 0);
  await supabase.from('events').delete().neq('id', 0);
  await supabase.from('users').delete().neq('id', 0);
  console.log('✅ Supabase tables cleared\n');

  // 4. Migrate Users
  console.log('👤 Migrating users...');
  const userIdMap = {}; // old SQLite id → new Supabase id
  for (const user of users) {
    const { data, error } = await supabase.from('users').insert({
      username: user.username,
      password: user.password,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'user',
      created_at: user.created_at || new Date().toISOString(),
    }).select().single();

    if (error) {
      console.error(`   ❌ Error inserting user "${user.username}":`, error.message);
      continue;
    }
    userIdMap[user.id] = data.id;
    console.log(`   ✅ ${user.username} (${user.id} → ${data.id})`);
  }

  // 5. Migrate Events
  console.log('\n📅 Migrating events...');
  const eventIdMap = {}; // old SQLite id → new Supabase id
  for (const event of events) {
    const { data, error } = await supabase.from('events').insert({
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      event_date: event.event_date,
      max_participants: event.max_participants || 0,
      status: event.status || 'upcoming',
      created_at: event.created_at || new Date().toISOString(),
    }).select().single();

    if (error) {
      console.error(`   ❌ Error inserting event "${event.title}":`, error.message);
      continue;
    }
    eventIdMap[event.id] = data.id;
    console.log(`   ✅ ${event.title} (${event.id} → ${data.id})`);
  }

  // 6. Migrate Registrations
  console.log('\n🎟️  Migrating registrations...');
  let regSuccess = 0;
  let regFailed = 0;
  for (const reg of registrations) {
    const newEventId = eventIdMap[reg.event_id];
    const newUserId = reg.user_id ? userIdMap[reg.user_id] : null;

    if (!newEventId) {
      console.error(`   ❌ Skipping registration #${reg.id}: event_id ${reg.event_id} not mapped`);
      regFailed++;
      continue;
    }

    const { error } = await supabase.from('registrations').insert({
      event_id: newEventId,
      user_id: newUserId,
      full_name: reg.full_name,
      email: reg.email,
      phone: reg.phone || '',
      status: reg.status || 'confirmed',
      registered_at: reg.registered_at || new Date().toISOString(),
    });

    if (error) {
      console.error(`   ❌ Error inserting registration #${reg.id}:`, error.message);
      regFailed++;
    } else {
      regSuccess++;
    }
  }
  console.log(`   ✅ ${regSuccess} registrations migrated, ${regFailed} failed`);

  // 7. Verify
  console.log('\n🔍 Verifying Supabase data...');
  const { count: uCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: eCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
  const { count: rCount } = await supabase.from('registrations').select('*', { count: 'exact', head: true });

  console.log(`   Users: ${uCount}`);
  console.log(`   Events: ${eCount}`);
  console.log(`   Registrations: ${rCount}`);

  console.log('\n🎉 Migration complete!');
  console.log('\n📝 ID Mappings:');
  console.log('   Users:', JSON.stringify(userIdMap));
  console.log('   Events:', JSON.stringify(eventIdMap));

  db.close();
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
