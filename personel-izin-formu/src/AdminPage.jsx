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
  const [employeeData, setEmployeeData] = useState([]);
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
            query GetEmployeesByName($firstname: String!, $lastname: String!) {
              getEmployeesByName(firstname: $firstname, lastname: $lastname) {
                employee_id
                start_date
                end_date
                leave_duration_day
                leave_duration_hour
                leave_type
                firstname
                lastname
                reason
                is_checked
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
        setEmployeeData([]);
        setNoUserFound(false);
      } else if (data.data.getEmployeesByName.length === 0) {
        setNoUserFound(true);
        setEmployeeData([]);
        setError(null);
      } else {
        setEmployeeData(data.data.getEmployeesByName);
        setError(null);
        setNoUserFound(false);
      }
    } catch (error) {
      console.error('Network Error:', error);
      setError(error);
      setEmployeeData([]);
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
        {employeeData.length > 0 && (
          <div>
            <h3>Employee Information:</h3>
            {employeeData.map(employee => (
              <div key={employee.employee_id}>
                <p><Label>ID:</Label> <Info>{employee.employee_id}</Info></p>
                <p><Label>Start Date:</Label> <Info>{employee.start_date}</Info></p>
                <p><Label>End Date:</Label> <Info>{employee.end_date}</Info></p>
                <p><Label>Leave Duration (Days):</Label> <Info>{employee.leave_duration_day}</Info></p>
                <p><Label>Leave Duration (Hours):</Label> <Info>{employee.leave_duration_hour}</Info></p>
                <p><Label>Leave Type:</Label> <Info>{employee.leave_type}</Info></p>
                <p><Label>First Name:</Label> <Info>{employee.firstname}</Info></p>
                <p><Label>Last Name:</Label> <Info>{employee.lastname}</Info></p>
                <p><Label>Reason:</Label> <Info>{employee.reason}</Info></p>
                <p><Label>is_checked:</Label> <Info>{employee.is_checked ? 'true' : 'false'}</Info></p>
                <hr />
              </div>
            ))}
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
