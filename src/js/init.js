import i18n from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import createWatchedState from './watchers';
import createYupSchema from './yup';
import resources from '../locales';
import { createProxyLink } from './helpers';
import parseData from './parser';

export default () => {
  const defaultLanguage = 'ru';

  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
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
        activeLanguage: defaultLanguage,
        feed: {
          state: 'idle',
          error: '',
        },
        input: { state: 'valid' },
        feedsList: [],
        itemsList: [],
        uiState: {
          previewButton: [],
          modalWindow: null,
        },
      };

      const watchedState = createWatchedState(state, i18nInstance);
      watchedState.feed.state = 'idle';

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newUrl = new FormData(e.target);
        const link = { url: newUrl.get('url').trim() };
        const linksList = watchedState.feedsList.map((feed) => feed.link);
        const validationSchema = createYupSchema(linksList, link);
        validationSchema.validate(link)
          .then((response) => {
            watchedState.feed.error = '';
            watchedState.feed.state = 'loading';
            axios.get(createProxyLink(response.url))
              .then((data) => {
                watchedState.input.state = 'idle';
                const parsedData = parseData(data);
                parsedData.feed.link = response.url;
                const feedId = Number(uniqueId());
                parsedData.feed.id = feedId;
                parsedData.items.forEach((item) => {
                  const post = item;
                  post.feedId = feedId;
                  post.id = Number(uniqueId());
                });
                watchedState.feedsList.push(parsedData.feed);
                watchedState.itemsList.push(...parsedData.items);
                watchedState.input.state = 'valid';
                watchedState.feed.state = 'completed';
              })
              .catch((error) => {
                console.error(error.message);
                if (error.isAxiosError) {
                  watchedState.feed.error = error.code;
                } else if (error.isParseError) {
                  watchedState.feed.error = error.code;
                } else {
                  watchedState.feed.error = 'PARSE';
                }
                watchedState.input.state = 'invalid';
                watchedState.feed.state = 'failed';
              });
          })
          .catch((err) => {
            watchedState.feed.error = i18nInstance.t(err.message);
            watchedState.input.state = 'invalid';
            watchedState.feed.state = 'failed';
          });
      });

      const postsContainer = document.querySelector('.posts');
      postsContainer.addEventListener('click', (e) => {
        if (e.target.dataset.bsToggle !== 'modal') {
          return;
        }
        watchedState.uiState.modalWindow = Number(e.target.dataset.id);
        watchedState.uiState.previewButton.push(Number(e.target.dataset.id));
      });

      const checkNewPosts = () => {
        const linksList = watchedState.feedsList.map((feed) => feed.link);
        if (linksList.length !== 0) {
          Promise.all(linksList.map((link) => axios.get(createProxyLink(link))))
            .then((responseData) => {
              responseData.forEach((response) => {
                const latestParsedData = parseData(response);
                const links = watchedState.itemsList
                  .flatMap((items) => items)
                  .map((item) => item.link);
                latestParsedData.items.forEach((item) => {
                  if (!links.includes(item.link)) {
                    const feedId = watchedState.feedsList
                      .find((feed) => feed.title === latestParsedData.feed.title);
                    const post = item;
                    post.feedId = feedId.id;
                    post.id = Number(uniqueId());
                    watchedState.itemsList.push(item);
                  }
                });
              });
            })
            .finally(() => null);
        }
        setTimeout(checkNewPosts, 5000);
      };
      setTimeout(checkNewPosts, 5000);
    });
};
