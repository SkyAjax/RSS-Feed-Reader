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
      const form = document.querySelector('form');

      const state = {
        activeLanguage: defaultLanguage,
        feedLoading: {
          state: '',
          error: '',
        },
        form: { state: 'valid' },
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
        watchedState.feedLoading.state = 'loading';
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
                watchedState.form.state = 'valid';
                watchedState.feedLoading.state = 'completed';
              })
              .catch((error) => {
                console.error(error.message);
                if (error.isAxiosError) {
                  watchedState.feedLoading.error = error.code;
                } else if (error.isParseError) {
                  watchedState.feedLoading.error = error.code;
                } else {
                  watchedState.feedLoading.error = 'PARSE';
                }
                watchedState.feedLoading.state = 'failed';
              });
          })
          .catch((err) => {
            watchedState.feedLoading.error = err.message;
            watchedState.form.state = 'invalid';
            watchedState.feedLoading.state = 'failed';
          });
      });

      const postsContainer = document.querySelector('.posts');
      postsContainer.addEventListener('click', (e) => {
        if (!e.target.parentNode.classList.contains('list-group-item')) {
          return;
        }
        watchedState.uiState.modalWindow = Number(e.target.dataset.id);
        watchedState.uiState.seenPosts.push(Number(e.target.dataset.id));
      });

      const refreshTime = 5000;
      const checkNewPosts = () => {
        const linksList = watchedState.feeds.map((feed) => feed.link);
        const promises = linksList.map((link) => axios.get(createProxyLink(link))
          .then((response) => {
            const latestParsedData = parseData(response);
            const oldPosts = watchedState.posts;
            const newPosts = latestParsedData.items;
            const posts = differenceWith(newPosts, oldPosts, (p1, p2) => p1.title === p2.title)
              .map((post) => ({ ...post, id: Number(uniqueId()) }));
            watchedState.posts.unshift(...posts);
          })
          .catch((error) => console.error(error)));
        Promise.all(promises)
          .finally(setTimeout(checkNewPosts, refreshTime));
      };
      setTimeout(checkNewPosts, refreshTime);
    });
};
