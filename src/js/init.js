import watcher from './watchers';
import yup from './yup';
import i18n from 'i18next';
import resources from '../locales';

export default () => {
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  })
  .then(function(t) {
    document.querySelector('.display-3').textContent = i18nInstance.t('title');
    document.querySelector('.lead').textContent = i18nInstance.t('subtitle');  
    document.querySelector('.urlInputDescription').textContent = i18nInstance.t('urlInputDescription'); 
    document.querySelector('.btn-lg').textContent = i18nInstance.t('buttons.add'); 
    document.querySelector('.text-muted').textContent = i18nInstance.t('linkExample'); 
    document.querySelector('[data-bs-dismiss="modal"]').textContent = i18nInstance.t('buttons.close'); 
    // document.getElementById('credits').textContent = i18nInstance.t('footer.createdBy'); 
  });

  const form = document.querySelector('form');
  const input = document.querySelector('.form-control');
  
  const state = {
    linkField: 'valid',
    linksList: [],
    errors: [],
  };
  
  const watchedState = watcher(state);
  input.focus();
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newUrl = new FormData(e.target);
    const data = { url: newUrl.get('url') };
    const isUnique = yup(watchedState.linksList, data);
    isUnique.validate(data)
    .then((response) => {
      watchedState.linksList.push(response.url);
      watchedState.linkField = 'valid';
      watchedState.errors.length = 0;
      form.reset();
      input.focus();
    })
    .catch((err) => {
      watchedState.errors.push(err.message);
      watchedState.linkField = 'invalid';
    });
  });
};