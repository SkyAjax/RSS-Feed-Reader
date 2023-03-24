import createWatchedState from './watchers';
import createYupSchema from './yup';
import i18n from 'i18next';
import resources from '../locales';
import axios from 'axios';
import { createProxyLink } from './helpers';
import parseData from './parser';
import { uniqueId } from 'lodash';

export default () => {
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  })
  .then(function(t) {
    document.querySelector('.display-3').textContent = i18nInstance.t('title');
    document.querySelector('.lead').textContent = i18nInstance.t('subtitle');  
    document.querySelector('.url-input-description').textContent = i18nInstance.t('urlInputDescription'); 
    document.querySelector('.full-article').textContent = i18nInstance.t('modalFooter.fullArticle'); 
    document.querySelector('.btn-lg').textContent = i18nInstance.t('buttons.add'); 
    document.querySelector('.text-muted').textContent = i18nInstance.t('linkExample'); 
    document.querySelector('[data-bs-dismiss="modal"]').textContent = i18nInstance.t('buttons.close'); 
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
          children.map((child) => {
            const key = child.tagName;
            const value = child.textContent;
            obj[key] = value;
            obj.id = uniqueId();
          })
          itemsArray.push(obj);
        })
        watchedState.feedsList.push(parsedData.feed);
        watchedState.postsList.push(...itemsArray);
        watchedState.linksList.push(response.url);
        watchedState.rawParsedData.push(previouslyParsedData);
        watchedState.input.state = 'completed';
        form.reset();
        input.focus();
        
        const checkNewPosts = () => {
          watchedState.linksList.map((link) => {
          axios.get(createProxyLink(link))
          .then((data) => {
            const latestParsedData = parseData(data);
            const inner = previouslyParsedData.flatMap((item) => item.innerHTML);
            latestParsedData.posts.forEach((post) => {
              if (!inner.includes(post.innerHTML)) {
                previouslyParsedData.push(post);
                const children = Array.from(post.children);
                const obj = {};
                children.map((child) => {
                  const key = child.tagName;
                  const value = child.textContent;
                  obj[key] = value;
                  obj.id = uniqueId();
                })
                watchedState.postsList.push(obj);
                }
              })
            })
          });
          setTimeout(checkNewPosts, 5000);
        };
        setTimeout(checkNewPosts, 5000);
      })
      .catch((err) => {
        watchedState.errors.push(i18nInstance.t('errors.default'));
        console.error(err);
        watchedState.input.state = 'valid';
      })
    })
    .catch((err) => {
      watchedState.input.state = 'invalid';
      watchedState.errors.push(err.message);
    });
  });


};