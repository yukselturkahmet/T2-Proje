import { DataTypes, Sequelize } from 'sequelize';
import { config } from './config.js';
import { LEAVE_TYPE_CODES } from '../../shared/policy.js';

export const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'postgres',
  logging: false,
  define: { underscored: true },
});

const ROLES = ['EMPLOYEE', 'ADMIN'];
const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

// DECIMAL comes back from Postgres as a string; expose it as a number.
const decimal = (field) => ({
  type: DataTypes.DECIMAL(5, 1),
  allowNull: false,
  defaultValue: 0,
  get() {
    return Number(this.getDataValue(field));
  },
});

export const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: true,
    validate: { is: /^[a-z0-9._-]{3,40}$/ },
  },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  firstName: { type: DataTypes.STRING(60), allowNull: false },
  lastName: { type: DataTypes.STRING(60), allowNull: false },
  role: { type: DataTypes.ENUM(...ROLES), allowNull: false, defaultValue: 'EMPLOYEE' },
  hireDate: { type: DataTypes.DATEONLY, allowNull: false },
  birthDate: { type: DataTypes.DATEONLY },
  // Manual correction to the annual leave balance (e.g. carried over from
  // a previous system). Positive adds days, negative removes them.
  annualLeaveAdjustment: decimal('annualLeaveAdjustment'),
  active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: 'users' });

export const LeaveRequest = sequelize.define('LeaveRequest', {
  type: { type: DataTypes.ENUM(...LEAVE_TYPE_CODES), allowNull: false },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY, allowNull: false },
  days: decimal('days'),
  reason: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  status: { type: DataTypes.ENUM(...STATUSES), allowNull: false, defaultValue: 'PENDING' },
  decidedAt: { type: DataTypes.DATE },
  decisionNote: { type: DataTypes.TEXT },
}, {
  tableName: 'leave_requests',
  indexes: [{ fields: ['user_id', 'status'] }, { fields: ['status', 'start_date'] }],
});

User.hasMany(LeaveRequest, { as: 'leaveRequests', foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });
LeaveRequest.belongsTo(User, { as: 'user', foreignKey: 'userId' });
LeaveRequest.belongsTo(User, { as: 'decidedBy', foreignKey: 'decidedById' });
