import 'server-only';
import fs from 'fs';
import path from 'path';
import { getDataDir } from './config';
import { ulid } from 'ulid';
import bcrypt from 'bcryptjs';
import { User, Task } from './supabase';

type Json = any;

function ensureDir() {
  const dir = getDataDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function filePath(name: string) {
  return path.join(getDataDir(), name);
}

async function readJson<T>(name: string, fallback: T): Promise<T> {
  ensureDir();
  const p = filePath(name);
  if (!fs.existsSync(p)) return fallback;
  try {
    const raw = fs.readFileSync(p, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(name: string, data: T): Promise<void> {
  ensureDir();
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), 'utf-8');
}

async function initSeed() {
  const users = await readJson<User[]>('users.json', []);
  if (users.length === 0) {
    const password_hash = await bcrypt.hash('demo123', 10);
    const seedUsers: User[] = [
      {
        id: ulid(),
        name: 'Akinyi Otieno',
        email: 'akinyi.otieno@afya.ke',
        role: 'CHW',
        phone: '+254712345001',
        county: 'Kisumu',
        sub_county: 'Kisumu East',
        ward: 'Kajulu',
        chw_account_id: '0.0.1001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any,
      {
        id: ulid(),
        name: 'Mary Wekesa',
        email: 'mary.wekesa@afya.ke',
        role: 'SUPERVISOR',
        phone: '+254712345006',
        county: 'Kisumu',
        sub_county: 'Kisumu East',
        ward: null as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any,
      {
        id: ulid(),
        name: 'Grace Adhiambo',
        email: 'admin@afya.ke',
        role: 'ADMIN',
        phone: '+254712345008',
        county: null as any,
        sub_county: null as any,
        ward: null as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any,
    ];
    // Attach password hashes separately (not in User type)
    const meta = { passwordHashes: {} as Record<string, string> };
    meta.passwordHashes[seedUsers[0].email] = password_hash;
    meta.passwordHashes[seedUsers[1].email] = password_hash;
    meta.passwordHashes[seedUsers[2].email] = password_hash;
    await writeJson('users.json', seedUsers);
    await writeJson('meta.json', meta);
    await writeJson('tasks.json', [] as Task[]);
  }
}

export async function getUserByEmail(email: string): Promise<(User & { password_hash?: string }) | null> {
  await initSeed();
  const users = await readJson<User[]>('users.json', []);
  const meta = await readJson<{ passwordHashes: Record<string, string> }>('meta.json', { passwordHashes: {} });
  const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
  if (!u) return null;
  return { ...u, password_hash: meta.passwordHashes[u.email] } as any;
}

export async function getUserById(id: string): Promise<User | null> {
  await initSeed();
  const users = await readJson<User[]>('users.json', []);
  return users.find((x) => x.id === id) || null;
}

export async function createUser(input: Partial<User> & { password: string }): Promise<User> {
  await initSeed();
  const users = await readJson<User[]>('users.json', []);
  const meta = await readJson<{ passwordHashes: Record<string, string> }>('meta.json', { passwordHashes: {} });
  if (users.some((u) => u.email.toLowerCase() === String(input.email).toLowerCase())) {
    throw new Error('Email already registered');
  }
  const now = new Date().toISOString();
  const user: User = {
    id: ulid(),
    name: input.name || 'User',
    email: String(input.email),
    role: (input.role as any) || 'CHW',
    phone: input.phone,
    county: input.county,
    sub_county: input.sub_county,
    ward: input.ward as any,
    chw_account_id: input.chw_account_id,
    created_at: now,
    updated_at: now,
  };
  users.push(user);
  meta.passwordHashes[user.email] = await bcrypt.hash(input.password, 10);
  await writeJson('users.json', users);
  await writeJson('meta.json', meta);
  return user;
}

export async function verifyPassword(email: string, password: string): Promise<User | null> {
  const u = await getUserByEmail(email);
  if (!u || !u.password_hash) return null;
  const ok = await bcrypt.compare(password, u.password_hash);
  return ok ? (u as User) : null;
}

export async function insertTask(task: Omit<Task, 'id' | 'created_at'> & { created_at?: string }): Promise<Task> {
  await initSeed();
  const tasks = await readJson<Task[]>('tasks.json', []);
  const now = new Date().toISOString();
  const rec: Task = {
    id: ulid(),
    created_at: task.created_at || now,
    ...task,
  } as Task;
  tasks.push(rec);
  await writeJson('tasks.json', tasks);
  return rec;
}

export interface TaskQuery {
  status?: string | null;
  page?: number;
  limit?: number;
  user?: User;
}

export async function fetchTasks(q: TaskQuery): Promise<{ data: any[]; count: number }> {
  await initSeed();
  const tasks = await readJson<Task[]>('tasks.json', []);
  const users = await readJson<User[]>('users.json', []);
  let list = tasks.slice();
  if (q.status) list = list.filter((t) => t.status === q.status);
  if (q.user?.role === 'CHW') list = list.filter((t) => t.chw_id === q.user!.id);
  if (q.user?.role === 'SUPERVISOR' && q.user.county) {
    const chwIds = users.filter((u) => u.role === 'CHW' && u.county === q.user!.county).map((u) => u.id);
    list = list.filter((t) => chwIds.includes(t.chw_id));
  }
  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const count = list.length;
  const page = q.page || 1;
  const limit = q.limit || 20;
  const offset = (page - 1) * limit;
  const pageItems = list.slice(offset, offset + limit);
  const withChw = pageItems.map((t) => ({
    ...t,
    chw: users.find((u) => u.id === t.chw_id) || null,
  }));
  return { data: withChw, count };
}

export async function getTaskById(id: string): Promise<Task | null> {
  await initSeed();
  const tasks = await readJson<Task[]>('tasks.json', []);
  return tasks.find((t) => t.id === id) || null;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  await initSeed();
  const tasks = await readJson<Task[]>('tasks.json', []);
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tasks[idx] = { ...tasks[idx], ...updates } as Task;
  await writeJson('tasks.json', tasks);
  return tasks[idx];
}

export async function computeStats() {
  await initSeed();
  const tasks = await readJson<Task[]>('tasks.json', []);
  const users = await readJson<User[]>('users.json', []);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const allTasks = tasks;
  const todayTasks = tasks.filter((t) => new Date(t.created_at) >= today);
  const last7Tasks = tasks.filter((t) => new Date(t.created_at) >= sevenDaysAgo);
  const last30Tasks = tasks.filter((t) => new Date(t.created_at) >= thirtyDaysAgo);
  const approvedTasks = allTasks.filter((t) => t.status === 'APPROVED');
  const pendingTasks = allTasks.filter((t) => t.status === 'PENDING');

  const totalPoints24h = todayTasks.reduce((s, t) => s + (t.points_awarded || 0), 0);
  const totalPoints7d = last7Tasks.reduce((s, t) => s + (t.points_awarded || 0), 0);
  const approvalRate = allTasks.length ? (approvedTasks.length / allTasks.length) * 100 : 0;
  const approvedWithTime = approvedTasks.filter((t) => t.created_at && t.approved_at);
  const avgMs = approvedWithTime.length
    ? approvedWithTime.reduce((sum, t) => sum + (new Date(t.approved_at!).getTime() - new Date(t.created_at).getTime()), 0) /
      approvedWithTime.length
    : 0;

  const countyStats: Record<string, number> = {};
  for (const t of last30Tasks) {
    const chw = users.find((u) => u.id === t.chw_id);
    if (chw?.county) countyStats[chw.county] = (countyStats[chw.county] || 0) + 1;
  }

  const weekTrendMap: Record<string, { date: string; tasks: number; approved: number; points: number }> = {};
  for (const t of tasks) {
    const d = new Date(t.created_at);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().split('T')[0];
    if (!weekTrendMap[key]) weekTrendMap[key] = { date: key, tasks: 0, approved: 0, points: 0 };
    weekTrendMap[key].tasks++;
    if (t.status === 'APPROVED') {
      weekTrendMap[key].approved++;
      weekTrendMap[key].points += t.points_awarded || 0;
    }
  }

  const weekTrend = Object.values(weekTrendMap).sort((a, b) => a.date.localeCompare(b.date)).slice(-7);

  return {
    kpis: {
      tasksToday: todayTasks.length,
      approvalRate: Math.round(approvalRate),
      pointsAwarded24h: totalPoints24h,
      pointsAwarded7d: totalPoints7d,
      activeChws: users.filter((u) => u.role === 'CHW').length,
      avgTimeToApprovalHours: Math.round((avgMs / (1000 * 60 * 60)) * 10) / 10,
      pendingTasks: pendingTasks.length,
    },
    charts: {
      countyStats: Object.entries(countyStats).map(([county, count]) => ({ county, count })),
      taskTypeDistribution: [
        { type: 'Home Visit', value: last30Tasks.filter((t) => t.task_type === 'HOME_VISIT').length },
        { type: 'Immunization', value: last30Tasks.filter((t) => t.task_type === 'IMMUNIZATION').length },
        { type: 'Follow-up', value: last30Tasks.filter((t) => t.task_type === 'FOLLOW_UP').length },
      ],
      weekTrend,
    },
  };
}
