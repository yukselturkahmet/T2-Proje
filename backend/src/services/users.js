import { UniqueConstraintError, ValidationError } from 'sequelize';
import { parseDate, todayISO } from '../../../shared/calendar.js';
import {
  assertNotLocked, checkPasswordStrength, clearFailedLogins, createToken,
  hashPassword, recordFailedLogin, verifyPassword,
} from '../auth.js';
import { User } from '../db.js';
import { AppError, notFound } from '../errors.js';

// Used to make a sign-in for an unknown username take as long as a real one.
const DUMMY_HASH = await hashPassword('timing-guard-0');

const normaliseUsername = (value) => String(value || '').trim().toLowerCase();

function checkDate(value, field, { optional = false } = {}) {
  if (value == null || value === '') {
    if (optional) return null;
    throw new AppError('INVALID_FIELD', { field });
  }
  if (!parseDate(value) || value > todayISO()) throw new AppError('INVALID_FIELD', { field });
  return value;
}

function checkName(value, field) {
  const name = String(value || '').trim();
  if (!name || name.length > 60) throw new AppError('INVALID_FIELD', { field });
  return name;
}

function checkAdjustment(value = 0) {
  const days = Number(value);
  // Whole or half days, within a year either way.
  if (!Number.isFinite(days) || Math.abs(days) > 365 || (days * 2) % 1 !== 0) {
    throw new AppError('INVALID_FIELD', { field: 'annualLeaveAdjustment' });
  }
  return days;
}

function translateDbError(error) {
  if (error instanceof UniqueConstraintError) return new AppError('USERNAME_TAKEN');
  if (error instanceof ValidationError) {
    return new AppError('INVALID_FIELD', { field: error.errors[0]?.path });
  }
  return error;
}

export async function login(username, password) {
  const name = normaliseUsername(username);
  assertNotLocked(name);

  const user = await User.findOne({ where: { username: name } });
  const valid = await verifyPassword(String(password || ''), user ? user.passwordHash : DUMMY_HASH);
  if (!user || !valid || !user.active) {
    recordFailedLogin(name);
    throw new AppError('INVALID_CREDENTIALS');
  }
  clearFailedLogins(name);
  return { token: createToken(user), user };
}

export async function changePassword(sessionUser, currentPassword, newPassword) {
  const user = await User.findByPk(sessionUser.id);
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    throw new AppError('WRONG_PASSWORD');
  }
  checkPasswordStrength(newPassword);
  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  return true;
}

export function list({ includeInactive = false } = {}) {
  return User.findAll({
    where: includeInactive ? {} : { active: true },
    order: [['firstName', 'ASC'], ['lastName', 'ASC']],
  });
}

export async function create(input) {
  checkPasswordStrength(input.password);
  try {
    return await User.create({
      username: normaliseUsername(input.username),
      passwordHash: await hashPassword(input.password),
      firstName: checkName(input.firstName, 'firstName'),
      lastName: checkName(input.lastName, 'lastName'),
      role: input.role,
      hireDate: checkDate(input.hireDate, 'hireDate'),
      birthDate: checkDate(input.birthDate, 'birthDate', { optional: true }),
      annualLeaveAdjustment: checkAdjustment(input.annualLeaveAdjustment ?? 0),
    });
  } catch (error) {
    throw translateDbError(error);
  }
}

export async function update(admin, id, input) {
  const user = await User.findByPk(id);
  if (!user) throw notFound();

  // Admins can't lock themselves out.
  const isSelf = String(user.id) === String(admin.id);
  if (isSelf && (input.active === false || input.role === 'EMPLOYEE')) {
    throw new AppError('CANNOT_CHANGE_OWN_ACCESS');
  }

  if (input.firstName !== undefined) user.firstName = checkName(input.firstName, 'firstName');
  if (input.lastName !== undefined) user.lastName = checkName(input.lastName, 'lastName');
  if (input.role !== undefined) user.role = input.role;
  if (input.hireDate !== undefined) user.hireDate = checkDate(input.hireDate, 'hireDate');
  if (input.birthDate !== undefined) user.birthDate = checkDate(input.birthDate, 'birthDate', { optional: true });
  if (input.annualLeaveAdjustment !== undefined) {
    user.annualLeaveAdjustment = checkAdjustment(input.annualLeaveAdjustment);
  }
  if (input.active !== undefined) user.active = input.active;
  if (input.newPassword) {
    checkPasswordStrength(input.newPassword);
    user.passwordHash = await hashPassword(input.newPassword);
  }

  try {
    return await user.save();
  } catch (error) {
    throw translateDbError(error);
  }
}
