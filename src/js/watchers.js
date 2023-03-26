import onChange from 'on-change';
import i18n from 'i18next';
import resources from '../locales';
import { createDefaultView, createContainer } from './helpers';

const i18nInstance = i18n.createInstance();
i18nInstance.init({
lng: 'ru',
debug: true,
resources,
})

export default (state) => { 
  const postsContainer = document.querySelector('.posts');
  const feedContainer = document.querySelector('.feeds');
  return onChange(state, () => {
    console.log(state.input.state);
      const input = document.querySelector('.form-control');
      const p = document.querySelector('.feedback');
      const button = document.querySelector('.btn-lg');
      createDefaultView();
      if (state.input.state === 'completed') {
          const ul = document.createElement('ul');
          ul.classList.add('list-group', 'border-0', 'rounded-0');
          p.classList.remove('text-danger');
          p.classList.add('text-success');
          p.textContent = i18nInstance.t('success');         
          const postsDiv = createContainer(state.postsList, 'posts', state);
          postsContainer.replaceChildren(postsDiv);
          const feedsDiv = createContainer(state.feedsList, 'feeds');
          feedContainer.replaceChildren(feedsDiv);
      };
      if (state.input.state === 'invalid') {
          input.classList.add('is-invalid');
      };
      if (state.input.state === 'loading') {
        p.textContent = '';
        input.setAttribute('readonly', 'true');
        input.removeAttribute('spellcheck');
        input.removeAttribute('data-ms-editor');
        button.classList.add('disabled');
      };
    state.errors.map((error) => {
        p.textContent = error;
    });
  });
};