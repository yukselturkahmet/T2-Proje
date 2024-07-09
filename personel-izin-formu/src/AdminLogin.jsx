import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const FormWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(45deg, #144FC4, #48BB27);
  width: 100%;
  margin: 0;
  padding: 0;
`;

const FormContainer = styled.div`
  background: #ffffff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 520px;
  width: 100%;
  text-align: center;
  margin: 0 580px; /* Added margin for better spacing on small screens */
`;
const Input = styled.input`
  width: calc(100% - 20px);
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #0056b3;
  }
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

  return (
    <FormWrapper>
      <FormContainer>
        <h1 style={{ color: '#000000' }}>Admin Login</h1>
        <form onSubmit={formik.handleSubmit}>
          <div>
            <Input
              type="text"
              name="username"
              placeholder="Username"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.username}
            />
            {formik.touched.username && formik.errors.username ? (
              <Error>{formik.errors.username}</Error>
            ) : null}
          </div>
          <div>
            <Input
              type="password"
              name="password"
              placeholder="Password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            {formik.touched.password && formik.errors.password ? (
              <Error>{formik.errors.password}</Error>
            ) : null}

          </div>
          <Button type="submit">Login</Button>
        </form>
      </FormContainer>
    </FormWrapper>
  );
}

export default LoginPage;