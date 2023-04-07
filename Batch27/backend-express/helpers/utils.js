const getQueryDateTime = (from, to, type = 'IN') => {
  fromDate = new Date(from);

  const tmpToDate = new Date(to);
  toDate = new Date(tmpToDate.setDate(tmpToDate.getDate() + 1));

  let query = {};

  if (type === 'IN') {
    const compareFromDate = { $gte: ['$createdDate', fromDate] };
    const compareToDate = { $lt: ['$createdDate', toDate] };
  
    query = {
      $expr: { $and: [compareFromDate, compareToDate] },
    };
  } else {
    const compareFromDate = { $lt: ['$createdDate', fromDate] };
    const compareToDate = { $gt: ['$createdDate', toDate] };
  
    query = {
      $expr: { $or: [compareFromDate, compareToDate] },
    };
  }

  return query;
}

module.exports = {
  getQueryDateTime,
}