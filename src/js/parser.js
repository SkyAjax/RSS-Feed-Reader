export default (response) => {
  const obj = {};
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(response.data.contents, 'text/xml');
  obj.feed = [parsedData.querySelector('title').textContent, parsedData.querySelector('description').textContent];
  obj.posts = [...parsedData.querySelectorAll('item')];
  return obj;
};
