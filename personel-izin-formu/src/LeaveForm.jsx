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
            lastname: '',
            leaveType: '',
            startDate: '',
            endDate: '',
            hour: '',
            day: '',
            reason: '',
        },
        validationSchema: Yup.object({
            firstName: Yup.string()
              .max(50, 'Can be maximum 50 characters.')
              .required('This field cannot be left empty.')
              .test(
                'maxLength',
                'Name field has reached the maximum length of 50 characters.',
                value => value && value.length <= 25
              ),
            lastname: Yup.string()
              .max(50, 'Can be maximum 50 characters.')
              .required('This field cannot be left empty.'),
            leaveType: Yup.string().required('Permit Type is required'),
            startDate: Yup.date()
              .required('Start date is required')
              .transform((value, originalValue) => {
                return originalValue ? new Date(originalValue) : value;
              }),
            endDate: Yup.date()
              .required('End date is required')
              .min(Yup.ref('startDate'), 'End date must be bigger than start date.')
              .transform((value, originalValue) => {
                return originalValue ? new Date(originalValue) : value;
              }),
            hour: Yup.number()
              .min(1, 'It can min. 1 hour')
              .required('Duration of permit is required.'),
            day: Yup.number()
              .min(1, 'It can min. 1 day')
              .required('Duration of permit is required'),
            reason: Yup.string()
              .max(200, 'Can be maximum 200 characters.')
              .required('Reason of permit is required.'),
          }),
      
        
        onSubmit: async (values) => {
             const startDate = new Date(values.startDate);
            const endDate = new Date(values.endDate);
        
            if (isNaN(startDate) || isNaN(endDate)) {
                console.error("Invalid date");
                return;
            }
        
            const formattedStartDate = startDate.toISOString();
            const formattedEndDate = endDate.toISOString();
            try {
                const response = await fetch('http://localhost:4000/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: `
                            mutation createEmployeeLeave($input: CreateEmployeeLeaveInput!) {
                                createEmployeeLeave(input: $input) {
                                    start_date
                                    end_date
                                    leave_duration_day
                                    leave_duration_hour
                                    leave_type
                                    firstname
                                    lastname
                                    reason
                                }
                            }
                        `,
                        variables: {
                            input: {
                                start_date: formattedStartDate,
                                end_date: formattedEndDate,
                                leave_duration_day: values.day,
                                leave_duration_hour: values.hour,
                                leave_type: values.leaveType,
                                firstname: values.firstName,
                                lastname: values.lastname,
                                reason: values.reason                           
                            },
                        },
                    }),
                });
        
                const data = await response.json();
        
                if (data.errors) {
                    console.error('GraphQL Error:', data.errors);
                    // Handle GraphQL errors here, e.g., display error message to user
                } else {
                    
                    console.log('User created successfully:', data.data.createUser);
                }
            } catch (error) {
                console.error('Network Error:', error);
                // Handle network errors here
            }
        },
    });


    return (
        <FormWrapper className={"leave-form"}>
            <FormContainer>
                <Logo src={logo} alt="Logo"/>
                <h1>Staff Permit Form</h1>
                <Form onSubmit={formik.handleSubmit}>
                    <FormGroup>

                        <Label className={"required"}>Firstname:</Label>
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

                        <Label className={"required"}>Lastname:</Label>
                        <Input
                            type="text"
                            name="lastname"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.lastname}
                            maxLength={50}
                        />
                        {formik.touched.lastname && formik.errors.lastname ? (
                            <Error>{formik.errors.lastname}</Error>
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
                            <option value="Offset Permit" label="Offset Permit"/> 
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
                            name="hour"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.hour}
                        />
                        {formik.touched.hour && formik.errors.hour ? (
                            <Error>{formik.errors.hour}</Error>
                        ) : null}
                    </FormGroup>
                    <FormGroup>
                        <Label className={"required"}>Permit Duration (Day):</Label>
                        <Input
                            type="number"
                            name="day"
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