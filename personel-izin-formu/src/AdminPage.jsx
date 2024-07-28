import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const AdminPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh; 
  width: 100vw;  
  background: linear-gradient(45deg, #144FC4, #48BB27);
  margin: 0;
  padding: 0;
`;

const AdminContent = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 800px;
  margin: 40px 0;
  text-align: center;
  flex-grow: 1;
  overflow-y: auto;
`;

const Button = styled.button`
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  background-color: #0056b3;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #ff7f00;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;

  & > button {
    margin: 0 5px;
    padding: 5px 10px;
    background-color: #144FC4;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background-color: #48BB27;
    }

    &:disabled {
      background-color: #c41111;
      cursor: not-allowed;
    }
  }
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

const ErrorText = styled.div`
  margin-top: 20px;
  color: #d9534f;
`;

const NoUserText = styled.div`
  margin-top: 20px;
  color: #f0ad4e;
`;

const AdminPage = () => {
  const [username, setUsername] = useState('');
  const [employeeData, setEmployeeData] = useState([]);
  const [error, setError] = useState(null);
  const [noUserFound, setNoUserFound] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      console.log('Fetching data for username:', username, 'Page:', currentPage);
      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query getEmployeesByUsername($username: String!, $page: Int!) {
                getEmployeesByUsername(username: $username, page: $page) {
                  leaveForms {
                    firstname
                    lastname
                    is_checked
                    start_date
                    end_date
                    leave_duration_day
                    leave_duration_hour
                    leave_type
                    reason
                  }
                  totalPages
                }
              }
            `,
            variables: { username, page: currentPage },
          }),
        });

        const { data, errors } = await response.json();
        console.log('Response data:', data);
        console.error('GraphQL errors:', errors);

        if (errors) {
          setEmployeeData([]); // Set to empty array in case of errors
          setError(errors);
          setNoUserFound(false);
        } else {
          const leaveFormsData = data.getEmployeesByUsername.leaveForms || [];
          console.log('Setting employeeData state:', leaveFormsData);
          setEmployeeData(leaveFormsData);
          setTotalPages(data.getEmployeesByUsername.totalPages || 1);
          setError(null);
          setNoUserFound(leaveFormsData.length === 0);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
        setEmployeeData([]); // Set to empty array in case of an error
        setError(error);
        setNoUserFound(false);
      }
    };

    if (username) {
      fetchEmployeeData();
    }
  }, [username, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      buttons.push(
        <button key="first" onClick={() => handlePageChange(1)}>
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="start-ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          disabled={i === currentPage}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="end-ellipsis">...</span>);
      }
      buttons.push(
        <button key="last" onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <AdminPageWrapper>
      <AdminContent>
        <UserInfo>
          <Label>Username:</Label>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </UserInfo>
      
        {employeeData.length > 0 && (
          <div>
            <h3>Employee Information:</h3>
            {employeeData.map((employee) => (
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
            <Pagination>
              {renderPaginationButtons()}
            </Pagination>
          </div>
        )}
        {noUserFound && (
          <NoUserText>No user found with the given name.</NoUserText>
        )}
        {error && (
          <ErrorText>Error: {error.message}</ErrorText>
        )}
      </AdminContent>
    </AdminPageWrapper>
  );
};

export default AdminPage;
