import * as yup from "yup";

export const loginValidationSchema = yup.object({
  phone: yup.string().required(),
});

export const registerValidationSchema = yup.object({
  phone: yup.string().required(),
  name: yup.string().required(),
  dateOfBirth: yup.string().required(),
  parentNumber: yup.string().required(),
  region: yup.string().required(),
});

export const verifyValidationSchema = yup.object({
  phone: yup.string().required(),
  code: yup.string(),
});
