import * as yup from "yup";
export const signupValidator = yup.object().shape({
  first_name: yup.string().min(3).max(255),
  last_name: yup.string().min(3).max(255),
  email: yup.string().email("not a valid email!"),
  password: yup
    .string()
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
    ),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match"),
});
export const loginValidator = yup.object().shape({
  email: yup.string().email("not a valid email!"),
  password: yup
    .string()
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
    ),
});
