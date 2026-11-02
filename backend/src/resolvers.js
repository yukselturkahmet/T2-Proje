import { requireAdmin, requireUser } from './auth.js';
import { User } from './db.js';
import { forbidden } from './errors.js';
import * as leaves from './services/leaves.js';
import * as users from './services/users.js';

const iso = (date) => (date ? new Date(date).toISOString() : null);

const canSeePrivate = (ctx, user) =>
  Boolean(ctx.user) && (ctx.user.role === 'ADMIN' || String(ctx.user.id) === String(user.id));

// Loads a user once per HTTP request, however many fields ask for it.
function loadUser(ctx, id) {
  if (id == null) return null;
  if (!ctx.userCache.has(id)) ctx.userCache.set(id, User.findByPk(id));
  return ctx.userCache.get(id);
}

export const resolvers = {
  Query: {
    me: (_, __, ctx) => ctx.user,
    myLeaveRequests: (_, __, ctx) => leaves.listForUser(requireUser(ctx).id),
    leaveRequests: (_, { filter }, ctx) => {
      requireAdmin(ctx);
      return leaves.search(filter || {});
    },
    users: (_, { includeInactive }, ctx) => {
      requireAdmin(ctx);
      return users.list({ includeInactive });
    },
    overview: (_, __, ctx) => {
      requireAdmin(ctx);
      return leaves.overview();
    },
  },

  Mutation: {
    login: (_, { username, password }) => users.login(username, password),
    changePassword: (_, { currentPassword, newPassword }, ctx) =>
      users.changePassword(requireUser(ctx), currentPassword, newPassword),

    requestLeave: (_, { input }, ctx) => leaves.requestLeave(requireUser(ctx), input),
    cancelLeave: (_, { id }, ctx) => leaves.cancelLeave(requireUser(ctx), id),

    decideLeave: (_, { id, approve, note }, ctx) => leaves.decideLeave(requireAdmin(ctx), id, approve, note),
    createUser: (_, { input }, ctx) => {
      requireAdmin(ctx);
      return users.create(input);
    },
    updateUser: (_, { id, input }, ctx) => users.update(requireAdmin(ctx), id, input),
  },

  // Personal fields are visible to the user themselves and to admins only
  // (an employee can still see the name of the admin who decided a request).
  User: {
    birthDate: (user, _, ctx) => (canSeePrivate(ctx, user) ? user.birthDate : null),
    annualLeaveAdjustment: (user, _, ctx) => (canSeePrivate(ctx, user) ? user.annualLeaveAdjustment : 0),
    annualBalance: (user, _, ctx) => {
      if (!canSeePrivate(ctx, user)) throw forbidden();
      return leaves.balanceFor(user);
    },
  },

  LeaveRequest: {
    createdAt: (request) => iso(request.createdAt),
    decidedAt: (request) => iso(request.decidedAt),
    user: (request, _, ctx) => loadUser(ctx, request.userId),
    decidedBy: (request, _, ctx) => loadUser(ctx, request.decidedById),
  },
};
