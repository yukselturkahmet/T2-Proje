import React, { useState } from 'react';
import styled from 'styled-components';

const AdminPageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(45deg, #144FC4, #48BB27);
  font-family: 'Roboto', sans-serif;
`;

const AdminContent = styled.div`
  background:transparent;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
`;

const UserInfo = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.span`
  font-weight: bold;
  margin-right: 10px;
  color: #333;
`;

const Info = styled.span`
  color: #555;
`;

const Input = styled.input`
  margin: 10px 0;
  padding: 12px;
  width: calc(100% - 24px);
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 16px;
`;

const Button = styled.button`
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const ErrorText = styled.div`
  margin-top: 20px;
  color: #d9534f;
`;

const NoUserText = styled.div`
  margin-top: 20px;
  color: #f0ad4e;
`;

const EmployeeDataContainer = styled.div`
  margin-top: 20px;
`;

const AdminPage = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [error, setError] = useState(null);
  const [noUserFound, setNoUserFound] = useState(false);

  const handleClick = async () => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetEmployeeByName($firstname: String!, $lastname: String!) {
              getEmployeeByName(firstname: $firstname, lastname: $lastname) {
                employee_id
                start_date
                end_date
                leave_duration_day
                leave_duration_hour
                leave_type
                firstname
                lastname
                reason  
              }
            }
          `,
          variables: {
            firstname,
            lastname,
          },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        setError(data.errors);
        setEmployeeData(null);
        setNoUserFound(false);
      } else if (data.data.getEmployeeByName === null) {
        setNoUserFound(true);
        setEmployeeData(null);
        setError(null);
      } else {
        setEmployeeData(data.data.getEmployeeByName);
        setError(null);
        setNoUserFound(false);
      }
    } catch (error) {
      setError(error);
      setEmployeeData(null);
      setNoUserFound(false);
    }
  };

  return (
    <AdminPageWrapper>
      <AdminContent>
        <UserInfo>
          <Label style={{color: '#F9F6EE'}}>First Name:</Label>
          <Input
            type="text"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />
          <Label style={{color: '#F9F6EE'}}>Last Name:</Label>
          <Input
            type="text"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
        </UserInfo>
        <Button onClick={handleClick}>Get Employee Info</Button>
        {employeeData && (
          <EmployeeDataContainer>
            <h3>Employee Information:</h3>
            <p><Label>ID:</Label> <Info>{employeeData.employee_id}</Info></p>
            <p><Label>Start Date:</Label> <Info>{employeeData.start_date}</Info></p>
            <p><Label>End Date:</Label> <Info>{employeeData.end_date}</Info></p>
            <p><Label>Leave Duration (Days):</Label> <Info>{employeeData.leave_duration_day}</Info></p>
            <p><Label>Leave Duration (Hours):</Label> <Info>{employeeData.leave_duration_hour}</Info></p>
            <p><Label>Leave Type:</Label> <Info>{employeeData.leave_type}</Info></p>
            <p><Label>First Name:</Label> <Info>{employeeData.firstname}</Info></p>
            <p><Label>Last Name:</Label> <Info>{employeeData.lastname}</Info></p>
            <p><Label>Reason:</Label> <Info>{employeeData.reason}</Info></p>
          </EmployeeDataContainer>
        )}
        {noUserFound && (
          <NoUserText>No user found with the given name.</NoUserText>
        )}
        {error && (
          <ErrorText>Error: {JSON.stringify(error, null, 2)}</ErrorText>
        )}
      </AdminContent>
    </AdminPageWrapper>
  );
};


export default AdminPage;


