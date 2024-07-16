import { ApolloServer } from 'apollo-server';
import { typeDefs } from './schema.js';
import { sequelize, Employee, Admin, User } from './db.js';

const resolvers = {
  Query: {
    async getEmployees() {
      return await Employee.findAll();
    },
    async getAdmins() {
      return await Admin.findAll();
    },
    async getUsers() {
      return await User.findAll();
    },
  },
  Mutation: {
    async createEmployeeLeave(_, { input }) {
      const { start_date, end_date, leave_duration_day, leave_duration_hour, leave_type, firstname,lastname, reason } = input;
      const newEmployeeLeave = await Employee.create({
        start_date,
        end_date,
        leave_duration_day,
        leave_duration_hour,
        leave_type,
        firstname,
        lastname,
        reason
      });
      return newEmployeeLeave;
    },
    async createUser(_, { input }) {
      const { username, pword } = input;
      const newUser = await User.create({
        
        username,
        pword
      });
      return newUser;
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
