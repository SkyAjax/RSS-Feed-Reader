import * as yup from 'yup';

export default (arr, value) => { 
    return yup.object({
    url: yup.string()
    .notOneOf([...arr], 'RSS уже существует')
    .required()
    .url('Ссылка должна быть валидным URL'),
});
}