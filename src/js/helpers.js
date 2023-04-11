import { sortBy } from 'lodash';

export const createProxyLink = (link) => {
  const url = new URL('https://allorigins.hexlet.app/get');
  url.searchParams.set('disableCache', 'true');
  url.searchParams.set('url', encodeURI(link));
  return url.href;
};

export const renderPosts = (state, i18nInstance, elements) => {
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
  h2.textContent = i18nInstance.t('feeds');
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

export const renderModalWindow = (state) => {
  const items = state.posts.map((item) => item);
  const activePost = items.find((post) => post.id === state.uiState.modalWindow);
  const modalTitle = document.querySelector('.modal-title');
  const modalDescription = document.querySelector('.text-break');
  const articleButton = document.querySelector('.full-article');
  articleButton.href = activePost.link;
  modalTitle.textContent = activePost.title;
  modalDescription.textContent = activePost.description;
};

export const renderState = (value, state, i18nInstance, elements) => {
  const {
    p, input, button, form,
  } = elements;
  if (value === 'idle') {
    p.textContent = '';
    p.classList.add('text-danger');
    p.classList.remove('text-success');
    button.classList.remove('disabled');
    input.removeAttribute('readonly');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('data-ms-editor', 'true');
  }
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
    if (state.feed.error === 'ERR_NETWORK') {
      p.textContent = i18nInstance.t('errors.network');
    } else if (state.feed.error === 'PARSE') {
      p.textContent = i18nInstance.t('errors.noRss');
    } else {
      p.textContent = i18nInstance.t(state.feed.error);
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

export const renderFeeds = (state, i18nInstance, elements) => {
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

export const renderInput = (state, elements) => {
  const { input } = elements;
  if (state.input.state === 'invalid') {
    if (state.feed.error !== 'PARSE' || state.feed.error !== 'ERR_NETWORK') {
      input.classList.add('is-invalid');
    }
  } else {
    input.classList.remove('is-invalid');
  }
};
