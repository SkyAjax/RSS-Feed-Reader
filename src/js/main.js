// Import our custom CSS
import '../scss/styles.scss'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

import * as yup from 'yup';
import onChange from 'on-change';

const userSchema = yup.object({
    link: url().required()
});

// export default () => {
    const form = document.querySelector('form');
    const input = document.querySelector('.form-control');
    const state = {
        linkField: 'valid',
        value: '',
    };

    const watchedState = onChange(state, () => {

    })

    // input.addEventListener('change', (e) => {
    // })

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = new FormData();
        console.log(data);
    })
// }

console.log('pizza')