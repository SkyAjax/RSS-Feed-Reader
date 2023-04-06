import onChange from 'on-change';
import { createContainer } from './helpers';

export default (state, i18nInstance) => {
  const postsContainer = document.querySelector('.posts');
  const feedContainer = document.querySelector('.feeds');
  return onChange(state, (path, value) => {
    console.log(path);
    const form = document.querySelector('form');
    const input = document.querySelector('.form-control');
    const p = document.querySelector('.feedback');
    const button = document.querySelector('.btn-lg');
    const items = state.itemsList.flatMap((item) => item);
    if (path === 'feed.state') {
      if (state.feed.state === 'idle') {
        p.textContent = '';
        p.classList.add('text-danger');
        p.classList.remove('text-success');
        button.classList.remove('disabled');
        input.removeAttribute('readonly');
        input.setAttribute('spellcheck', 'false');
        input.setAttribute('data-ms-editor', 'true');
      }
      if (state.feed.state === 'loading') {
        p.textContent = '';
        input.setAttribute('readonly', 'true');
        input.removeAttribute('spellcheck');
        input.removeAttribute('data-ms-editor');
        button.classList.add('disabled');
      }
      if (state.feed.state === 'failed') {
        p.classList.remove('text-success');
        p.classList.add('text-danger');
        button.classList.remove('disabled');
        input.removeAttribute('readonly');
        input.setAttribute('spellcheck', 'false');
        input.setAttribute('data-ms-editor', 'true');
        if (state.feed.error === 'ERR_NETWORK') {
          p.textContent = i18nInstance.t('errors.network');
        } else if (state.feed.error === 'PARSE') {
          p.textContent = i18nInstance.t('errors.noRss');
        } else {
          p.textContent = state.feed.error;
        }
      }
      if (state.feed.state === 'completed') {
        button.classList.remove('disabled');
        input.removeAttribute('readonly');
        input.setAttribute('spellcheck', 'false');
        input.setAttribute('data-ms-editor', 'true');
        const ul = document.createElement('ul');
        ul.classList.add('list-group', 'border-0', 'rounded-0');
        p.classList.remove('text-danger');
        p.classList.add('text-success');
        p.textContent = i18nInstance.t('success');
        const postsDiv = createContainer(state, 'posts', i18nInstance);
        postsContainer.replaceChildren(postsDiv);
        const feedsDiv = createContainer(state, 'feeds', i18nInstance);
        feedContainer.replaceChildren(feedsDiv);
        form.reset();
        input.focus();
      }
    }
    if (path === 'input.state') {
      console.log(value);
      if (value === 'invalid') {
        if (state.feed.error !== 'PARSE' || state.feed.error !== 'ERR_NETWORK') {
          input.classList.add('is-invalid');
        }
      } else {
        input.classList.remove('is-invalid');
      }
    }
    if (path === 'uiState.modalWindow') {
      const activePost = items.find((post) => post.id === state.uiState.modalWindow);
      const modalTitle = document.querySelector('.modal-title');
      const modalDescription = document.querySelector('.text-break');
      const articleButton = document.querySelector('.full-article');
      articleButton.href = activePost.link;
      modalTitle.textContent = activePost.title;
      modalDescription.textContent = activePost.description;
    }
    if (path === 'uiState.previewButton' || path === 'itemsList') {
      const postsDiv = createContainer(state, 'posts', i18nInstance);
      postsContainer.replaceChildren(postsDiv);
    }
  });
};
