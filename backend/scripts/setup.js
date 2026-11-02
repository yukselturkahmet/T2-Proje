// Creates the tables and, on first run, the first admin account.
//
//   npm run setup -- --username admin --password 'S3cure-pass' \
//                    --first-name Ayşe --last-name Yılmaz --hire-date 2020-01-15
import { parseArgs } from 'node:util';
import { todayISO } from '../../shared/calendar.js';
import { sequelize, User } from '../src/db.js';
import * as users from '../src/services/users.js';

const { values: args } = parseArgs({
  options: {
    username: { type: 'string' },
    password: { type: 'string' },
    'first-name': { type: 'string', default: 'Admin' },
    'last-name': { type: 'string', default: 'User' },
    'hire-date': { type: 'string', default: todayISO() },
  },
});

try {
  await sequelize.sync();
  console.log('Tables are ready.');

  const admins = await User.count({ where: { role: 'ADMIN' } });
  if (admins > 0) {
    console.log('An admin account already exists. Nothing else to do.');
  } else if (!args.username || !args.password) {
    console.log('\nNo admin account yet. Create one with:');
    console.log('  npm run setup -- --username admin --password <password> --first-name <name> --last-name <surname>');
    console.log('The password needs at least 8 characters with letters and numbers.');
  } else {
    const admin = await users.create({
      username: args.username,
      password: args.password,
      firstName: args['first-name'],
      lastName: args['last-name'],
      hireDate: args['hire-date'],
      role: 'ADMIN',
    });
    console.log(`Admin "${admin.username}" created. You can sign in now.`);
  }
} catch (error) {
  console.error(`Setup failed: ${error.code || error.message}`, error.params || '');
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
