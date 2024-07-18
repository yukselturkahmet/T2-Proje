import React from 'react';
import styled from 'styled-components';

const AdminPageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Ekran yüksekliği kadar */
  width: 100vw; /* Ekran genişliği kadar */
  background-color: #f0f0f0; /* Arka plan rengi */
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
  color: #000000
`;

const Info = styled.span`
  color: #333333;
`;

const AdminPage = ({ employee, startdate }) => {
    return (
        <AdminPageWrapper>
            <AdminContent>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: "#000000" }}>Admin Panel</h2>
                <UserInfo>
                    <Label>Employee:</Label>
                    <Info>{employee}</Info>
                </UserInfo>
                <UserInfo>
                    <Label>Start time of employee leave:</Label>
                    <Info>{startdate}</Info>
                </UserInfo>
                {/* Diğer bilgileri buraya ekleyebilirsin */}
            </AdminContent>
        </AdminPageWrapper>
    );
};

export default AdminPage;
