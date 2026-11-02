// A small in-browser stand-in for the API, used by demo mode. It applies
// the same shared rules as the real server and keeps its data in
// localStorage, so the app can be explored without a backend.
import { addDays, countLeaveDays, isWeekend, todayISO } from '@shared/calendar.js';
import { LEAVE_TYPES, annualBalance, evaluateLeave } from '@shared/policy.js';
import { storage } from '../utils/storage';

const PASSWORD = 'Demo1234';

class DemoError extends Error {
  constructor(code, params = {}) {
    super(code);
    this.code = code;
    this.params = params;
  }
}

// Moves a weekend date to the following Monday so sample requests have working days.
function weekday(iso) {
  let day = iso;
  while (isWeekend(day)) day = addDays(day, 1);
  return day;
}

function seed() {
  const today = todayISO();
  const users = [
    { id: '1', username: 'admin', firstName: 'Selin', lastName: 'Aydın', role: 'ADMIN', hireDate: '2016-04-11', birthDate: '1985-09-02', annualLeaveAdjustment: -160 },
    { id: '2', username: 'ayse.yilmaz', firstName: 'Ayşe', lastName: 'Yılmaz', role: 'EMPLOYEE', hireDate: '2019-02-18', birthDate: '1992-06-14', annualLeaveAdjustment: -88 },
    { id: '3', username: 'mehmet.kaya', firstName: 'Mehmet', lastName: 'Kaya', role: 'EMPLOYEE', hireDate: '2024-09-02', birthDate: '1998-01-23', annualLeaveAdjustment: 0 },
    { id: '4', username: 'zeynep.demir', firstName: 'Zeynep', lastName: 'Demir', role: 'EMPLOYEE', hireDate: '2008-10-06', birthDate: '1974-03-30', annualLeaveAdjustment: -320 },
    { id: '5', username: 'can.ozturk', firstName: 'Can', lastName: 'Öztürk', role: 'EMPLOYEE', hireDate: '2025-12-01', birthDate: '2001-11-08', annualLeaveAdjustment: 0 },
  ].map((u) => ({ ...u, password: PASSWORD, active: true }));

  const rows = [
    ['2', 'ANNUAL', -120, -116, 'APPROVED', ''],
    ['2', 'SICK', -40, -39, 'APPROVED', 'Grip, doktor raporu teslim edildi.'],
    ['2', 'ANNUAL', 14, 18, 'PENDING', 'Aile ziyareti'],
    ['3', 'EXCUSE', 5, 5, 'PENDING', 'Taşınma'],
    ['4', 'ANNUAL', -2, 2, 'APPROVED', ''],
    ['4', 'ANNUAL', 30, 39, 'PENDING', 'Yaz tatili'],
    ['5', 'UNPAID', 20, 22, 'REJECTED', 'Kişisel işler'],
  ];
  const requests = rows.map(([userId, type, from, to, status, reason], i) => {
    const startDate = weekday(addDays(today, from));
    const endDate = weekday(addDays(today, to));
    const decided = status !== 'PENDING';
    return {
      id: String(i + 1), userId, type, startDate, endDate, reason, status,
      days: countLeaveDays(startDate, endDate, LEAVE_TYPES[type].unit).days,
      decidedById: decided ? '1' : null,
      decidedAt: decided ? new Date().toISOString() : null,
      decisionNote: status === 'REJECTED' ? 'Proje teslim haftası, lütfen başka bir tarih seçin.' : null,
      createdAt: new Date(Date.now() - (rows.length - i) * 86_400_000).toISOString(),
    };
  });
  return { users, requests, nextId: 100 };
}

function load() {
  try {
    return JSON.parse(storage.get('demo-db')) || seed();
  } catch {
    return seed();
  }
}

const save = (db) => storage.set('demo-db', JSON.stringify(db));

export function resetDemo() {
  storage.set('demo-db', null);
}

/* ---------- Shaping data like the API does ---------- */

function balance(db, user) {
  const own = db.requests.filter((r) => r.userId === user.id);
  return annualBalance(user, own, todayISO());
}

function userView(db, user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return { ...rest, annualBalance: balance(db, user) };
}

function requestView(db, request) {
  const user = db.users.find((u) => u.id === request.userId);
  const decidedBy = db.users.find((u) => u.id === request.decidedById);
  return {
    ...request,
    user: userView(db, user),
    decidedBy: decidedBy ? { id: decidedBy.id, firstName: decidedBy.firstName, lastName: decidedBy.lastName } : null,
  };
}

function sessionUser(db, token) {
  const id = token?.startsWith('demo:') ? token.slice(5) : null;
  const user = db.users.find((u) => u.id === id && u.active);
  if (!user) throw new DemoError('UNAUTHENTICATED');
  return user;
}

function requireAdmin(db, token) {
  const user = sessionUser(db, token);
  if (user.role !== 'ADMIN') throw new DemoError('FORBIDDEN');
  return user;
}

function checkPassword(password) {
  if (!password || password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new DemoError('WEAK_PASSWORD', { minLength: 8 });
  }
}

/* ---------- Operations ---------- */

const handlers = {
  Login(db, { username, password }) {
    const user = db.users.find((u) => u.username === String(username).trim().toLowerCase());
    if (!user || user.password !== password || !user.active) throw new DemoError('INVALID_CREDENTIALS');
    return { login: { token: `demo:${user.id}`, user: userView(db, user) } };
  },

  Me(db, _, token) {
    try {
      return { me: userView(db, sessionUser(db, token)) };
    } catch {
      return { me: null };
    }
  },

  MyRequests(db, _, token) {
    const user = sessionUser(db, token);
    const mine = db.requests
      .filter((r) => r.userId === user.id)
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
    return { myLeaveRequests: mine.map((r) => requestView(db, r)) };
  },

  RequestLeave(db, { input }, token) {
    const user = sessionUser(db, token);
    const own = db.requests.filter((r) => r.userId === user.id);
    const result = evaluateLeave(input, user, own, todayISO());
    if (result.problems.length) throw new DemoError('LEAVE_RULES', { problems: result.problems });
    const request = {
      id: String(db.nextId++), userId: user.id, type: input.type,
      startDate: input.startDate, endDate: input.endDate, days: result.days,
      reason: (input.reason || '').trim(), status: 'PENDING',
      decidedById: null, decidedAt: null, decisionNote: null, createdAt: new Date().toISOString(),
    };
    db.requests.push(request);
    return { requestLeave: requestView(db, request) };
  },

  CancelLeave(db, { id }, token) {
    const user = sessionUser(db, token);
    const request = db.requests.find((r) => r.id === id);
    if (!request) throw new DemoError('NOT_FOUND');
    if (request.userId !== user.id) throw new DemoError('FORBIDDEN');
    const ok = request.status === 'PENDING' || (request.status === 'APPROVED' && request.startDate > todayISO());
    if (!ok) throw new DemoError('INVALID_STATE');
    request.status = 'CANCELLED';
    return { cancelLeave: { id, status: request.status } };
  },

  ChangePassword(db, { currentPassword, newPassword }, token) {
    const user = sessionUser(db, token);
    if (user.password !== currentPassword) throw new DemoError('WRONG_PASSWORD');
    checkPassword(newPassword);
    user.password = newPassword;
    return { changePassword: true };
  },

  Overview(db, _, token) {
    requireAdmin(db, token);
    const today = todayISO();
    const limit = addDays(today, 30);
    const approved = db.requests.filter((r) => r.status === 'APPROVED');
    return {
      overview: {
        pendingCount: db.requests.filter((r) => r.status === 'PENDING').length,
        activeEmployees: db.users.filter((u) => u.active).length,
        onLeaveToday: approved.filter((r) => r.startDate <= today && r.endDate >= today).map((r) => requestView(db, r)),
        upcoming: approved
          .filter((r) => r.startDate > today && r.startDate <= limit)
          .sort((a, b) => a.startDate.localeCompare(b.startDate))
          .map((r) => requestView(db, r)),
      },
    };
  },

  LeaveRequests(db, { filter = {} }, token) {
    requireAdmin(db, token);
    const { status, userId, type, year, limit = 50, offset = 0 } = filter;
    const matches = db.requests
      .filter((r) => (!status || r.status === status)
        && (!userId || r.userId === userId)
        && (!type || r.type === type)
        && (!year || (r.startDate <= `${year}-12-31` && r.endDate >= `${year}-01-01`)))
      .sort((a, b) => {
        if ((a.status === 'PENDING') !== (b.status === 'PENDING')) return a.status === 'PENDING' ? -1 : 1;
        if (a.status === 'PENDING') return a.createdAt.localeCompare(b.createdAt);
        return b.startDate.localeCompare(a.startDate);
      });
    return {
      leaveRequests: {
        total: matches.length,
        items: matches.slice(offset, offset + limit).map((r) => requestView(db, r)),
      },
    };
  },

  Users(db, { includeInactive }, token) {
    requireAdmin(db, token);
    const list = db.users
      .filter((u) => includeInactive || u.active)
      .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'tr'));
    return { users: list.map((u) => userView(db, u)) };
  },

  DecideLeave(db, { id, approve, note }, token) {
    const admin = requireAdmin(db, token);
    const request = db.requests.find((r) => r.id === id);
    if (!request) throw new DemoError('NOT_FOUND');
    if (!approve && !(note || '').trim()) throw new DemoError('NOTE_REQUIRED');
    if (request.status !== 'PENDING') throw new DemoError('INVALID_STATE');
    if (request.userId === admin.id) throw new DemoError('SELF_APPROVAL');
    if (approve) {
      const user = db.users.find((u) => u.id === request.userId);
      const own = db.requests.filter((r) => r.userId === user.id);
      const blocking = evaluateLeave(request, user, own, todayISO()).problems
        .filter((p) => ['INSUFFICIENT_BALANCE', 'EXCEEDS_YEARLY_LIMIT', 'OVERLAPPING_REQUEST'].includes(p.code));
      if (blocking.length) throw new DemoError('LEAVE_RULES', { problems: blocking });
    }
    Object.assign(request, {
      status: approve ? 'APPROVED' : 'REJECTED',
      decisionNote: (note || '').trim() || null,
      decidedAt: new Date().toISOString(),
      decidedById: admin.id,
    });
    return { decideLeave: { id, status: request.status } };
  },

  CreateUser(db, { input }, token) {
    requireAdmin(db, token);
    const username = String(input.username).trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,40}$/.test(username)) throw new DemoError('INVALID_FIELD', { field: 'username' });
    if (db.users.some((u) => u.username === username)) throw new DemoError('USERNAME_TAKEN');
    checkPassword(input.password);
    const user = {
      id: String(db.nextId++), username, password: input.password,
      firstName: input.firstName.trim(), lastName: input.lastName.trim(), role: input.role,
      hireDate: input.hireDate, birthDate: input.birthDate || null,
      annualLeaveAdjustment: Number(input.annualLeaveAdjustment || 0), active: true,
    };
    db.users.push(user);
    return { createUser: userView(db, user) };
  },

  UpdateUser(db, { id, input }, token) {
    const admin = requireAdmin(db, token);
    const user = db.users.find((u) => u.id === id);
    if (!user) throw new DemoError('NOT_FOUND');
    if (user.id === admin.id && (input.active === false || input.role === 'EMPLOYEE')) {
      throw new DemoError('CANNOT_CHANGE_OWN_ACCESS');
    }
    if (input.newPassword) {
      checkPassword(input.newPassword);
      user.password = input.newPassword;
    }
    const { newPassword, ...fields } = input;
    Object.assign(user, fields, { annualLeaveAdjustment: Number(fields.annualLeaveAdjustment ?? user.annualLeaveAdjustment) });
    return { updateUser: userView(db, user) };
  },
};

export async function handle(name, variables, token) {
  const handler = handlers[name];
  if (!handler) throw new DemoError('BAD_REQUEST');
  const db = load();
  // A short pause so loading states look the same as with a real server.
  await new Promise((resolve) => setTimeout(resolve, 150));
  const result = handler(db, variables || {}, token);
  save(db);
  return result;
}
