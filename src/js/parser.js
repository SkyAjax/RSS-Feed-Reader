
export default (data) => {
    const obj = {};
    const parser = new DOMParser();
    const parsedData = parser.parseFromString(data.data.contents, 'text/xml');
    obj.feed = [parsedData.querySelector('title').textContent, parsedData.querySelector('description').textContent];
    obj.posts = [...parsedData.querySelectorAll('item')];
    return obj;
};