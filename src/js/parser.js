export default (response) => {
  const obj = {};
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(response.data.contents, 'text/xml');
  obj.channel = parsedData.querySelectorAll('channel > :not(item)');
  obj.posts = [...parsedData.querySelectorAll('item')];

  return obj;
};
