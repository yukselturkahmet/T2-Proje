import React, { useEffect, useState } from 'react';
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

const LeaveFormList = ({ username }) => {
    const navigate = useNavigate();
    const [leaveForms, setLeaveForms] = useState([]);

    useEffect(() => {
        const fetchLeaveForms = async () => {
            try {
                const response = await fetch('http://localhost:4000/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: `
                            query getEmployeesByUsername($username: String!) {
                                getEmployeesByUsername(username: $username) {
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
                            }
                        `,
                        variables: { username },
                    }),
                });

                const { data, errors } = await response.json();

                if (errors) {
                    console.error('GraphQL errors:', errors);
                    setLeaveForms([]); // Set to empty array in case of errors
                } else {
                    setLeaveForms(data.getEmployeesByUsername || []);
                }
            } catch (error) {
                console.error('Error fetching leave forms:', error);
                setLeaveForms([]); // Set to empty array in case of an error
            }
        };

        fetchLeaveForms();
    }, [username]);

    const handleButtonClick = () => {
        navigate('/leave-form');
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
            <Button onClick={handleButtonClick}>Yeni İzin Formu</Button> 
        </Container>
    );
};

export default LeaveFormList;
