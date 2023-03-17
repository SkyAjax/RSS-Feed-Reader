import * as yup from 'yup';
import i18n from 'i18next';
import resources from '../locales';

const i18nInstance = i18n.createInstance();
i18nInstance.init({
lng: 'ru',
debug: true,
resources,
})

yup.setLocale({
  mixed: {
    notOneOf: i18nInstance.t('errors.notUnique'),
  },
  string: {
    url: i18nInstance.t('errors.notValid'),
},
})

export default (arr, value) => { 
    return yup.object({
    url: yup.string()
    .notOneOf(arr)
    .required()
    .trim()
    .url(),
  });
}