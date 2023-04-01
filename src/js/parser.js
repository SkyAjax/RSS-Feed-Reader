export default (response) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(response.data.contents, 'text/xml');
  return {
    title: parsedData.querySelector('title').textContent,
    description: parsedData.querySelector('description').textContent,
    link: response.data.status.url,
    items: [...parsedData.querySelectorAll('item')],
  };
};
