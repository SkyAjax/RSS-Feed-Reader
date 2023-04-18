import { sortBy } from 'lodash';
import onChange from 'on-change';

const renderPosts = (state, i18nInstance, elements) => {
  const { postsContainer } = elements;
  const div = document.createElement('div');
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  div.classList.add('card', 'border-0');
  const childDiv = document.createElement('div');
  childDiv.classList.add('card-body');
  div.append(childDiv);
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nInstance.t('posts');
  childDiv.append(h2);
  const { posts } = state;
  const sortedPosts = sortBy(posts, 'id');
  sortedPosts.forEach((item) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('data-id', item.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18nInstance.t('buttons.view');
    a.href = item.link;
    if (state.uiState.seenPosts.includes(item.id)) {
      a.classList.remove('fw-bold');
      a.classList.add('fw-normal', 'link-secondary');
    } else {
      a.classList.add('fw-bold');
    }
    a.textContent = item.title;
    a.setAttribute('data-id', item.id);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    li.append(a);
    li.append(button);
    ul.prepend(li);
  });
  div.append(childDiv);
  if (div.lastElementChild === childDiv) {
    div.append(ul);
  }
  div.replaceChild(ul, div.lastElementChild);
  postsContainer.replaceChildren(div);
};

const renderModalWindow = (state) => {
  const items = state.posts.map((item) => item);
  const activePost = items.find((post) => post.id === state.uiState.modalWindow);
  const modalTitle = document.querySelector('.modal-title');
  const modalDescription = document.querySelector('.text-break');
  const articleButton = document.querySelector('.full-article');
  articleButton.href = activePost.link;
  modalTitle.textContent = activePost.title;
  modalDescription.textContent = activePost.description;
};

const renderState = (value, state, i18nInstance, elements) => {
  const {
    p, input, button, form,
  } = elements;
  if (value === 'loading') {
    p.textContent = '';
    input.setAttribute('readonly', 'true');
    input.removeAttribute('spellcheck');
    input.removeAttribute('data-ms-editor');
    input.classList.remove('is-invalid');
    button.classList.add('disabled');
  }
  if (value === 'failed') {
    p.classList.remove('text-success');
    p.classList.add('text-danger');
    button.classList.remove('disabled');
    input.removeAttribute('readonly');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('data-ms-editor', 'true');
    if (state.feedLoading.error === 'ERR_NETWORK') {
      p.textContent = i18nInstance.t('errors.network');
    } else if (state.feedLoading.error === 'PARSE') {
      p.textContent = i18nInstance.t('errors.noRss');
    } else {
      p.textContent = i18nInstance.t(state.feedLoading.error);
    }
  }
  if (value === 'completed') {
    button.classList.remove('disabled');
    input.removeAttribute('readonly');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('data-ms-editor', 'true');
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    p.classList.remove('text-danger');
    p.classList.add('text-success');
    p.textContent = i18nInstance.t('success');
    form.reset();
    input.focus();
  }
};

const renderFeeds = (state, i18nInstance, elements) => {
  const { feedsContainer } = elements;
  const div = document.createElement('div');
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  div.classList.add('card', 'border-0');
  const childDiv = document.createElement('div');
  childDiv.classList.add('card-body');
  div.append(childDiv);
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nInstance.t('feeds');
  childDiv.append(h2);
  state.feeds.forEach((feed) => {
    const { title, description } = feed;
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    const feedsP = document.createElement('p');
    feedsP.classList.add('m-0', 'small', 'text-black-50');
    h3.textContent = title;
    feedsP.textContent = description;
    li.append(h3);
    li.append(feedsP);
    ul.append(li);
  });
  div.append(childDiv);
  if (div.lastElementChild === childDiv) {
    div.append(ul);
  }
  div.replaceChild(ul, div.lastElementChild);
  feedsContainer.replaceChildren(div);
};

const renderInput = (state, elements) => {
  const { input } = elements;
  if (state.form.state === 'invalid') {
    input.classList.add('is-invalid');
  }
};

export default (state, i18nInstance) => {
  document.querySelector('.display-3').textContent = i18nInstance.t('title');
  document.querySelector('.lead').textContent = i18nInstance.t('subtitle');
  document.querySelector('.url-input-description').textContent = i18nInstance.t('urlInputDescription');
  document.querySelector('.full-article').textContent = i18nInstance.t('buttons.openFull');
  document.querySelector('.btn-lg').textContent = i18nInstance.t('buttons.add');
  document.querySelector('.text-muted').textContent = i18nInstance.t('linkExample');
  document.querySelector('.btn-secondary').textContent = i18nInstance.t('buttons.close');
  document.getElementById('credits').innerHTML = i18nInstance.t('author', { author: '<a href="https://github.com/SkyAjax/frontend-project-11" target="_blank">' });
  const elements = {
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    form: document.querySelector('form'),
    input: document.querySelector('.form-control'),
    p: document.querySelector('.feedback'),
    button: document.querySelector('.btn-lg'),
  };
  return onChange(state, (path, value) => {
    switch (path) {
      case 'feedLoading.state':
        renderState(value, state, i18nInstance, elements);
        break;
      case 'form.state':
        renderInput(state, elements);
        break;
      case 'feeds':
        renderFeeds(state, i18nInstance, elements);
        break;
      case 'posts':
      case 'uiState.seenPosts':
        renderPosts(state, i18nInstance, elements);
        break;
      case 'uiState.modalWindow':
        renderModalWindow(state);
        break;
      default:
        break;
    }
  });
};
