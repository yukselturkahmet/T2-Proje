import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Employee {
    employee_id: ID!
    start_date: String
    end_date: String
    leave_duration_day: Int
    leave_duration_hour: Int
    leave_type: String
    firstname: String
    lastname: String
    reason: String
    user: User # Adding the relationship field
  }

  type Admin {
    admin_id: ID!
    employee_id: Int
    username: String
    password_: String
  }

  type User {
    employee_id: ID!
    username: String
    pword: String
    employee: Employee # Adding the relationship field
  }

  type Query {
    getEmployees: [Employee]
    getAdmins: [Admin]
    getUsers: [User]
    getEmployeeByName(firstname: String!, lastname: String!): Employee
    authenticateUser(username: String!, pword: String!): User #  
    authenticateAdmin(username: String!, pword: String!): Admin
  }

  input CreateEmployeeLeaveInput {
    start_date: String!
    end_date: String!
    leave_duration_day: Int!
    leave_duration_hour: Int!
    leave_type: String!
    firstname: String!
    lastname: String!
    reason: String!
  }

  input CreateUserInput {
    username: String!
    pword: String!
  }

  type Mutation {
    createEmployeeLeave(input: CreateEmployeeLeaveInput!): Employee
    createUser(input: CreateUserInput!): User
  }
`;
