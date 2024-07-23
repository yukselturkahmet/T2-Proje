import React from 'react';
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
  position: relative; /* Konumlandırma için relative olarak ayarla */
`;

const DataSection = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 80%; /* Daha geniş bir alan */
  max-width: 800px; /* Maksimum genişlik */
  margin: 40px 0; /* Üst ve alt boşluklar */
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

const LeaveFormList = () => {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate('/leave-form');
    };

    return (
        <Container>
            <DataSection>
                {/* Verilerin gösterileceği alan */}
            </DataSection>
            <Button onClick={handleButtonClick}>Yeni İzin Formu</Button>
        </Container>
    );
};

export default LeaveFormList;