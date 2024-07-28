import { Sequelize, DataTypes } from 'sequelize';

// Initialize Sequelize
const sequelize = new Sequelize('t2_database', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql',
});

// Define User model
const User = sequelize.define('User', {
  employee_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: true
  },
  pword: {
    type: DataTypes.STRING(40),
    allowNull: true
  }
}, {
  tableName: 'employees',
  timestamps: false
});

// Define Employee model
const Employee = sequelize.define('Employee', {
  detail_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  leave_duration_day: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  leave_duration_hour: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  leave_type: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  reason: {
    type: DataTypes.STRING(1000),
    allowNull: true
  },
  firstname: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  lastname: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  is_checked: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  username: {
    type: DataTypes.STRING(40),
    references: {
      model: User,
      key: 'username'
    }
  }
}, {
  tableName: 'employee_details',
  timestamps: false
});

// Define Admin model
const Admin = sequelize.define('Admin', {
  admin_id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'employee_id'
    }
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  password_: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'admins',
  timestamps: false
});

User.hasMany(Employee, { foreignKey: 'username', sourceKey: 'username' });
Employee.belongsTo(User, { foreignKey: 'username', targetKey: 'username' });

User.hasOne(Admin, { foreignKey: 'employee_id' });
Admin.belongsTo(User, { foreignKey: 'employee_id' });

export { sequelize, User, Employee, Admin };
