export default (response) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(response.data.contents, 'text/xml');
  const items = [...parsedData.querySelectorAll('item')];
  const error = parsedData.querySelector('parsererror');
  if (error) {
    error.isParseError = true;
    throw new Error(error.textContent);
  }
  const itemsArray = [];
  items.map((item) => itemsArray.push({
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    link: item.querySelector('link').textContent,
  }));
  return {
    feed: {
      title: parsedData.querySelector('title').textContent,
      description: parsedData.querySelector('description').textContent,
    },
    items: itemsArray,
  };
};
