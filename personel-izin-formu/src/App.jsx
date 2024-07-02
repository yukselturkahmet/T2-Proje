// src/App.jsx
import React from 'react';
import LeaveForm from './components/LeaveForm';
import styled from 'styled-components';

const AppWrapper = styled.div`
  font-family: 'Arial', sans-serif;
`;

function App() {
  return (
    <AppWrapper>
      <LeaveForm />
    </AppWrapper>
  );
}

export default App;
