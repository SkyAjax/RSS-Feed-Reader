import axios from 'axios';
import { createProxyLink } from './helpers';

export default (response) => {
    // axios.get(createProxyLink(url))
    // .then((response) => {
    //     console.log(response.data.contents)
    //   watchedState.input.state = 'valid';
      const obj = {};
      const parser = new DOMParser();
      const parsedData = parser.parseFromString(response.data.contents, 'text/xml');
      obj.feed = [parsedData.querySelector('title').textContent, parsedData.querySelector('description').textContent];
      obj.posts = [...parsedData.querySelectorAll('item')];
      return obj;
    // })
    // .catch(function (error) {
        // console.log(error);
        // watchedState.errors.push(i18nInstance.t('errors.default'));
        // watchedState.input.state = 'valid';
    //   });
};