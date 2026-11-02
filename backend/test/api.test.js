// End-to-end tests against a real PostgreSQL database.
// They use a separate database (TEST_DB_NAME, default "t2_leave_test")
// that is wiped at the start of every run.
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import pg from 'pg';

process.env.DB_NAME = process.env.TEST_DB_NAME || 't2_leave_test';
process.env.TOKEN_SECRET ||= 'test-secret-that-is-long-enough-1234567890';

// Create the test database if it doesn't exist yet.
const adminClient = new pg.Client({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: 'postgres',
});
await adminClient.connect();
const exists = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [process.env.DB_NAME]);
if (!exists.rowCount) await adminClient.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
await adminClient.end();

const { addDays, todayISO } = await import('../../shared/calendar.js');
const { sequelize } = await import('../src/db.js');
const users = await import('../src/services/users.js');
const { createApp } = await import('../src/server.js');

let server;
let url;

async function call(query, variables = {}, token) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

const errorCode = (result) => result.errors?.[0]?.extensions?.code;

async function login(username, password = 'Password1') {
  const result = await call(
    'mutation($u: String!, $p: String!) { login(username: $u, password: $p) { token user { role } } }',
    { u: username, p: password },
  );
  return result.data.login.token;
}

// A Monday at least two weeks away, so notice rules don't interfere.
function nextMonday(minDaysAhead = 14) {
  let day = addDays(todayISO(), minDaysAhead);
  while (new Date(`${day}T00:00:00Z`).getUTCDay() !== 1) day = addDays(day, 1);
  return day;
}

const REQUEST = `mutation($input: LeaveInput!) { requestLeave(input: $input) { id days status } }`;

before(async () => {
  await sequelize.sync({ force: true });
  await users.create({ username: 'boss', password: 'Password1', firstName: 'Ada', lastName: 'Admin', role: 'ADMIN', hireDate: '2015-01-05' });
  await users.create({ username: 'worker', password: 'Password1', firstName: 'Ece', lastName: 'Ekip', role: 'EMPLOYEE', hireDate: '2020-01-06' });
  await users.create({ username: 'newbie', password: 'Password1', firstName: 'Nur', lastName: 'Yeni', role: 'EMPLOYEE', hireDate: todayISO() });
  server = createApp().listen(0);
  url = `http://localhost:${server.address().port}/graphql`;
});

after(async () => {
  server.close();
  await sequelize.close();
});

describe('authentication', () => {
  it('rejects a wrong password with a generic error', async () => {
    const result = await call('mutation { login(username: "worker", password: "nope") { token } }');
    assert.equal(errorCode(result), 'INVALID_CREDENTIALS');
  });

  it('rejects requests without a valid token', async () => {
    assert.equal(errorCode(await call('{ myLeaveRequests { id } }')), 'UNAUTHENTICATED');
    assert.equal(errorCode(await call('{ myLeaveRequests { id } }', {}, 'forged.token.value')), 'UNAUTHENTICATED');
  });

  it('keeps admin queries away from employees', async () => {
    const token = await login('worker');
    assert.equal(errorCode(await call('{ users { id } }', {}, token)), 'FORBIDDEN');
    assert.equal(errorCode(await call('mutation { createUser(input: {username: "x1x", password: "Password1", firstName: "a", lastName: "b", role: ADMIN, hireDate: "2020-01-01"}) { id } }', {}, token)), 'FORBIDDEN');
  });

  it('never exposes password hashes', async () => {
    const token = await login('boss');
    const result = await call('{ users { passwordHash } }', {}, token);
    assert.equal(errorCode(result), 'BAD_REQUEST');
  });
});

describe('leave workflow', () => {
  it('lets an employee request leave and an admin approve it', async () => {
    const worker = await login('worker');
    const boss = await login('boss');
    const start = nextMonday();

    const created = await call(REQUEST, { input: { type: 'ANNUAL', startDate: start, endDate: addDays(start, 4) } }, worker);
    assert.equal(created.data.requestLeave.status, 'PENDING');
    assert.equal(created.data.requestLeave.days, 5);

    const before = await call('{ me { annualBalance { pending available } } }', {}, worker);
    assert.equal(before.data.me.annualBalance.pending, 5);

    const decided = await call(
      'mutation($id: ID!) { decideLeave(id: $id, approve: true) { status decidedBy { firstName } } }',
      { id: created.data.requestLeave.id }, boss,
    );
    assert.equal(decided.data.decideLeave.status, 'APPROVED');
    assert.equal(decided.data.decideLeave.decidedBy.firstName, 'Ada');
  });

  it('applies the policy on the server', async () => {
    const worker = await login('worker');
    const newbie = await login('newbie');
    const start = nextMonday(28);

    const notEligible = await call(REQUEST, { input: { type: 'ANNUAL', startDate: start, endDate: start } }, newbie);
    assert.equal(errorCode(notEligible), 'LEAVE_RULES');
    assert.equal(notEligible.errors[0].extensions.params.problems[0].code, 'NOT_ELIGIBLE_YET');

    const overlap = await call(REQUEST, { input: { type: 'ANNUAL', startDate: nextMonday(), endDate: nextMonday() } }, worker);
    assert.equal(overlap.errors[0].extensions.params.problems[0].code, 'OVERLAPPING_REQUEST');
  });

  it('needs a note to reject and blocks approving your own request', async () => {
    const boss = await login('boss');
    const start = nextMonday(42);
    const own = await call(REQUEST, { input: { type: 'ANNUAL', startDate: start, endDate: start } }, boss);
    const id = own.data.requestLeave.id;

    assert.equal(errorCode(await call('mutation($id: ID!) { decideLeave(id: $id, approve: false) { id } }', { id }, boss)), 'NOTE_REQUIRED');
    assert.equal(errorCode(await call('mutation($id: ID!) { decideLeave(id: $id, approve: true) { id } }', { id }, boss)), 'SELF_APPROVAL');
  });

  it('lets employees cancel only their own requests', async () => {
    const worker = await login('worker');
    const newbie = await login('newbie');
    const start = nextMonday(56);
    const created = await call(REQUEST, { input: { type: 'EXCUSE', startDate: start, endDate: start, reason: 'Taşınma' } }, worker);
    const id = created.data.requestLeave.id;

    assert.equal(errorCode(await call('mutation($id: ID!) { cancelLeave(id: $id) { id } }', { id }, newbie)), 'FORBIDDEN');
    const cancelled = await call('mutation($id: ID!) { cancelLeave(id: $id) { status } }', { id }, worker);
    assert.equal(cancelled.data.cancelLeave.status, 'CANCELLED');
  });

  it('hides other people’s balances from employees', async () => {
    const worker = await login('worker');
    const result = await call('{ myLeaveRequests { decidedBy { firstName annualBalance { available } } } }', {}, worker);
    assert.equal(errorCode(result), 'FORBIDDEN');
  });
});

describe('admin', () => {
  it('creates employees and refuses duplicate usernames and weak passwords', async () => {
    const boss = await login('boss');
    const create = (input) => call('mutation($input: NewUserInput!) { createUser(input: $input) { username } }', { input }, boss);
    const base = { username: 'Deniz.Su', password: 'Password1', firstName: 'Deniz', lastName: 'Su', role: 'EMPLOYEE', hireDate: '2022-05-02' };

    assert.equal((await create(base)).data.createUser.username, 'deniz.su');
    assert.equal(errorCode(await create(base)), 'USERNAME_TAKEN');
    assert.equal(errorCode(await create({ ...base, username: 'other', password: 'short' })), 'WEAK_PASSWORD');
  });

  it('stops admins from removing their own access', async () => {
    const boss = await login('boss');
    const me = await call('{ me { id } }', {}, boss);
    const result = await call('mutation($id: ID!) { updateUser(id: $id, input: { active: false }) { id } }', { id: me.data.me.id }, boss);
    assert.equal(errorCode(result), 'CANNOT_CHANGE_OWN_ACCESS');
  });

  it('signs out deactivated users straight away', async () => {
    const boss = await login('boss');
    const token = await login('newbie');
    const { data } = await call('{ users { id username } }', {}, boss);
    const newbie = data.users.find((u) => u.username === 'newbie');
    await call('mutation($id: ID!) { updateUser(id: $id, input: { active: false }) { id } }', { id: newbie.id }, boss);
    assert.equal((await call('{ me { id } }', {}, token)).data.me, null);
  });
});
