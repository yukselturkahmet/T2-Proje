import React, {useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import logo from './assets/logo.jpg';


const FormWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f0f2f5;
    padding: 20px;
    box-sizing: border-box;
    margin: 0;
`;

const FormContainer = styled.div`
    background: #fff;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 100%;
    height: 100%;
    text-align: center;
`;

const Form = styled.form`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 20px;
`;

const FormGroup = styled.div`
    margin-bottom: 20px;
    width: 49%;
    text-align: left;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: black;
`;

const Input = styled.input`
    width: calc(100% - 22px);
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
`;

const DateInput = styled(Input)`
    width: 100%;
`;

const Select = styled.select`
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
`;

const Textarea = styled.textarea`
    width: calc(100% - 22px);
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
`;

const Button = styled.button`
    width: 100%;
    padding: 15px;
    border: none;
    border-radius: 5px;
    background-color: #1af122;
    color: white;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 20px;

    &:hover {
        background-color: rgb(255, 165, 0);;
    }
`;

const Error = styled.div`
    color: red;
    font-size: 14px;
    margin-top: 5px;
`;

const Logo = styled.img`
    width: 100px;
    margin: 0 auto 20px;
    display: block;
`;

const LeaveForm = () => {
    const formik = useFormik({
        initialValues: {
            firstName: '',
            surName: '',
            leaveType: '',
            startDate: '',
            endDate: '',
            saat: '',
            day: '',
            reason: '',
        },
        validationSchema: Yup.object({
            firstName: Yup.string()
                .max(50, 'En fazla 50 karakter olabilir')
                .required('This field cannot be left empty.')
                .test('maxLength', 'Name field has reached the maximum length of 50 characters.', value => value && value.length <= 25),
            surName: Yup.string()
                .max(50, 'En fazla 50 karakter olabilir')
                .required('This field cannot be left empty.'),
            leaveType: Yup.string()
                .required('İzin türü zorunludur'),
            startDate: Yup.date()
                .required('Başlangıç tarihi zorunludur'),
            endDate: Yup.date().required('Bitiş tarihi zorunludur')
                .when('startDate', (startDate, schema) => {
                    return schema.min(startDate, 'Bitiş tarihi, Başlangıç tarihinden büyük olmalıdır');
                }),
            duration: Yup.number().min(1, 'En az 1 gün olmalı').required('İzin süresi zorunludur'),
            reason: Yup.string()
                .max(200, 'Can be maximum 200 characters.')
                .required('İzin gerekçesi zorunludur'),
        }),
        onSubmit: (values) => {
            console.log(values);
        },
    });

    return (
        <FormWrapper className={"leave-form"}>
            <FormContainer>
                <Logo src={logo} alt="Logo"/>
                <h1>Staff Permit Form</h1>
                <Form onSubmit={formik.handleSubmit}>
                    <FormGroup>
                        <Label className={"required"}>Name:</Label>
                        <Input
                            type="text"
                            name="firstName"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.firstName}
                            maxLength={25}
                        />
                        {formik.touched.firstName && formik.errors.firstName ? (
                            <Error>{formik.errors.firstName}</Error>
                        ) : null}
                    </FormGroup>
                    <FormGroup>
                        <Label className={"required"}>Surname:</Label>
                        <Input
                            type="text"
                            name="surName"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.surName}
                            maxLength={50}
                        />
                        {formik.touched.surName && formik.errors.surName ? (
                            <Error>{formik.errors.surName}</Error>
                        ) : null}
                    </FormGroup>
                    <FormGroup>
                        <Label className={"required"}>Start Day:</Label>
                        <DateInput
                            type="date"
                            name="startDate"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.startDate}
                        />
                        {formik.touched.startDate && formik.errors.startDate ? (
                            <Error>{formik.errors.startDate}</Error>
                        ) : null}
                    </FormGroup>
                    <FormGroup>
                        <Label className={"required"}>End Date:</Label>
                        <DateInput
                            type="date"
                            name="endDate"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.endDate}
                        />
                        {formik.touched.endDate && formik.errors.endDate ? (
                            <Error>{formik.errors.endDate}</Error>
                        ) : null}
                    </FormGroup>
                    <FormGroup>
                        <Label className={"required"}>Permit Type:</Label>
                        <Select
                            name="leaveType"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.leaveType}
                        >
                            <option value="" label="Seçiniz"/>
                            <option value="Annual Leave" label="Annual Leave"/>
                            <option value="Offset Permit" label="Offset Permit"/> --Mahsup izin ingilizceye cevirirken offset oldugundan emin degilim.
                            <option value="Casual Leave " label="Casual Leave"/>
                            <option value="Unpaid Vacation" label="Unpaid Vacation"/>
                            <option value="Sick Leave" label="Sick Leave"/>
                            <option value="After Birth Permit" label="After Birth Permit"/>
                            <option value="Death Permit" label="Death Permit"/>
                            <option value="Marriage Permit" label="Marriage Permit"/>
                        </Select>
                        {formik.touched.leaveType && formik.errors.leaveType ? (
                            <Error>{formik.errors.leaveType}</Error>
                        ) : null}
                    </FormGroup>
                    <FormGroup>
                        <Label>Permit Duration (hour):</Label>
                        <Input
                            type="number"
                            name="saat"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.saat}
                        />
                        {formik.touched.saat && formik.errors.saat ? (
                            <Error>{formik.errors.saat}</Error>
                        ) : null}
                    </FormGroup>
                    <FormGroup>
                        <Label className={"required"}>Permit Duration (Day):</Label>
                        <Input
                            type="number"
                            name="gun"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.day}
                        />
                        {formik.touched.day && formik.errors.day ? (
                            <Error>{formik.errors.day}</Error>
                        ) : null}
                    </FormGroup>
                    <FormGroup style={{width: '100%'}}>
                        <Label className={"required"}>Permit Reason:</Label>
                        <Textarea
                            name="reason"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.reason}
                        />
                        {formik.touched.reason && formik.errors.reason ? (
                            <Error>{formik.errors.reason}</Error>
                        ) : null}
                    </FormGroup>
                    <Button type="submit">Submit</Button>
                </Form>
            </FormContainer>
        </FormWrapper>
    );
};

export default LeaveForm;
