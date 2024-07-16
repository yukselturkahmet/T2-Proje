import { Sequelize, DataTypes } from 'sequelize';

// Initialize Sequelize to connect to your MySQL database
const sequelize = new Sequelize('t2_database', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql',

});

// Define the Employee model
const Employee = sequelize.define('Employee', {
  employee_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  start_date: {
    type: DataTypes.DATE
  },
  end_date: {
    type: DataTypes.DATE
  },
  leave_duration_day: {
    type: DataTypes.INTEGER
  },
  leave_duration_hour: {
    type: DataTypes.INTEGER
  },
  leave_type: {
    type: DataTypes.STRING
  },
  firstname: {
    type: DataTypes.STRING
  },
  lastname: {
    type: DataTypes.STRING
  },
  reason: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'employee_details',
  timestamps: false
});

// Define the Admin model
const Admin = sequelize.define('Admin', {
  admin_id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  employee_id: {
    type: DataTypes.INTEGER
  },
  username: {
    type: DataTypes.STRING
  },
  password_: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'admins',
  timestamps: false
});

// Define the User model
const User = sequelize.define('User', {
  employee_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING
  },
  pword: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'employees',
  timestamps: false
});

export { sequelize, Employee, Admin, User };
 