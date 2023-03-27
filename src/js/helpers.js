import i18n from 'i18next';
import resources from '../locales';

const i18nInstance = i18n.createInstance();
i18nInstance.init({
  lng: 'ru',
  debug: true,
  resources,
});

export const createProxyLink = (link) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`;

export const createDefaultView = () => {
  const input = document.querySelector('.form-control');
  const p = document.querySelector('.feedback');
  const button = document.querySelector('.btn-lg');
  p.textContent = '';
  p.classList.add('text-danger');
  p.classList.remove('text-success');
  button.classList.remove('disabled');
  input.classList.remove('is-invalid');
  input.removeAttribute('readonly');
  input.setAttribute('spellcheck', 'false');
  input.setAttribute('data-ms-editor', 'true');
};

export const createContainer = (list, block, state) => {
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
    list.forEach((item) => {
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
      const postUi = state.uiState.showButton.find((post) => post.postId === item.id);
      if (postUi.state === 'clicked') {
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

      button.addEventListener('click', () => {
        const modalTitle = document.querySelector('.modal-title');
        const modalDescription = document.querySelector('.text-break');
        const articleButton = document.querySelector('.full-article');
        articleButton.href = item.link;
        modalTitle.textContent = item.title;
        modalDescription.textContent = item.description;
        postUi.state = 'clicked';
        a.classList.remove('fw-bold');
        a.classList.add('fw-normal', 'link-secondary');
      });
    });
  }
  if (block === 'feeds') {
    list.forEach((item) => {
      const [title, description] = item;
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
