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
