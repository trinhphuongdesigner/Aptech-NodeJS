const yup = require('yup');
const ObjectId = require('mongodb').ObjectId;

const validateSchema = (schema) => async (req, res, next) => {
  try {
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (err) {
    return res.status(400).json({ type: err.name, message: err.message });
  }
};

const getProductsSchema = yup.object({
  query: yup.object({
    category: yup.string().test('Validate ObjectID', '${path} is not valid ObjectID', (value) => {
      if (!value) return true;
      return ObjectId.isValid(value);
    }),
    sup: yup.string().test('Validate ObjectID', '${path} is not valid ObjectID', (value) => {
      if (!value) return true;
      return ObjectId.isValid(value);
    }),
    productName: yup.string(),
    stockStart: yup.number().min(0),
    stockEnd: yup.number(),
    priceStart: yup.number().min(0),
    priceEnd: yup.number(),
    discountStart: yup.number().min(0),
    discountEnd: yup.number().max(50),
    skip: yup.number(),
    limit: yup.number(),
  }),
});


module.exports = {
  validateSchema,
  getProductsSchema,
};