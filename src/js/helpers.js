import { sortBy } from 'lodash';

export const createProxyLink = (link) => {
  const url = new URL(`/get?disableCache=true&url=${encodeURIComponent(link)}`, 'https://allorigins.hexlet.app');
  return url.href;
};

export const createContainer = (state, block, i18nInstance) => {
  const div = document.createElement('div');
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  div.classList.add('card', 'border-0');
  const childDiv = document.createElement('div');
  childDiv.classList.add('card-body');
  div.append(childDiv);
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nInstance.t(block);
  childDiv.append(h2);
  if (block === 'posts') {
    const { itemsList } = state;
    console.log(itemsList);
    const sortedPosts = sortBy(itemsList, 'id');
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
      if (state.uiState.previewButton.includes(item.id)) {
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
  }
  if (block === 'feeds') {
    state.feedsList.forEach((feed) => {
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
  }
  div.append(childDiv);
  if (div.lastElementChild === childDiv) {
    div.append(ul);
  }
  div.replaceChild(ul, div.lastElementChild);
  return div;
};
