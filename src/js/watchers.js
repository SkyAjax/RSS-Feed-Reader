import onChange from 'on-change';

const input = document.querySelector('.form-control');

export default watchedState = onChange(state, () => {
    input.classList.remove('is-invalid');
    if (state.linkField === 'invalid') {
        input.classList.add('is-invalid');
    }
})