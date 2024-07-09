import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Montserrat', sans-serif;
  }

  html, body {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    background: linear-gradient(45deg, #144FC4, #48BB27);
  }
`;

const FormBox = styled.div`
  position: relative;
  width: 400px;
  height: 450px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: transparent;
  border: 1.5px solid #161616;
  border-radius: 30px;
  backdrop-filter: blur(15px);
  z-index: 1;
`;

const InputBox = styled.div`
  position: relative;
  margin: 30px 0;
  width: 310px;
  border-bottom: 2px solid #161616;
`;

const InputLabel = styled.label`
  position: absolute;
  top: 50%;
  left: 5px;
  transform: translateY(-50%);
  color: #161616;
  font-size: 1em;
  pointer-events: none;
  transition: 0.325s;
`;

const Input = styled.input`
  width: 100%;
  height: 50px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1em;
  padding: 0 35px 0 5px;
  color: #161616;

  &:focus + ${InputLabel},
  &:valid + ${InputLabel} {
    top: -5px;
  }
`;

const Icon = styled(FontAwesomeIcon)`
  color: #161616;
  position: absolute;
  right: 8px;
  font-size: 1.5em;
  top: 18.25px;
`;

const Button = styled.button`
  border: 1.5px solid #161616;
  border-radius: 30px;
  width: 100%;
  height: 38px;
  backdrop-filter: blur(10px);
  outline: none;
  font-size: 1.3em;
  font-weight: 500;
  background-color: transparent;
  cursor: pointer;
  z-index: 0;
  transition: background 0.6s ease, color 0.6s ease;

  &:hover {
    background: linear-gradient(45deg, #48BB27, #2756bb);
    color: cornsilk;
  }
`;

const AdminLink = styled.a`
  text-align: center;
  color: #161616;
  align-items: center;
  justify-content: center;
  display: flex;
  margin-top: 10px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const Title = styled.h2`
  text-align: center;
`;

const Error = styled.div`
  color: red;
  font-size: 14px;
  margin-top: 5px;
`;

function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Kullanıcı adı zorunludur'),
      password: Yup.string().required('Şifre zorunludur'),
    }),
    onSubmit: (values) => {
      // Simulate successful login
      onLogin();
      navigate('/leave-form');
      console.log(values);
    },
  });

  const handleAdminLogin = () => {
    navigate('/admin-login'); // admin-login sayfasına yönlendirme
  };

  return (
    <>
      <GlobalStyle />
      <FormBox>
        <Title>Login Page</Title>
        <form onSubmit={formik.handleSubmit}>
          <InputBox>
            <Input
              type="text"
              name="username"
              placeholder=" "
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.username}
            />
            <InputLabel htmlFor="username">Username</InputLabel>
            <Icon icon={faUser} />
            {formik.touched.username && formik.errors.username ? (
              <Error>{formik.errors.username}</Error>
            ) : null}
          </InputBox>
          <InputBox>
            <Input
              type="password"
              name="password"
              placeholder=" "
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            <InputLabel htmlFor="password">Password</InputLabel>
            <Icon icon={faLock} />
            {formik.touched.password && formik.errors.password ? (
              <Error>{formik.errors.password}</Error>
            ) : null}
          </InputBox>
          <Button id="loginButton" type="submit">Login</Button>
          <AdminLink onClick={handleAdminLogin} id="adminLogin">
            Admin Login
          </AdminLink>
        </form>
      </FormBox>
    </>
  );
}

export default LoginPage;
