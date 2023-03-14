import onChange from 'on-change';


export default (state) => { 
    return onChange(state, () => {
    const input = document.querySelector('.form-control');
    const p = document.querySelector('.feedback');
    p.textContent = '';
    input.classList.remove('is-invalid');
    if (state.linkField === 'invalid') {
        input.classList.add('is-invalid');
    }
    state.errors.map((error) => {
        p.textContent = error;
    })
})
}