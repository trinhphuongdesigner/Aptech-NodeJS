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

const loginSchema = yup.object({
  body: yup.object({
    email: yup.string().email().required(),
    password: yup.string().min(3).max(31).required(),
  }),
  params: yup.object({}),
});

const categorySchema = yup.object().shape({
  params: yup.object({
    id: yup.string().test('Validate ObjectID', '${path} is not valid ObjectID', (value) => {
      return ObjectId.isValid(value);
    }),
  }),
});

module.exports = {
  validateSchema,
  loginSchema,
  categorySchema,
};