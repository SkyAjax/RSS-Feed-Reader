import i18n from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import createWatchedState from './watchers';
import createYupSchema from './yup';
import resources from '../locales';
import { createProxyLink } from './helpers';
import parseData from './parser';

export default () => {
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  })
    .then(() => {
      document.querySelector('.display-3').textContent = i18nInstance.t('title');
      document.querySelector('.lead').textContent = i18nInstance.t('subtitle');
      document.querySelector('.url-input-description').textContent = i18nInstance.t('urlInputDescription');
      document.querySelector('.full-article').textContent = i18nInstance.t('buttons.openFull');
      document.querySelector('.btn-lg').textContent = i18nInstance.t('buttons.add');
      document.querySelector('.text-muted').textContent = i18nInstance.t('linkExample');
      document.querySelector('.btn-secondary').textContent = i18nInstance.t('buttons.close');
    // document.getElementById('credits').textContent = i18nInstance.t('author');
    });

  const form = document.querySelector('form');
  const input = document.querySelector('.form-control');

  const state = {
    input: { state: 'valid' },
    linksList: [],
    feedsList: [],
    postsList: [],
    rawParsedData: [],
    uiState: {
      showButton: [],
    },
    errors: [],
  };

  const watchedState = createWatchedState(state);
  input.focus();
  const previouslyParsedData = [];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newUrl = new FormData(e.target);
    const link = { url: newUrl.get('url').trim() };
    const validationSchema = createYupSchema(watchedState.linksList, link);
    validationSchema.validate(link)
      .then((response) => {
        const itemsArray = [];
        watchedState.errors.length = 0;
        watchedState.input.state = 'loading';
        axios.get(createProxyLink(response.url))
          .then((data) => {
            watchedState.input.state = 'valid';
            const parsedData = parseData(data);
            parsedData.posts.forEach((item) => {
              previouslyParsedData.push(item);
              const children = Array.from(item.children);
              const obj = {};
              children.forEach((child) => {
                const key = child.tagName;
                const value = child.textContent;
                obj[key] = value;
                obj.id = uniqueId();
              });
              itemsArray.push(obj);
              watchedState.uiState.showButton.push({ postId: obj.id, state: 'notClicked' });
            });
            watchedState.feedsList.push(parsedData.feed);
            watchedState.postsList.push(...itemsArray);
            watchedState.linksList.push(response.url);
            watchedState.rawParsedData.push(previouslyParsedData);
            watchedState.input.state = 'completed';
            form.reset();
            input.focus();

            const checkNewPosts = () => {
              watchedState.linksList.forEach((url) => {
                axios.get(createProxyLink(url))
                  .then((responseData) => {
                    const latestParsedData = parseData(responseData);
                    const inner = previouslyParsedData.flatMap((item) => item.innerHTML);
                    latestParsedData.posts.forEach((post) => {
                      if (!inner.includes(post.innerHTML)) {
                        previouslyParsedData.push(post);
                        const children = Array.from(post.children);
                        const obj = {};
                        children.forEach((child) => {
                          const key = child.tagName;
                          const value = child.textContent;
                          obj[key] = value;
                          obj.id = uniqueId();
                          watchedState.uiState.showButton.push({ postId: obj.id, state: 'notClicked' });
                        });
                        watchedState.postsList.push(obj);
                      }
                    });
                  });
              });
              setTimeout(checkNewPosts, 5000);
            };
            setTimeout(checkNewPosts, 5000);
          })
          .catch((error) => {
            console.error(error.message);
            if (error.isAxiosError) {
              watchedState.errors.push(i18nInstance.t('errors.network'));
            } else {
              watchedState.errors.push(i18nInstance.t('errors.default'));
            }
            watchedState.errors.push(error.message);
            watchedState.input.state = 'valid';
          });
      })
      .catch((err) => {
        watchedState.input.state = 'invalid';
        watchedState.errors.push(err.message);
      });
  });
};
