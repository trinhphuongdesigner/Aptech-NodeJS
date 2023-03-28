const { default: mongoose } = require('mongoose');

const { Product } = require('../models');
// MONGOOSE
mongoose.connect('mongodb://127.0.0.1:27017/training-database');

try {
  Product.find({})
    .populate('category')
    .populate('supplier')
    .then((result) => {
      console.log(result);
    });
} catch (err) {
  console.log(err);
}
