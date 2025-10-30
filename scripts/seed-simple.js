require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const { ulid } = require('ulid');
const geohash = require('ngeohash');
const crypto = require('crypto');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function hashConsentCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

async function seed() {
  console.log('🌱 Seeding AfyaUkweli Database');
  console.log('==============================\n');

  const defaultPassword = await bcrypt.hash('demo123', 10);

  console.log('👥 Step 1: Creating users...');

  const usersData = [
    {
      name: 'Akinyi Otieno',
      email: 'akinyi.otieno@afya.ke',
      role: 'CHW',
      phone: '+254712345001',
      county: 'Kisumu',
      sub_county: 'Kisumu East',
      ward: 'Kajulu',
      chw_account_id: '0.0.1001',
      password_hash: defaultPassword,
    },
    {
      name: 'Wanjiru Kamau',
      email: 'wanjiru.kamau@afya.ke',
      role: 'CHW',
      phone: '+254712345002',
      county: 'Nairobi',
      sub_county: 'Westlands',
      ward: 'Kangemi',
      chw_account_id: '0.0.1002',
      password_hash: defaultPassword,
    },
    {
      name: 'Hassan Ali',
      email: 'hassan.ali@afya.ke',
      role: 'CHW',
      phone: '+254712345003',
      county: 'Mombasa',
      sub_county: 'Mvita',
      ward: 'Mji wa Kale',
      chw_account_id: '0.0.1003',
      password_hash: defaultPassword,
    },
    {
      name: 'Cherono Kiptoo',
      email: 'cherono.kiptoo@afya.ke',
      role: 'CHW',
      phone: '+254712345004',
      county: 'Uasin Gishu',
      sub_county: 'Ainabkoi',
      ward: 'Kapsoya',
      chw_account_id: '0.0.1004',
      password_hash: defaultPassword,
    },
    {
      name: 'Njeri Muthoni',
      email: 'njeri.muthoni@afya.ke',
      role: 'CHW',
      phone: '+254712345005',
      county: 'Kiambu',
      sub_county: 'Kikuyu',
      ward: 'Kinoo',
      chw_account_id: '0.0.1005',
      password_hash: defaultPassword,
    },
    {
      name: 'Mary Wekesa',
      email: 'mary.wekesa@afya.ke',
      role: 'SUPERVISOR',
      phone: '+254712345006',
      county: 'Kisumu',
      sub_county: 'Kisumu East',
      ward: null,
      password_hash: defaultPassword,
    },
    {
      name: 'Joseph Mwangi',
      email: 'joseph.mwangi@afya.ke',
      role: 'SUPERVISOR',
      phone: '+254712345007',
      county: 'Nairobi',
      sub_county: 'Westlands',
      ward: null,
      password_hash: defaultPassword,
    },
    {
      name: 'Grace Adhiambo',
      email: 'admin@afya.ke',
      role: 'ADMIN',
      phone: '+254712345008',
      county: null,
      sub_county: null,
      ward: null,
      password_hash: defaultPassword,
    },
  ];

  const { data: users, error: usersError } = await supabase
    .from('users')
    .insert(usersData)
    .select();

  if (usersError) {
    console.error('❌ Error creating users:', usersError);
    return;
  }

  console.log(`✅ Created ${users.length} users\n`);

  console.log('📋 Step 2: Creating tasks...');

  const chws = users.filter((u) => u.role === 'CHW');
  const supervisors = users.filter((u) => u.role === 'SUPERVISOR');

  const taskTypes = ['HOME_VISIT', 'IMMUNIZATION', 'FOLLOW_UP'];
  const taskNotes = {
    HOME_VISIT: [
      'Home visit for prenatal care follow-up',
      'Checked on newborn health and breastfeeding',
      'Malaria prevention education and net distribution',
      'TB medication adherence check',
      'HIV counseling and testing referral',
    ],
    IMMUNIZATION: [
      'Child immunization (PENTA3) administered',
      'Polio vaccine second dose',
      'BCG vaccine for newborn',
      'Measles-rubella vaccination',
      'Rotavirus vaccine administered',
    ],
    FOLLOW_UP: [
      'ANC follow-up - third trimester check',
      'Post-natal care follow-up week 2',
      'Chronic disease medication refill support',
      'Family planning counseling follow-up',
      'Nutrition support program follow-up',
    ],
  };

  const locations = [
    { lat: -1.2864, lng: 36.8172, name: 'Nairobi' },
    { lat: -0.0917, lng: 34.7680, name: 'Kisumu' },
    { lat: -4.0435, lng: 39.6682, name: 'Mombasa' },
    { lat: 0.5143, lng: 35.2698, name: 'Eldoret' },
    { lat: -1.1746, lng: 36.9535, name: 'Kiambu' },
  ];

  const tasks = [];
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < 200; i++) {
    const chw = chws[Math.floor(Math.random() * chws.length)];
    const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];

    const lat = location.lat + (Math.random() - 0.5) * 0.1;
    const lng = location.lng + (Math.random() - 0.5) * 0.1;
    const geoHash = geohash.encode(lat, lng, 7);

    const randomTimestamp = new Date(
      thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo)
    );

    randomTimestamp.setHours(8 + Math.floor(Math.random() * 9));
    randomTimestamp.setMinutes(Math.floor(Math.random() * 60));

    const notes = taskNotes[taskType][Math.floor(Math.random() * taskNotes[taskType].length)];

    const consentCode = Math.floor(1000 + Math.random() * 9000).toString();
    const consentHash = hashConsentCode(consentCode);

    const shouldBeApproved = Math.random() < 0.88;
    const status = shouldBeApproved ? 'APPROVED' : Math.random() < 0.9 ? 'PENDING' : 'REJECTED';

    const supervisor = supervisors[Math.floor(Math.random() * supervisors.length)];

    let approvedAt = null;
    let pointsAwarded = 0;

    if (status === 'APPROVED') {
      const approvalDelay = Math.random() * 24 * 60 * 60 * 1000;
      approvedAt = new Date(randomTimestamp.getTime() + approvalDelay);
      pointsAwarded = taskType === 'IMMUNIZATION' ? 15 : taskType === 'HOME_VISIT' ? 10 : 12;
    } else if (status === 'REJECTED') {
      const approvalDelay = Math.random() * 48 * 60 * 60 * 1000;
      approvedAt = new Date(randomTimestamp.getTime() + approvalDelay);
    }

    tasks.push({
      task_id: ulid(),
      chw_id: chw.id,
      task_type: taskType,
      consent_code_hash: consentHash,
      geohash: geoHash,
      notes,
      status,
      created_at: randomTimestamp.toISOString(),
      approved_at: approvedAt ? approvedAt.toISOString() : null,
      supervisor_id: status !== 'PENDING' ? supervisor.id : null,
      rejection_reason: status === 'REJECTED' ? 'Insufficient documentation provided' : null,
      hcs_log_txn_hash: `0x${Math.random().toString(16).substring(2, 66)}`,
      hcs_approval_txn_hash: status !== 'PENDING' ? `0x${Math.random().toString(16).substring(2, 66)}` : null,
      hts_transfer_txn_hash: status === 'APPROVED' ? `0x${Math.random().toString(16).substring(2, 66)}` : null,
      points_awarded: pointsAwarded,
    });
  }

  tasks.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const { error: tasksError } = await supabase.from('tasks').insert(tasks);

  if (tasksError) {
    console.error('❌ Error creating tasks:', tasksError);
    return;
  }

  console.log(`✅ Created ${tasks.length} tasks\n`);

  console.log('📊 Step 3: Creating metric snapshots...');

  const snapshots = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    date.setHours(0, 0, 0, 0);

    const dayTasks = tasks.filter((t) => {
      const taskDate = new Date(t.created_at);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === date.getTime();
    });

    snapshots.push({
      snapshot_date: date.toISOString().split('T')[0],
      total_tasks: dayTasks.length,
      approved_tasks: dayTasks.filter((t) => t.status === 'APPROVED').length,
      rejected_tasks: dayTasks.filter((t) => t.status === 'REJECTED').length,
      pending_tasks: dayTasks.filter((t) => t.status === 'PENDING').length,
      points_distributed: dayTasks.reduce((sum, t) => sum + t.points_awarded, 0),
      active_chws: new Set(dayTasks.map((t) => t.chw_id)).size,
    });
  }

  const { error: snapshotsError } = await supabase.from('metric_snapshots').insert(snapshots);

  if (snapshotsError) {
    console.error('❌ Error creating snapshots:', snapshotsError);
    return;
  }

  console.log(`✅ Created ${snapshots.length} metric snapshots\n`);

  console.log('🎉 Seed Complete!');
  console.log('================\n');
  console.log('Test Accounts:');
  console.log('  CHW: akinyi.otieno@afya.ke / demo123');
  console.log('  Supervisor: mary.wekesa@afya.ke / demo123');
  console.log('  Admin: admin@afya.ke / demo123\n');
}

seed().catch(console.error);
