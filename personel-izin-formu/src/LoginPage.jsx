import React from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulate successful login
    onLogin();
    navigate('/leave-form');
  };

  return (
    <><div>
          <h1>
              <input type="text" placeholder="Username" />
              <input type="password" placeholder="Password" />
          </h1>
      </div><div>
              <h1>Login Page</h1>
              <button onClick={handleLogin}>Login</button>
              {/* Add your login form here */}
          </div></>
  );
}


export default LoginPage;
