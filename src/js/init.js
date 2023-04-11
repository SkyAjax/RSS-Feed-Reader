import i18n from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import * as yup from 'yup';
import createWatchedState from './watchers';
import createYupSchema from './yup_schema';
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
        feeds: [],
        posts: [],
        uiState: {
          seenPosts: [],
          modalWindow: null,
        },
      };

      yup.setLocale({
        mixed: {
          notOneOf: 'errors.notUnique',
        },
        string: {
          url: 'errors.notValid',
        },
      });
      const watchedState = createWatchedState(state, i18nInstance);
      watchedState.feed.state = 'idle';

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.feed.state = 'loading';
        const newUrl = new FormData(e.target);
        const link = { url: newUrl.get('url').trim() };
        const linksList = watchedState.feeds.map((feed) => feed.link);
        const validationSchema = createYupSchema(linksList, link);
        validationSchema.validate(link)
          .then((response) => {
            axios.get(createProxyLink(response.url))
              .then((data) => {
                watchedState.feed.state = 'idle';
                const parsedData = parseData(data);
                parsedData.feed.link = response.url;
                const feedId = Number(uniqueId());
                parsedData.feed.id = feedId;
                parsedData.items.forEach((item) => {
                  const post = item;
                  post.feedId = feedId;
                  post.id = Number(uniqueId());
                });
                watchedState.feeds.push(parsedData.feed);
                watchedState.posts.push(...parsedData.items);
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
            watchedState.feed.error = err.message;
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
        watchedState.uiState.seenPosts.push(Number(e.target.dataset.id));
      });

      const checkNewPosts = () => {
        const linksList = watchedState.feeds.map((feed) => feed.link);
        Promise.all(linksList.map((link) => axios.get(createProxyLink(link))))
          .then((responseData) => {
            responseData.forEach((response) => {
              const latestParsedData = parseData(response);
              const links = watchedState.posts
                .flatMap((items) => items)
                .map((item) => item.link);
              latestParsedData.items.forEach((item) => {
                if (!links.includes(item.link)) {
                  const feedId = watchedState.feeds
                    .find((feed) => feed.title === latestParsedData.feed.title);
                  const post = item;
                  post.feedId = feedId.id;
                  post.id = Number(uniqueId());
                  watchedState.posts.push(item);
                }
              });
            });
          })
          .finally(setTimeout(checkNewPosts, 5000));
      };
      setTimeout(checkNewPosts, 5000);
    });
};
