import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Employee {
    employee_id: ID!
    start_date: String
    end_date: String
    leave_duration_day: Int
    leave_duration_hour: Int
    leave_type: String
    name_surname: String
    reason: String
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
  }

  type Query {
    getEmployees: [Employee]
    getAdmins: [Admin]
    getUsers: [User]
  }

  input CreateEmployeeLeaveInput {
    start_date: String!
    end_date: String!
    leave_duration_day: Int!
    leave_duration_hour: Int!
    leave_type: String!
    name_surname: String!
    reason: String!
  }
`;
