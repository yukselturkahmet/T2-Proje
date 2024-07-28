import { ApolloServer } from 'apollo-server';
import { typeDefs } from './schema.js';
import { sequelize, Employee, Admin, User } from './db.js';

const resolvers = {
  Query: {  
    getEmployeesByUsername: async (_, { username }) => {
      try {
        const user = await User.findOne({
          where: { username },
          include: [{ model: Employee }]
        });
    
        if (!user) {
          throw new Error('User not found');
        }
    
        return user.Employees;
      } catch (error) {
        console.error('Error fetching employees:', error.message);
        throw new Error('Failed to fetch employees');
      }
    },

    async authenticateUser(_, { username, pword }) {
      return await User.findOne({
        where: { username, pword }
      });
    },

    async authenticateAdmin(_, { username, password_ }) {
      return await Admin.findOne({
        where: { username, password_ }
      });
    },

    async getEmployees() {
      return await Employee.findAll();
    },

    async getAdmins() {
      return await Admin.findAll();
    },

    async getUsers() {
      return await User.findAll();
    },

    async getEmployeesByName(_, { firstname, lastname }) {
      return await Employee.findAll({
        where: { firstname, lastname }
      });
    }
  },
  Mutation: {
    async createEmployeeLeave(_, { input }) {
      const { start_date, end_date, leave_duration_day, leave_duration_hour, leave_type, firstname, lastname, reason, is_checked,employee_id,username } = input;
      return await Employee.create({
        start_date,
        end_date,
        leave_duration_day,
        leave_duration_hour,
        leave_type,
        firstname,
        lastname,
        reason,
        is_checked,
        employee_id,
        username
      });
    },

    async createUser(_, { input }) {
      const { username, pword } = input;
      return await User.create({
        username,
        pword
      });
    }
  },
  Employee: {
    user: async (parent) => {
      return await User.findOne({
        where: { employee_id: parent.employee_id }
      });
    }
  },
  User: {
    employees: async (parent) => { // Updated to `employees` to match schema
      return await Employee.findAll({
        where: { employee_id: parent.employee_id }
      });
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

// Test the database connection before starting the server
sequelize.authenticate().then(() => {
  console.log('Database connected...');
  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
