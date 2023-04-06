import * as yup from 'yup';

export default (arr) => {
  yup.setLocale({
    mixed: {
      notOneOf: 'errors.notUnique',
    },
    string: {
      url: 'errors.notValid',
    },
  });

  return yup.object({
    url: yup.string()
      .notOneOf(arr)
      .required()
      .trim()
      .url(),
  });
};
