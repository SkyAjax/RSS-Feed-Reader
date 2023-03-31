import i18n from 'i18next';
import resources from '../locales';

const i18nInstance = i18n.createInstance();
i18nInstance.init({
  lng: 'ru',
  debug: true,
  resources,
});

export default i18nInstance;