import React, { useState } from 'react';
import { useFormik } from 'formik';
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
    height: 90%;
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
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
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
        background-color: rgb(255, 165, 0);
    }

    &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
`;

const Error = styled.div`
    color: red;
    font-size: 16px;
    margin-top: 5px;
`;

const Logo = styled.img`
    width: 100px;
    margin: 0 auto 20px;
    display: block;
    user-select: none;
    -webkit-user-drag: none;
`;

const DebugInfo = styled.div`
    display: none; /* Hides the debugging information */
`;

const LeaveForm = () => {
    const [submitError, setSubmitError] = useState('');
    const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);

    const formik = useFormik({
        initialValues: {
            firstname: '',
            lastname: '',
            leave_type: '',
            start_date: '',
            end_date: '',
            leave_duration_hour: '',
            leave_duration_day: '',
            reason: '',
        },
        validationSchema: Yup.object({
            firstname: Yup.string()
                .max(50, 'Can be maximum 50 characters.')
                .required('This field cannot be left empty.')
                .test('maxLength', 'Name field has reached the maximum length of 50 characters.', value => value && value.length <= 25),
            lastname: Yup.string()
                .max(50, 'Can be maximum 50 characters.')
                .required('This field cannot be left empty.'),
            leave_type: Yup.string()
                .required('Permit Type is required'),
            start_date: Yup.date()
                .nullable()
                .transform((value, originalValue) => originalValue === "" ? null : value)
                .required('Start date is required'),
            end_date: Yup.date()
                .nullable()
                .transform((value, originalValue) => originalValue === "" ? null : value)
                .required('End date is required')
                .when('start_date', (start_date, schema) => {
                    return start_date ? schema.min(start_date, 'End date must be after start date.') : schema;
                }),
            leave_duration_day: Yup.number()
                .min(1, 'It can be min. 1 day').required('Duration of permit is required.')
                .max(121, 'You have reached the maximum permit days.'),
            leave_duration_hour: Yup.number()
                .min(1, 'It can be min. 1 hour')
                .required('Duration of the permit is required.'),
            reason: Yup.string()
                .max(200, 'Can be maximum 200 characters.')
                .required('Reason of permit is required.'),
        }),

        onSubmit: async (values, { setSubmitting, setErrors }) => {
            setSubmitError('');
            if (submittedSuccessfully) {
                setSubmitError('Form has already been submitted.');
                setSubmitting(false);
                return;
            }

            const startDate = new Date(values.start_date);
            const endDate = new Date(values.end_date);

            if (isNaN(startDate) || isNaN(endDate)) {
                console.error("Invalid date");
                setSubmitError('Invalid date entered.');
                setSubmitting(false);
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
                                leave_duration_day: values.leave_duration_day,
                                leave_duration_hour: values.leave_duration_hour,
                                leave_type: values.leave_type,
                                firstname: values.firstname,
                                lastname: values.lastname,
                                reason: values.reason
                            },
                        },
                    }),
                });

                const data = await response.json();

                if (data.errors) {
                    console.error('GraphQL Error:', data.errors);
                    setSubmitError('An error occurred while submitting the form.');
                } else {
                    console.log('Form submitted successfully:', data.data.createEmployeeLeave);
                    window.alert("You have successfully submitted your form.");
                    setSubmittedSuccessfully(true); // Mark form as successfully submitted
                    setSubmitError(''); // Clear any previous error message on successful submission
                }
            } catch (error) {
                console.error('Network Error:', error);
                setSubmitError('A network error occurred. Please try again later.');
            } finally {
                setSubmitting(false);
            }
        },
    });

    const validateAndSubmit = (e) => {
        e.preventDefault();
        formik.setTouched({
            firstname: true,
            lastname: true,
            leave_type: true,
            start_date: true,
            end_date: true,
            leave_duration_day: true,
            leave_duration_hour: true,
            reason: true,
        });
        formik.validateForm().then((errors) => {
            if (Object.keys(errors).length === 0) {
                formik.handleSubmit(e);
            }
        });
    };

    return (
        <FormWrapper className={"leave-form"}>
            <FormContainer>
                <Logo src={logo} alt="Logo" />
                <h1 className={"staff_form_txt"}>Staff Permit Form</h1>
                <Form onSubmit={validateAndSubmit}>
                    <FormGroup>
                        <Label className={"required"}>Name:</Label>
                        <Input
                            type="text"
                            name="firstname"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.firstname}
                            maxLength={25}
                        />
                        {formik.touched.firstname && formik.errors.firstname ? (
                            <Error>{formik.errors.firstname}</Error>
                        ) : null}
                    </FormGroup>
                    <FormGroup>
                        <Label className={"required"}>Surname:</Label>
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
                        <Label className={"required"}>Start Date:</Label>
                        <DateInput
                            type="date"
                            name="start_date"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.start_date}
                        />
                        {formik.touched.start_date && formik.errors.start_date ? (
                            <Error>{formik.errors.start_date}</Error>
                        ) : null}
                    </FormGroup>
                    <FormGroup>
                        <Label className={"required"}>End Date:</Label>
                        <DateInput
                            type="date"
                            name="end_date"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.end_date}
                        />
                        {formik.touched.end_date && formik.errors.end_date ? (
                            <Error>{formik.errors.end_date}</Error>
                        ) : null}
                    </FormGroup>
                    <FormGroup>
                        <Label className={"required"}>Permit Type:</Label>
                        <Select
                            name="leave_type"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.leave_type}
                        >
                            <option value="" label="Select" />
                            <option value="Annual Leave" label="Annual Leave" />
                            <option value="Offset Permit" label="Offset Permit" />
                            <option value="Casual Leave" label="Casual Leave" />
                            <option value="Unpaid Vacation" label="Unpaid Vacation" />
                            <option value="Sick Leave" label="Sick Leave" />
                            <option value="After Birth Permit" label="After Birth Permit" />
                            <option value="Death Permit" label="Death Permit" />
                            <option value="Marriage Permit" label="Marriage Permit" />
                        </Select>
                        {formik.touched.leave_type && formik.errors.leave_type ? (
                            <Error>{formik.errors.leave_type}</Error>
                        ) : null}
                    </FormGroup>
                    <FormGroup>
                        <Label>Permit Duration (hour):</Label>
                        <Input
                            type="number"
                            name="leave_duration_hour"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.leave_duration_hour}
                        />
                        {formik.touched.leave_duration_hour && formik.errors.leave_duration_hour ? (
                            <Error>{formik.errors.leave_duration_hour}</Error>
                        ) : null}
                    </FormGroup>
                    <FormGroup>
                        <Label className={"required"}>Permit Duration (Day):</Label>
                        <Input
                            type="number"
                            name="leave_duration_day"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.leave_duration_day}
                            maxLength={122}
                        />
                        {formik.touched.leave_duration_day && formik.errors.leave_duration_day ? (
                            <Error>{formik.errors.leave_duration_day}</Error>
                        ) : null}
                    </FormGroup>
                    <FormGroup style={{ width: '100%' }}>
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
                    <Button type="submit" disabled={formik.isSubmitting || !formik.isValid}>
                        {formik.isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                    {submitError && <Error className={"error_same_value"}>{submitError}</Error>}
                </Form>
                <DebugInfo>
                    <h3>Debugging Information</h3>
                    <p>isValid: {formik.isValid.toString()}</p>
                    <p>isSubmitting: {formik.isSubmitting.toString()}</p>
                    <pre>{JSON.stringify(formik.errors, null, 2)}</pre>
                </DebugInfo>
            </FormContainer>
        </FormWrapper>
    );
};

export default LeaveForm;
