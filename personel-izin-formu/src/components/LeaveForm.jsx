import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import logo from '../assets/logo.jpg'; // Logo dosyasının yolu

const FormWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
  box-sizing: border-box;
`;

const FormContainer = styled.div`
  background: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1200px; /* Daha geniş bir form için genişliği arttırdık */
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-wrap: wrap; /* Form elemanlarının yan yana dizilmesini sağlar */
  justify-content: space-between; /* Elemanlar arasındaki boşluk */
  margin-top: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  width: 48%; /* Elemanların yan yana dizilmesi için genişlik ayarı */
  text-align: left;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: black; /* Siyah font rengi */
`;

const Input = styled.input`
  width: calc(100% - 22px);
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
  background-color: #4CAF50;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 20px; /* Butonun formun altında olmasını sağlamak için margin eklendi */

  &:hover {
    background-color: #45a049;
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
            fullName: '',
            leaveType: '',
            startDate: '',
            endDate: '',
            duration: '',
            reason: '',
        },
        validationSchema: Yup.object({
            fullName: Yup.string()
                .max(50, 'En fazla 50 karakter olabilir')
                .required('Ad soyad zorunludur'),
            leaveType: Yup.string().required('İzin türü zorunludur'),
            startDate: Yup.date().required('Başlangıç tarihi zorunludur'),
            endDate: Yup.date().required('Bitiş tarihi zorunludur'),
            duration: Yup.number().min(1, 'En az 1 gün olmalı').required('İzin süresi zorunludur'),
            reason: Yup.string()
                .max(200, 'En fazla 200 karakter olabilir')
                .required('İzin gerekçesi zorunludur'),
        }),
        onSubmit: (values) => {
            console.log(values);
            // Form verilerini işleme
        },
    });

    return (
        <FormWrapper>
            <FormContainer>
                <Logo src={logo} alt="Logo" />
                <h1>Personel İzin Formu</h1>
                <Form onSubmit={formik.handleSubmit}>
                    <FormGroup>
                        <Label>Ad Soyad:</Label>
                        <Input
                            type="text"
                            name="fullName"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.fullName}
                        />
                        {formik.touched.fullName && formik.errors.fullName ? (
                            <Error>{formik.errors.fullName}</Error>
                        ) : null}
                    </FormGroup>
                    <FormGroup>
                        <Label>İzin Türü:</Label>
                        <Select
                            name="leaveType"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.leaveType}
                        >
                            <option value="" label="Seçiniz" />
                            <option value="Yıllık İzin" label="Yıllık İzin" />
                            <option value="Mahsup İzin" label="Mahsup İzin" />
                            <option value="Mazeret İzni" label="Mazeret İzni" />
                            <option value="Ücretsiz İzin" label="Ücretsiz İzin" />
                            <option value="Hastalık İzni" label="Hastalık İzni" />
                            <option value="Doğum Sonrası İzin" label="Doğum Sonrası İzin" />
                            <option value="Ölüm İzni" label="Ölüm İzni" />
                            <option value="Evlilik İzni" label="Evlilik İzni" />
                        </Select>
                        {formik.touched.leaveType && formik.errors.leaveType ? (
                            <Error>{formik.errors.leaveType}</Error>
                        ) : null}
                    </FormGroup>
                    <FormGroup>
                        <Label>Başlangıç Tarihi:</Label>
                        <Input
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
                        <Label>Bitiş Tarihi:</Label>
                        <Input
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
                        <Label>İzin Süresi (gün):</Label>
                        <Input
                            type="number"
                            name="duration"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.duration}
                        />
                        {formik.touched.duration && formik.errors.duration ? (
                            <Error>{formik.errors.duration}</Error>
                        ) : null}
                    </FormGroup>
                    <FormGroup style={{ width: '100%' }}>
                        <Label>İzin Gerekçesi:</Label>
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
                    <Button type="submit">Gönder</Button>
                </Form>
            </FormContainer>
        </FormWrapper>
    );
};

export default LeaveForm;
