const fuzzySearch = (text) => {
  const regex = text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

  return new RegExp(regex, 'gi');
};

module.exports = fuzzySearch;
