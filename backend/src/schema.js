export const typeDefs = /* GraphQL */ `
  scalar JSON

  enum Role { EMPLOYEE ADMIN }
  enum LeaveStatus { PENDING APPROVED REJECTED CANCELLED }
  enum LeaveType {
    ANNUAL SICK MARRIAGE PATERNITY BEREAVEMENT ADOPTION
    CHILD_CARE MATERNITY EXCUSE UNPAID
  }

  type Balance {
    earned: Float!
    adjustment: Float!
    used: Float!
    pending: Float!
    available: Float!
    yearsOfService: Int!
    nextAccrualDate: String!
    nextAccrualDays: Int!
  }

  type User {
    id: ID!
    username: String!
    firstName: String!
    lastName: String!
    role: Role!
    hireDate: String!
    birthDate: String
    active: Boolean!
    annualLeaveAdjustment: Float!
    annualBalance: Balance!
  }

  type LeaveRequest {
    id: ID!
    type: LeaveType!
    startDate: String!
    endDate: String!
    days: Float!
    reason: String!
    status: LeaveStatus!
    decisionNote: String
    decidedAt: String
    createdAt: String!
    user: User!
    decidedBy: User
  }

  type LeaveRequestPage {
    items: [LeaveRequest!]!
    total: Int!
  }

  type Overview {
    pendingCount: Int!
    onLeaveToday: [LeaveRequest!]!
    upcoming: [LeaveRequest!]!
    activeEmployees: Int!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input LeaveInput {
    type: LeaveType!
    startDate: String!
    endDate: String!
    reason: String
  }

  input LeaveFilter {
    status: LeaveStatus
    userId: ID
    type: LeaveType
    year: Int
    limit: Int
    offset: Int
  }

  input NewUserInput {
    username: String!
    password: String!
    firstName: String!
    lastName: String!
    role: Role!
    hireDate: String!
    birthDate: String
    annualLeaveAdjustment: Float
  }

  input UserUpdateInput {
    firstName: String
    lastName: String
    role: Role
    hireDate: String
    birthDate: String
    annualLeaveAdjustment: Float
    active: Boolean
    newPassword: String
  }

  type Query {
    "The signed-in user, or null."
    me: User
    myLeaveRequests: [LeaveRequest!]!

    "Admin only."
    leaveRequests(filter: LeaveFilter): LeaveRequestPage!
    users(includeInactive: Boolean): [User!]!
    overview: Overview!
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!

    requestLeave(input: LeaveInput!): LeaveRequest!
    cancelLeave(id: ID!): LeaveRequest!

    "Admin only."
    decideLeave(id: ID!, approve: Boolean!, note: String): LeaveRequest!
    createUser(input: NewUserInput!): User!
    updateUser(id: ID!, input: UserUpdateInput!): User!
  }
`;
