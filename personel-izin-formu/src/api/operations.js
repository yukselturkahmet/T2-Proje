// Every GraphQL operation the app sends. Each one is named, which is also
// how the demo backend (demo.js) recognises it.

const BALANCE = 'annualBalance { earned adjustment used pending available yearsOfService nextAccrualDate nextAccrualDays }';
const USER = `id username firstName lastName role hireDate birthDate active annualLeaveAdjustment ${BALANCE}`;
const REQUEST = `
  id type startDate endDate days reason status decisionNote decidedAt createdAt
  decidedBy { id firstName lastName }
`;

export const LOGIN = `mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) { token user { ${USER} } }
}`;

export const ME = `query Me { me { ${USER} } }`;

export const MY_REQUESTS = `query MyRequests { myLeaveRequests { ${REQUEST} } }`;

export const REQUEST_LEAVE = `mutation RequestLeave($input: LeaveInput!) {
  requestLeave(input: $input) { ${REQUEST} }
}`;

export const CANCEL_LEAVE = `mutation CancelLeave($id: ID!) { cancelLeave(id: $id) { id status } }`;

export const CHANGE_PASSWORD = `mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
  changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
}`;

export const OVERVIEW = `query Overview {
  overview {
    pendingCount activeEmployees
    onLeaveToday { id type startDate endDate user { id firstName lastName } }
    upcoming { id type startDate endDate days user { id firstName lastName } }
  }
}`;

export const LEAVE_REQUESTS = `query LeaveRequests($filter: LeaveFilter) {
  leaveRequests(filter: $filter) {
    total
    items { ${REQUEST} user { id firstName lastName username ${BALANCE} } }
  }
}`;

export const USERS = `query Users($includeInactive: Boolean) { users(includeInactive: $includeInactive) { ${USER} } }`;

export const DECIDE_LEAVE = `mutation DecideLeave($id: ID!, $approve: Boolean!, $note: String) {
  decideLeave(id: $id, approve: $approve, note: $note) { id status }
}`;

export const CREATE_USER = `mutation CreateUser($input: NewUserInput!) { createUser(input: $input) { ${USER} } }`;

export const UPDATE_USER = `mutation UpdateUser($id: ID!, $input: UserUpdateInput!) {
  updateUser(id: $id, input: $input) { ${USER} }
}`;
