import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LeaveForm from './LeaveForm';
import LoginPage from './LoginPage';
import AdminLogin from './AdminLogin';
import LeaveFormList from './LeaveFormList';
import styled from 'styled-components';
import AdminPage from "./AdminPage";

const AppWrapper = styled.div`
  font-family: 'Arial', sans-serif;
`;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  // Function to handle successful login
  const handleLogin = (username) => {
    setIsLoggedIn(true);
    setUsername(username);
  };

  return (
    <Router>
      <AppWrapper>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route
            path="/leave-form-list"
            element={isLoggedIn ? <LeaveFormList username={username} /> : <Navigate to="/login" />}
          />
          <Route
            path="/leave-form"
            element={isLoggedIn ? <LeaveForm /> : <Navigate to="/login" />}
          />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-page" element={<AdminPage />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AppWrapper>
    </Router>
  );
}

export default App;
