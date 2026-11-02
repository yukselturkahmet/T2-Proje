import { Op } from 'sequelize';
import { addDays, todayISO } from '../../../shared/calendar.js';
import { annualBalance, evaluateLeave } from '../../../shared/policy.js';
import { LeaveRequest, User, sequelize } from '../db.js';
import { AppError, forbidden, notFound } from '../errors.js';

const ACTIVE = ['PENDING', 'APPROVED'];

// Rules that still matter when an admin approves a request later.
// (Notice period and past-date rules were checked when it was sent.)
const RECHECK_ON_APPROVAL = ['INSUFFICIENT_BALANCE', 'EXCEEDS_YEARLY_LIMIT', 'OVERLAPPING_REQUEST'];

function plain(request) {
  return {
    id: request.id,
    type: request.type,
    status: request.status,
    startDate: request.startDate,
    endDate: request.endDate,
    days: request.days,
  };
}

export async function balanceFor(user, transaction) {
  const requests = await LeaveRequest.findAll({
    where: { userId: user.id, type: 'ANNUAL', status: ACTIVE },
    transaction,
  });
  return annualBalance(user, requests.map(plain), todayISO());
}

export function listForUser(userId) {
  return LeaveRequest.findAll({
    where: { userId },
    order: [['startDate', 'DESC'], ['id', 'DESC']],
  });
}

export async function requestLeave(sessionUser, input) {
  return sequelize.transaction(async (transaction) => {
    // Lock the user row so two requests sent at once can't both pass the
    // balance and overlap checks.
    const user = await User.findByPk(sessionUser.id, { lock: true, transaction });
    const others = await LeaveRequest.findAll({ where: { userId: user.id }, transaction });

    const result = evaluateLeave(input, user, others.map(plain), todayISO());
    if (result.problems.length) throw new AppError('LEAVE_RULES', { problems: result.problems });

    return LeaveRequest.create({
      userId: user.id,
      type: input.type,
      startDate: input.startDate,
      endDate: input.endDate,
      days: result.days,
      reason: (input.reason || '').trim(),
    }, { transaction });
  });
}

export async function cancelLeave(sessionUser, id) {
  const request = await LeaveRequest.findByPk(id);
  if (!request) throw notFound();
  if (request.userId !== sessionUser.id) throw forbidden();

  // Pending requests can always be withdrawn; approved ones only before
  // the leave starts.
  const cancellable = request.status === 'PENDING'
    || (request.status === 'APPROVED' && request.startDate > todayISO());
  if (!cancellable) throw new AppError('INVALID_STATE', { status: request.status });

  request.status = 'CANCELLED';
  return request.save();
}

export async function decideLeave(admin, id, approve, note) {
  const trimmedNote = (note || '').trim();
  if (!approve && !trimmedNote) throw new AppError('NOTE_REQUIRED');

  return sequelize.transaction(async (transaction) => {
    const request = await LeaveRequest.findByPk(id, { lock: true, transaction });
    if (!request) throw notFound();
    if (request.status !== 'PENDING') throw new AppError('INVALID_STATE', { status: request.status });
    if (request.userId === admin.id) throw new AppError('SELF_APPROVAL');

    if (approve) {
      const user = await User.findByPk(request.userId, { lock: true, transaction });
      const others = await LeaveRequest.findAll({ where: { userId: user.id }, transaction });
      const { problems } = evaluateLeave(plain(request), user, others.map(plain), todayISO());
      const blocking = problems.filter((p) => RECHECK_ON_APPROVAL.includes(p.code));
      if (blocking.length) throw new AppError('LEAVE_RULES', { problems: blocking });
    }

    request.status = approve ? 'APPROVED' : 'REJECTED';
    request.decisionNote = trimmedNote || null;
    request.decidedAt = new Date();
    request.decidedById = admin.id;
    return request.save({ transaction });
  });
}

export async function search({ status, userId, type, year, limit = 50, offset = 0 } = {}) {
  const where = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;
  if (type) where.type = type;
  if (year) {
    where.startDate = { [Op.lte]: `${year}-12-31` };
    where.endDate = { [Op.gte]: `${year}-01-01` };
  }
  const { rows, count } = await LeaveRequest.findAndCountAll({
    where,
    // Pending first (oldest waiting at the top), then the most recent.
    order: [
      [sequelize.literal(`CASE WHEN "LeaveRequest"."status" = 'PENDING' THEN 0 ELSE 1 END`), 'ASC'],
      [sequelize.literal(`CASE WHEN "LeaveRequest"."status" = 'PENDING' THEN "LeaveRequest"."created_at" END`), 'ASC'],
      ['startDate', 'DESC'],
    ],
    limit: Math.min(Math.max(limit, 1), 200),
    offset: Math.max(offset, 0),
  });
  return { items: rows, total: count };
}

export async function overview() {
  const today = todayISO();
  const [pendingCount, onLeaveToday, upcoming, activeEmployees] = await Promise.all([
    LeaveRequest.count({ where: { status: 'PENDING' } }),
    LeaveRequest.findAll({
      where: { status: 'APPROVED', startDate: { [Op.lte]: today }, endDate: { [Op.gte]: today } },
      order: [['endDate', 'ASC']],
    }),
    LeaveRequest.findAll({
      where: { status: 'APPROVED', startDate: { [Op.gt]: today, [Op.lte]: addDays(today, 30) } },
      order: [['startDate', 'ASC']],
    }),
    User.count({ where: { active: true } }),
  ]);
  return { pendingCount, onLeaveToday, upcoming, activeEmployees };
}
