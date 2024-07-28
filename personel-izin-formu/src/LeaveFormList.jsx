import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
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

const DataSection = styled.div`
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

const LeaveFormList = ({ username }) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [leaveForms, setLeaveForms] = useState([]);
  
    useEffect(() => {
      const fetchLeaveForms = async () => {
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
            setLeaveForms([]); // Set to empty array in case of errors
          } else {
            const leaveFormsData = data.getEmployeesByUsername.leaveForms || [];
            console.log('Setting leaveForms state:', leaveFormsData);
            setLeaveForms(leaveFormsData);
            setTotalPages(data.getEmployeesByUsername.totalPages || 1);
          }
        } catch (error) {
          console.error('Error fetching leave forms:', error);
          setLeaveForms([]); // Set to empty array in case of an error
        }
      };
  
      fetchLeaveForms();
    }, [username, currentPage]);
  
    useEffect(() => {
      console.log('leaveForms state:', leaveForms);
      console.log('totalPages state:', totalPages);
    }, [leaveForms, totalPages]);
  
    const handleButtonClick = () => {
      navigate('/leave-form');
    };
  
    const handlePreviousPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };
  
    const handleNextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    };
  
    const handlePageClick = (pageNumber) => {
      setCurrentPage(pageNumber);
    };
  
    const renderPaginationButtons = () => {
      const buttons = [];
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);
  
      if (startPage > 1) {
        buttons.push(
          <button key="first" onClick={() => handlePageClick(1)}>
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
            onClick={() => handlePageClick(i)}
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
          <button key="last" onClick={() => handlePageClick(totalPages)}>
            {totalPages}
          </button>
        );
      }
  
      return buttons;
    };
  
    return (
      <Container>
        <DataSection>
          {leaveForms.length > 0 ? (
            leaveForms.map((leave, index) => (
              <div key={index}>
                <p style={{ color: 'black' }}>{`Firstname: ${leave.firstname}`}</p>
                <p style={{ color: 'black' }}>{`Lastname: ${leave.lastname}`}</p>
                <p style={{ color: 'black' }}>{`Is Checked: ${leave.is_checked ? 'Yes' : 'No'}`}</p>
                <p style={{ color: 'black' }}>{`Leave Type: ${leave.leave_type}`}</p>
                <p style={{ color: 'black' }}>{`Start Date: ${leave.start_date}`}</p>
                <p style={{ color: 'black' }}>{`End Date: ${leave.end_date}`}</p>
                <p style={{ color: 'black' }}>{`Duration: ${leave.leave_duration_day} days, ${leave.leave_duration_hour} hours`}</p>
                <p style={{ color: 'black' }}>{`Reason: ${leave.reason}`}</p>
              </div>
            ))
          ) : (
            <p style={{ color: 'black' }}>No leave forms found.</p>
          )}
        </DataSection>
        <Pagination>
          <button onClick={handlePreviousPage} disabled={currentPage === 1}>
            &laquo;
          </button>
          {renderPaginationButtons()}
          <button onClick={handleNextPage} disabled={currentPage === totalPages}>
            &raquo;
          </button>
        </Pagination>
        <Button onClick={handleButtonClick}>Yeni İzin Formu</Button>
      </Container>
    );
  };
  
  export default LeaveFormList;
  