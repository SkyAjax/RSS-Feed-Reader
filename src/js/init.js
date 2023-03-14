import watcher from './watchers';
import yup from './yup';

export default () => {
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