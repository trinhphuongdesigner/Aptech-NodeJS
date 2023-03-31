const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const bcrypt = require('bcryptjs');

// Mongoose Datatypes:
// https://mongoosejs.com/docs/schematypes.html

// Validator
// https://mongoosejs.com/docs/validation.html#built-in-validators

const employeeSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      validate: {
        validator: function (value) {
          const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
          return emailRegex.test(value);
        },
        message: `{VALUE} is not a valid email!`,
        // message: (props) => `{props.value} is not a valid email!`,
      },
      required: [true, 'email is required'],
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (value) {
          const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
          return phoneRegex.test(value);
        },
        message: `{VALUE} is not a valid phone!`,
        // message: (props) => `{props.value} is not a valid email!`,
      },
    },
    password: { type: String, required: true },
    address: { type: String, required: true },
    birthday: { type: Date },
  },
  {
    versionKey: false,
  },
);

// Virtuals
employeeSchema.virtual('fullName').get(function () {
  return this.firstName + ' ' + this.lastName;
});


// employeeSchema.pre('save', function a(next) {
//   const user = this;

//   if (!user.isModified('password')) return next();

//   bcrypt.genSalt(10, (err, salt) => {
//     if (err) return next(err);

//     bcrypt.hash(user.password, salt, (hashErr, hash) => {
//       if (hashErr) return next(hashErr);

//       user.password = hash;
//       next();
//     });
//   });
// });

// // Check password from client
// employeeSchema.methods.comparePassword = function comparePassword(checkPassword) {
//   return bcrypt.compareSync(checkPassword, this.password);
// };

const Employee = model('Employee', employeeSchema);
module.exports = Employee;
