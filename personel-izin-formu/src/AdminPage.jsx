import React, { useState } from 'react';
import styled from 'styled-components';

const AdminPageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #f0f0f0;
`;

const AdminContent = styled.div`
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
`;

const UserInfo = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.span`
  font-weight: bold;
  margin-right: 10px;
  color: #000000;
`;

const Info = styled.span`
  color: #333333;
`;

const Input = styled.input`
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
`;

const AdminPage = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [error, setError] = useState(null);
  const [noUserFound, setNoUserFound] = useState(false);

  const handleClick = async () => {
    console.log('Button clicked!');
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
        console.error('GraphQL Error:', data.errors);
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
      console.error('Network Error:', error);
      setError(error);
      setEmployeeData(null);
      setNoUserFound(false);
    }
  };

  return (
    <AdminPageWrapper>
      <AdminContent>
        <UserInfo>
          <Label>First Name:</Label>
          <Input
            type="text"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />
          <Label>Last Name:</Label>
          <Input
            type="text"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
        </UserInfo>
        <button style={{color:'white'}} onClick={handleClick}>Get Employee Info</button>
        {employeeData && (
          <div>
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
          </div>
        )}
        {noUserFound && (
          <div>
            <h3 style={{color:'black'}}>No user found with the given name.</h3>
          </div>
        )}
        {error && (
          <div>
            <h3>Error:</h3>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}
      </AdminContent>
    </AdminPageWrapper>
  );
};

export default AdminPage;
