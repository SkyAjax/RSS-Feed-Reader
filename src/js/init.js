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
      document.getElementById('credits').innerHTML = i18nInstance.t('author', { author: '<a href="https://github.com/SkyAjax/frontend-project-11" target="_blank">' });

      const form = document.querySelector('form');

      const state = {
        input: { state: 'idle' },
        linksList: [],
        feedsList: [],
        postsList: [],
        rawParsedData: [],
        uiState: {
          previewButton: [],
        },
        errors: [],
      };

      const watchedState = createWatchedState(state);

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newUrl = new FormData(e.target);
        const link = { url: newUrl.get('url').trim() };
        const validationSchema = createYupSchema(watchedState.linksList, link);
        validationSchema.validate(link)
          .then((response) => {
            watchedState.errors.length = 0;
            watchedState.input.state = 'loading';
            axios.get(createProxyLink(response.url))
              .then((data) => {
                watchedState.input.state = 'idle';
                const parsedData = parseData(data);
                parsedData.posts.forEach((item) => {
                  const id = uniqueId();
                  item.setAttribute('id', id);
                  watchedState.uiState.previewButton.push({ id, state: 'notClicked' });
                });
                watchedState.feedsList.push(parsedData);
                watchedState.input.state = 'completed';
              })
              .catch((error) => {
                console.error(error.message);
                if (error.isAxiosError) {
                  watchedState.errors.push(error.code);
                } else {
                  watchedState.errors.push('DEFAULT');
                }
                watchedState.input.state = 'idle';
              });
          })
          .catch((err) => {
            watchedState.input.state = 'failed';
            watchedState.errors.push(err.message);
          });
      });
      const checkNewPosts = () => {
        watchedState.feedsList.forEach((feed) => {
          console.log(feed.channel.querySelector('link'));
          axios.get(createProxyLink(url.textContent))
            .then((responseData) => {
              const latestParsedData = parseData(responseData);
              const inner = watchedState.feedsList.posts.flatMap((item) => item.innerHTML);
              latestParsedData.posts.forEach((post) => {
                if (!inner.includes(post.innerHTML)) {
                  const id = uniqueId();
                  post.setAttribute('id', id);
                  console.log(post);
                  watchedState.feedsList.posts.push(post);
                  watchedState.uiState.previewButton.push({ id, state: 'notClicked' });
                }
              });
            });
        });
        setTimeout(checkNewPosts, 5000);
      };
      setTimeout(checkNewPosts, 5000);
    });
};
