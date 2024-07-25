import { Sequelize, DataTypes } from 'sequelize';

// Initialize Sequelize to connect to your MySQL database
const sequelize = new Sequelize('t2_database', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql',
});

// Define the User model (corresponds to the `employees` table)
const User = sequelize.define('User', {
  employee_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(40),
    allowNull: true
  },
  pword: {
    type: DataTypes.STRING(40),
    allowNull: true
  }
}, {
  tableName: 'employees',
  timestamps: false
});

// Define the Employee model (corresponds to the `employee_details` table)
const Employee = sequelize.define('Employee', {
  employee_id: {
    type: DataTypes.INTEGER,
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
  }
}, {
  tableName: 'employee_details',
  timestamps: false
});

// Define the Admin model (corresponds to the `admins` table)
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

// Set up associations
User.hasOne(Employee, { foreignKey: 'employee_id' });
Employee.belongsTo(User, { foreignKey: 'employee_id' });

User.hasOne(Admin, { foreignKey: 'employee_id' });
Admin.belongsTo(User, { foreignKey: 'employee_id' });

export { sequelize, User, Employee, Admin };
