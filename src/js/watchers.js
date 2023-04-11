import onChange from 'on-change';
import {
  renderModalWindow, renderState, renderFeeds, renderPosts, renderInput,
} from './helpers';

export default (state, i18nInstance) => {
  const elements = {
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    form: document.querySelector('form'),
    input: document.querySelector('.form-control'),
    p: document.querySelector('.feedback'),
    button: document.querySelector('.btn-lg'),
  };
  return onChange(state, (path, value) => {
    switch (path) {
      case 'feed.state':
        renderState(value, state, i18nInstance, elements);
        break;
      case 'input.state':
        renderInput(state, elements);
        break;
      case 'feeds':
        renderFeeds(state, i18nInstance, elements);
        break;
      case 'posts':
      case 'uiState.seenPosts':
        renderPosts(state, i18nInstance, elements);
        break;
      case 'uiState.modalWindow':
        renderModalWindow(state);
        break;
      default:
        break;
    }
  });
};
