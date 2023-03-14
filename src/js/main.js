// Import our custom CSS
import '../scss/styles.scss'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

import * as yup from 'yup';
import _ from 'lodash';
import onChange from 'on-change';
// import watchedState from './watchers.js';

const form = document.querySelector('form');
const input = document.querySelector('.form-control');
const state = {
    linkField: 'valid',
    linksList: [],
    errors: [],
};

// const watcher = watchedState(state);
const watchedState = onChange(state, () => {
    console.log([...watchedState.linksList])
    const p = document.querySelector('.feedback');
    p.textContent = '';
    input.classList.remove('is-invalid');
    if (state.linkField === 'invalid') {
        input.classList.add('is-invalid');
    }
    watchedState.errors.map((error) => {
        p.textContent = error;
    })
});

const userSchema = yup.object({
    url: yup.string()
    .notOneOf([...watchedState.linksList], 'RSS уже существует')
    .required()
    .url('Ссылка должна быть валидным URL'),
});

input.focus();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const newUrl = new FormData(e.target);
  const data = { url: newUrl.get('url') };
  userSchema.validate(data)
  .then((response) => {
    watchedState.linksList.push(response.url);
    watchedState.linkField = 'valid';
    form.reset();
    input.focus();
  })
  .catch((err) => {
    watchedState.errors.push(err.message);
    watchedState.linkField = 'invalid';
  });
});