/* eslint-disable no-restricted-globals */
import onChange from 'on-change';
import i18nInstance from '../locales/i18n';
import { createDefaultView, createContainer } from './helpers';

export default (state) => {
  const postsContainer = document.querySelector('.posts');
  const feedContainer = document.querySelector('.feeds');
  return onChange(state, () => {
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
      const items = state.feedsList.flatMap((feed) => feed.items);
      const postsDiv = createContainer(items, 'posts', state);
      postsContainer.replaceChildren(postsDiv);
      const feedsDiv = createContainer(state, 'feeds');
      feedContainer.replaceChildren(feedsDiv);

      if (state.uiState.modalWindow !== null) {
        const activePost = items.find((post) => post.id === state.uiState.modalWindow);
        const modalTitle = document.querySelector('.modal-title');
        const modalDescription = document.querySelector('.text-break');
        const articleButton = document.querySelector('.full-article');
        articleButton.href = activePost.link;
        modalTitle.textContent = activePost.title;
        modalDescription.textContent = activePost.description;
      }
    }
    if (state.input.state === 'failed') {
      input.classList.add('is-invalid');
    }
    if (state.input.state === 'loading') {
      p.textContent = '';
      input.setAttribute('readonly', 'true');
      input.removeAttribute('spellcheck');
      input.removeAttribute('data-ms-editor');
      button.classList.add('disabled');
    }
    state.errors.forEach((error) => {
      if (error === 'ERR_NETWORK') {
        p.textContent = i18nInstance.t('errors.network');
      } else if (error === 'DEFAULT') {
        p.textContent = i18nInstance.t('errors.default');
      } else {
        p.textContent = error;
      }
    });
  });
};
