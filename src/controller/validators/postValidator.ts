import * as yup from "yup";

export const createPostValidator = yup.object().shape({
  content: yup.string(),
});
