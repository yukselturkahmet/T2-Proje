import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Employee {
    username: String
    start_date: String
    end_date: String
    leave_duration_day: Int
    leave_duration_hour: Int
    leave_type: String
    firstname: String
    lastname: String
    reason: String
    user: User
    is_checked: Boolean 
    detail_id: Int
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
    employees: [Employee]
  }

  type Query {
    getEmployees: [Employee]
    getAdmins: [Admin]
    getUsers: [User]
    getEmployeesByName(firstname: String!, lastname: String!): [Employee]
    authenticateUser(username: String!, pword: String!): User
    authenticateAdmin(username: String!, password_: String!): Admin
    getEmployeesByUsername(username: String!): [Employee]
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
    username: String! 
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
