// Copies accounts from the old schema (tables "employees" and "admins")
// into the new "users" table. Old tables are left untouched.
//
// The old schema had no names or hire dates, and its leave rows
// ("employee_details") were not linked to any account, so:
//   - first name = username, last name = "-", hire date = today
//     -> correct these on the Employees page afterwards;
//   - old leave rows are not copied.
import { todayISO } from '../../shared/calendar.js';
import { hashPassword } from '../src/auth.js';
import { sequelize, User } from '../src/db.js';

async function tableExists(name) {
  const [rows] = await sequelize.query('SELECT to_regclass(:name) AS t', { replacements: { name } });
  return rows[0].t !== null;
}

async function copy(table, role) {
  if (!(await tableExists(table))) return 0;
  const [rows] = await sequelize.query(`SELECT username, pword FROM ${table}`);
  let copied = 0;
  for (const row of rows) {
    const username = String(row.username || '').trim().toLowerCase();
    if (!username || await User.findOne({ where: { username } })) continue;
    const passwordHash = String(row.pword).startsWith('scrypt$') ? row.pword : await hashPassword(String(row.pword));
    await User.create({ username, passwordHash, firstName: username, lastName: '-', role, hireDate: todayISO() });
    copied += 1;
  }
  return copied;
}

try {
  await sequelize.sync();
  const admins = await copy('admins', 'ADMIN');
  const employees = await copy('employees', 'EMPLOYEE');
  console.log(`Copied ${admins} admin(s) and ${employees} employee(s).`);
  if (admins + employees > 0) {
    console.log('Set their real names and hire dates on the Employees page: annual leave is calculated from the hire date.');
  }
} catch (error) {
  console.error(`Migration failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
