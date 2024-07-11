// eslint-disable-next-line no-unused-vars
import React from 'react';
import {useNavigate} from 'react-router-dom';
import styled, {createGlobalStyle} from 'styled-components';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUser, faLock} from '@fortawesome/free-solid-svg-icons';

const GlobalStyle = createGlobalStyle`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Britannic Bold', sans-serif;
        font-weight: bold;
    }

    html, body {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        background: radial-gradient(900px, #144FC4, #48BB27);
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
    border: 2px ridge rgba(255, 239, 213, 0.75);
    border-radius: 30px;
    backdrop-filter: blur(15px);
    z-index: 1;
`;

const InputBox = styled.div`
    position: relative;
    margin: 30px 0;
    width: 310px;
    border-bottom: 2px ridge rgba(255, 239, 213, 0.75);
`;

const InputLabel = styled.label`
    position: absolute;
    top: 50%;
    left: 5px;
    transform: translateY(-50%);
    color: rgba(255, 239, 213, 0.75);
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
    color: rgba(255, 239, 213, 0.75);

    &:focus + ${InputLabel},
    &:valid + ${InputLabel} {
        top: -5px;
    }
`;

const Icon = styled(FontAwesomeIcon)`
    color: rgba(255, 239, 213, 0.75);
    position: absolute;
    right: 8px;
    font-size: 1.5em;
    top: 18.25px;
`;

const Button = styled.button`
    border: none;
    position: relative;
    text-align: center;
    justify-content: center;
    border-radius: 50px;
    width: 100%;
    height: 38px;
    font-size: 1.6em;
    font-weight: 700;
    cursor: pointer;
    background: transparent;

    &:hover {
        color: rgba(255, 165, 0, 0.75);
    }
`;

const AdminLink = styled.a`
    text-align: center;
    color: rgba(255, 239, 213, 0.75);
    align-items: center;
    justify-content: center;
    display: flex;
    margin-top: 26px;
    cursor: pointer;
    text-decoration: none;
    font-weight: bold;

    &:hover {
        color: #FF7F00;
    }
`;

const Title = styled.h2`
    text-align: center;
    font-size: 2.8em;
`;

const Error = styled.div`
    color: red;
    width: 100%;
    text-align: center;
    font-size: 100%;
`;

function LoginPage({onLogin}) {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            username: '',
            password: '',
        },
        validationSchema: Yup.object({
            username: Yup.string().required('Username can not be empty')
                .min(6, `Username should include min. 6 characters.`)
                .max(25, `Username can not exceed 25 characters.`),


            password: Yup.string().required('Password can not be empty')
                .min(6, `Password should be min. 6 characters.`)
                .max(25, `Password can not  exceed 25 characters.`),


        }),
        onSubmit: (values) => {
            onLogin();
            navigate('/leave-form');
            console.log(values);
        },
    });

    const handleAdminLogin = () => {
        navigate('/admin-login');
    };

    return (
        <>
            <GlobalStyle/>
            <FormBox>
                <Title>Log In</Title>
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
                        <Icon icon={faUser}/>
                    </InputBox>
                    {formik.touched.username && formik.errors.username ? (
                        <Error>{formik.errors.username}</Error>
                    ) : null}
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
                        <Icon icon={faLock}/>
                    </InputBox>
                    {formik.touched.password && formik.errors.password ? (
                        <Error>{formik.errors.password}</Error>
                    ) : null}
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
