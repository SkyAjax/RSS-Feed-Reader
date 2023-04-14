import i18n from 'i18next';
import axios from 'axios';
import { differenceWith, uniqueId } from 'lodash';
import * as yup from 'yup';
import createWatchedState from './watchers';
import createYupSchema from './yup_schema';
import resources from '../locales';
import createProxyLink from './helpers';
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
          state: '',
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
                const parsedData = parseData(data);
                const copyParsedData = { ...parsedData };
                copyParsedData.feed.link = response.url;
                const feedId = Number(uniqueId());
                copyParsedData.feed.id = feedId;
                copyParsedData.items.forEach((item) => {
                  const post = item;
                  post.feedId = feedId;
                  post.id = Number(uniqueId());
                });
                watchedState.feeds.push(copyParsedData.feed);
                watchedState.posts.push(...copyParsedData.items);
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
              const oldPosts = watchedState.posts;
              const newPosts = latestParsedData.items;
              const posts = differenceWith(newPosts, oldPosts, (p1, p2) => p1.title === p2.title)
                .map((post) => ({ ...post, id: Number(uniqueId()) }));
              watchedState.posts.unshift(...posts);
            });
          })
          .finally(setTimeout(checkNewPosts, 5000));
      };
      setTimeout(checkNewPosts, 5000);
    });
};
