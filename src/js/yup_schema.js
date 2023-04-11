import * as yup from 'yup';

export default (arr) => yup.object({
  url: yup.string()
    .notOneOf(arr)
    .required()
    .trim()
    .url(),
});
