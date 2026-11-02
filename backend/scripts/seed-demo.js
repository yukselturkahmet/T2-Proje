// Fills an empty database with sample people and leave requests so every
// screen has something to show. Safe to run twice: existing usernames are
// skipped. All demo accounts use the password "Demo1234".
import { addDays, countLeaveDays, isWeekend, todayISO } from '../../shared/calendar.js';
import { LEAVE_TYPES } from '../../shared/policy.js';
import { LeaveRequest, User, sequelize } from '../src/db.js';
import * as users from '../src/services/users.js';

const PASSWORD = 'Demo1234';
const today = todayISO();

// annualLeaveAdjustment stands in for leave taken before this system
// existed, so the balances look realistic.
const people = [
  { username: 'admin', firstName: 'Selin', lastName: 'Aydın', role: 'ADMIN', hireDate: '2016-04-11', birthDate: '1985-09-02', annualLeaveAdjustment: -160 },
  { username: 'ayse.yilmaz', firstName: 'Ayşe', lastName: 'Yılmaz', role: 'EMPLOYEE', hireDate: '2019-02-18', birthDate: '1992-06-14', annualLeaveAdjustment: -88 },
  { username: 'mehmet.kaya', firstName: 'Mehmet', lastName: 'Kaya', role: 'EMPLOYEE', hireDate: '2024-09-02', birthDate: '1998-01-23' },
  { username: 'zeynep.demir', firstName: 'Zeynep', lastName: 'Demir', role: 'EMPLOYEE', hireDate: '2008-10-06', birthDate: '1974-03-30', annualLeaveAdjustment: -320 },
  { username: 'can.ozturk', firstName: 'Can', lastName: 'Öztürk', role: 'EMPLOYEE', hireDate: '2025-12-01', birthDate: '2001-11-08' },
];

// [username, type, start offset from today, end offset, status, reason]
const requests = [
  ['ayse.yilmaz', 'ANNUAL', -120, -116, 'APPROVED', ''],
  ['ayse.yilmaz', 'SICK', -40, -39, 'APPROVED', 'Grip, doktor raporu teslim edildi.'],
  ['ayse.yilmaz', 'ANNUAL', 14, 18, 'PENDING', 'Aile ziyareti'],
  ['mehmet.kaya', 'EXCUSE', 5, 5, 'PENDING', 'Taşınma'],
  ['zeynep.demir', 'ANNUAL', -2, 2, 'APPROVED', ''],
  ['zeynep.demir', 'ANNUAL', 30, 39, 'PENDING', 'Yaz tatili'],
  ['can.ozturk', 'UNPAID', 20, 22, 'REJECTED', 'Kişisel işler'],
];

// Moves a weekend date to the following Monday so sample requests have working days.
function weekday(iso) {
  let day = iso;
  while (isWeekend(day)) day = addDays(day, 1);
  return day;
}

try {
  await sequelize.sync();
  const byName = {};
  for (const person of people) {
    const existing = await User.findOne({ where: { username: person.username } });
    byName[person.username] = existing || await users.create({ ...person, password: PASSWORD });
  }

  if (await LeaveRequest.count() === 0) {
    const admin = byName.admin;
    for (const [username, type, from, to, status, reason] of requests) {
      const startDate = weekday(addDays(today, from));
      const endDate = weekday(addDays(today, to));
      const { days } = countLeaveDays(startDate, endDate, LEAVE_TYPES[type].unit);
      const decided = status === 'APPROVED' || status === 'REJECTED';
      await LeaveRequest.create({
        userId: byName[username].id,
        type, startDate, endDate, days, reason, status,
        decidedById: decided ? admin.id : null,
        decidedAt: decided ? new Date() : null,
        decisionNote: status === 'REJECTED' ? 'Proje teslim haftası, lütfen başka bir tarih seçin.' : null,
      });
    }
  }

  console.log('Demo data ready. Sign in with any of these (password "Demo1234"):');
  for (const person of people) console.log(`  ${person.username.padEnd(14)} ${person.role}`);
} catch (error) {
  console.error(`Seeding failed: ${error.code || error.message}`, error.params || '');
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
