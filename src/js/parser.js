export default (response) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(response.data.contents, 'text/xml');
  const items = parsedData.querySelectorAll('item');
  const itemsArray = [];
  items.forEach((item) => {
    itemsArray.push({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    });
  });
  return {
    title: parsedData.querySelector('title').textContent,
    description: parsedData.querySelector('description').textContent,
    link: response.data.status.url,
    items: itemsArray,
  };
};
