const yup = require('yup');
const express = require('express');
const router = express.Router();
const { default: mongoose } = require('mongoose');
const ObjectId = require('mongodb').ObjectId;

const {
  Category,
  Product,
  Customer,
  Employee,
  Order,
  Supplier,
} = require('../models');
const { getQueryDateTime } = require('../helpers/utils')


// QUESTIONS 1a http://localhost:9000/questions/1a?discount=10
// Hiển thị tất cả các mặt hàng có giảm giá <= 10%

router.get('/1a', async (req, res, next) => {
  try {
    let discount = req.query.discount;

    let query = { discount: { $lte: discount } };

    Product.find(query)
      .then((result) => {
        res.send({
          total: result.length,
          payload: result,
        });
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// QUESTIONS 1b http://localhost:9000/questions/1b?discount=10
// Hiển thị tất cả các mặt hàng có giảm giá <= 10%, và chi tiết danh mục, nhà cung cấp

router.get('/1b', function (req, res, next) {
  try {
    let discount = req.query.discount;
    let query = { discount: { $lte: discount } };
    Product.find(query)
      .populate('category')
      .populate('supplier')
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// QUESTIONS 2a http://localhost:9000/questions/2a?stock=5
// Hiển thị tất cả các mặt hàng có tồn kho <= 5

router.get('/2a', function (req, res, next) {
  try {
    let stock = req.query.stock;
    let query = { stock: { $lte: stock } };

    Product.find(query)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// QUESTIONS 2b http://localhost:9000/questions/2b?stock=5
// Hiển thị tất cả các mặt hàng có tồn kho <= 5 và chi tiết danh mục, nhà cung cấp

router.get('/2b', function (req, res, next) {
  try {
    let stock = req.query.stock;
    let query = { stock: { $lte: stock } };
    Product.find(query)
      .populate('category')
      .populate('supplier')
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// QUESTIONS 3 http://localhost:9000/questions/3?price=100000
// Hiển thị tất cả các mặt hàng có Giá bán sau khi đã giảm giá <= 100.000

router.get('/3', async (req, res, next) => {
  try {
    // let finalPrice = price * (100 - discount) / 100;
    const s = { $subtract: [100, '$discount'] }; // (100 - 10) s => 90

    const m = { $multiply: ['$price', s] }; // price * 90

    const d = { $divide: [m, 100] }; // price * 90 / 100

    const { price } = req.query;

    let query = { $expr: { $lte: [d, parseFloat(price)] } };

    Product.find(query)
      .select('name price discount')
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } catch (error) {
    res.status(500).json(error);
  }
});

// QUESTIONS 4 hhttp://localhost:9000/questions/4?address=dien bien phu
// Hiển thị tất cả các khách hàng có địa chỉ ở Quận Hải Châu

router.get('/4', function (req, res, next) {
  try {
    const address = req.query.address;

    const query = { address: new RegExp(`${address}`) };

    Customer.find(query)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// QUESTIONS 5 http://localhost:9000/questions/5?year=1990
// Hiển thị tất cả các khách hàng có năm sinh 1990
// https://www.mongodb.com/docs/v6.0/reference/operator/aggregation/year/

router.get('/5', function (req, res, next) {
  try {
    const year = req.query.year;

    const query = {
      $expr: {
        $eq: [{ $year: '$birthday' }, year],
      },
    };

    Customer.find(query)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// QUESTIONS 6 http://localhost:9000/questions/6?date=1990-02-01
// Hiển thị tất cả các khách hàng có sinh nhật là hôm nay

// https://www.mongodb.com/docs/v6.0/reference/operator/aggregation/month/
// https://www.mongodb.com/docs/v6.0/reference/operator/aggregation/dayOfMonth/
// https://www.mongodb.com/docs/manual/reference/operator/query/

router.get('/6', function (req, res, next) {
  try {
    const date = req.query.date;
    const today = new Date(date);

    const eqDay = {
      $eq: [{ $dayOfMonth: '$birthday' }, { $dayOfMonth: today }],
    };
    const eqMonth = { $eq: [{ $month: '$birthday' }, { $month: today }] };

    const query = {
      $expr: {
        $and: [eqDay, eqMonth],
      },
    };

    Customer.find(query)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// QUESTIONS 7 http://localhost:9000/questions/7?status=WAITING
// Hiển thị tất cả các đơn hàng có trạng thái là COMPLETED

router.get('/7', function (req, res, next) {
  try {
    const { status } = req.query;

    Order.find({ status: status })
      .populate({
        path: 'orderDetails.product',
        select: { name: 1, price: 1, discount: 1, stock: 1 },
      })
      .populate({ path: 'customer', select: 'firstName lastName' })
      .populate('employee')

      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// QUESTIONS 8 // http://localhost:9000/questions/8?status=COMPLETED
// Hiển thị tất cả các đơn hàng có trạng thái là COMPLETED trong ngày hôm nay

router.get('/8a', function (req, res, next) {
  try {
    let { status, date } = req.query;
    const fromDate = new Date(date);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = new Date(new Date().setDate(fromDate.getDate() + 1));
    toDate.setHours(0, 0, 0, 0);

    const compareStatus = { $eq: ['$status', status] };
    const compareFromDate = { $gte: ['$createdDate', fromDate] };
    const compareToDate = { $lt: ['$createdDate', toDate] };
    const query = {
      $expr: { $and: [compareStatus, compareFromDate, compareToDate] },
    };

    Order.find(query)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// QUESTIONS 8B http://localhost:9000/questions/8b?fromDate=2023-03-27&toDate=2023-03-27&status=COMPLETED
// Hiển thị tất cả các đơn hàng có trạng thái là <status> có ngày tạo trong khoảng <fromDate> và <toDate>

router.get('/8b', function (req, res, next) {
  try {
    let { status, fromDate, toDate } = req.query;

    fromDate = new Date(fromDate);

    const tmpToDate = new Date(toDate);
    toDate = new Date(tmpToDate.setDate(tmpToDate.getDate() + 1));

    const compareStatus = { $eq: ['$status', status] };
    const compareFromDate = { $gte: ['$createdDate', fromDate] };
    const compareToDate = { $lt: ['$createdDate', toDate] };

    const query = {
      $expr: { $and: [compareStatus, compareFromDate, compareToDate] },
    };

    Order.find(query)
      .populate('orderDetails.product')
      .populate('customer')
      .populate('employee')
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// QUESTIONS 13 http://localhost:9000/questions/13?address=340
// Hiển thị tất cả các đơn hàng có địa chỉ giao hàng là Hà Nội

router.get('/13', function (req, res, next) {
  try {
    let address = req.query.address;

    Order.aggregate()
      .lookup({
        from: 'customers',
        localField: 'customerId',
        foreignField: '_id',
        as: 'customer',
      })
      .unwind('customer')
      .match({
        'customer.address': new RegExp(address),
      })
      .project({
        customerId: 0,
      })
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// QUESTIONS 15 http://localhost:9000/questions/15?supplierNames=Apple&supplierNames=SONY
// Hiển thị tất cả các nhà cung cấp có tên là: (SONY, SAMSUNG, TOSHIBA, APPLE)

router.get('/15', function (req, res, next) {
  try {
    let supplierNames = req.query.supplierNames;
    let query = {
      name: { $in: supplierNames },
    };

    Supplier.find(query)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// Hiển thị tất cả các mặt hàng cùng với thông tin chi tiết của Category và Supplier

router.get('/17', async (req, res, next) => {
  try {
    const response = await Product.find()
      .populate('category')
      .populate('supplier');

    if (!response) {
      return res.status(400).send({ message: 'Not found' });
    }

    res.send(response);
  } catch (err) {
    res.sendStatus(500);
  }
});

// Hiển thị tất cả danh mục (Categories) với số lượng hàng hóa trong mỗi danh mục

// router.get('/18', async (req, res, next) => {
//   try {
//     let response = await Category.aggregate()
//     .lookup({
//       from: 'products',
//       localField: '_id',
//       foreignField: 'categoryId',
//       as: 'products'
//     });

//     response = response.map((item) => {
//       let sumStock = 0;

//       if (item.products.length > 0) {
//         sumStock = item.products.reduce(
//           (accumulator, object) => accumulator + object.stock,
//           0
//         );
//       }

//       return {
//         ...item,
//         sumStock,
//       };
//     })

//     if (!response) {
//       return res.status(400).send({ message: "Not found" });
//     }

//     res.send(aaa);
//   } catch (err) {
//     res.status(500).send(err);
//   }
// });

router.get('/18', async (req, res, next) => {
  try {
    let response = await Category.aggregate()
      .lookup({
        from: 'products',
        localField: '_id',
        foreignField: 'categoryId',
        as: 'products',
      })
      .unwind('products')
      .group({
        _id: '$_id',
        name: { $first: '$name' },
        description: { $first: '$description' },
        totalProduct: {
          $sum: '$products.stock',
        },
      })
      .sort({
        totalProduct: -1,
        name: 1,
      });

    if (!response) {
      return res.status(400).send({ message: 'Not found' });
    }

    res.send(response);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Hiển thị tất cả nhà cung cấp (Suppliers) với số lượng hàng hóa mỗi nhà cung cấp

router.get('/19', async (req, res, next) => {
  try {
    let response = await Supplier.aggregate()
      .lookup({
        from: 'products',
        localField: '_id',
        foreignField: 'supplierId',
        as: 'products',
      })
      .unwind('products')
      .group({
        _id: '$_id',
        name: { $first: '$name' },
        email: { $first: '$email' },
        phoneNumber: { $first: '$phoneNumber' },
        address: { $first: '$address' },
        totalProduct: {
          $sum: '$products.stock',
        },
      })
      .sort({
        totalProduct: -1,
        name: -1,
      });

    if (!response) {
      return res.status(400).send({ message: 'Not found' });
    }

    res.send(response);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Hiển thị tất cả các mặt hàng được bán trong khoảng từ ngày, đến ngày

router.get('/20', async (req, res, next) => {
  try {
    let { fromDate, toDate } = req.query;
    const query = getQueryDateTime(fromDate, toDate);

    let response = await Order.aggregate()
      .match(query)
      .unwind('orderDetails')
      .lookup({
        from: 'products',
        localField: 'orderDetails.productId',
        foreignField: '_id',
        as: 'orderDetails.products',
      })
      .unwind('orderDetails.products')
      .group({
        _id: '$orderDetails.productId',
        name: { $first: '$orderDetails.products.name' },
        price: { $first: '$orderDetails.products.price' },
        discount: { $first: '$orderDetails.products.discount' },
        stock: { $first: '$orderDetails.products.stock' },
      });

    if (!response) {
      return res.status(400).send({ message: 'Not found' });
    }

    res.send(response);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Hiển thị tất cả các khách hàng mua hàng trong khoảng từ ngày, đến ngày

router.get('/21', async (req, res, next) => {
  try {
    let { fromDate, toDate } = req.query;

    fromDate = new Date(fromDate);

    const tmpToDate = new Date(toDate);
    toDate = new Date(tmpToDate.setDate(tmpToDate.getDate() + 1));

    const compareFromDate = { $gte: ['$createdDate', fromDate] };
    const compareToDate = { $lt: ['$createdDate', toDate] };

    let response = await Order.aggregate()
      .match({
        $expr: { $and: [compareFromDate, compareToDate] },
      })
      .lookup({
        from: 'customers',
        localField: 'customerId',
        foreignField: '_id',
        as: 'customers',
      })
      .unwind('customers')
      .group({
        _id: '$customers._id',
        firstName: { $first: '$customers.firstName' },
        lastName: { $first: '$customers.lastName' },
        email: { $first: '$customers.email' },
        phoneNumber: { $first: '$customers.phoneNumber' },
        address: { $first: '$customers.address' },
        birthday: { $first: '$customers.birthday' },
      });

    if (!response) {
      return res.status(400).send({ message: 'Not found' });
    }

    res.send(response);
  } catch (err) {
    res.status(500).send(err);
  }
});

// QUESTIONS 22 http://localhost:9000/questions/22?fromDate=2023-03-27&toDate=2023-03-29
// Hiển thị tất cả các khách hàng mua hàng (với tổng số tiền) trong khoảng từ ngày, đến ngày

router.get('/22', function (req, res, next) {
  try {
    let { fromDate, toDate } = req.query;

    fromDate = new Date(fromDate);

    const tmpToDate = new Date(toDate);
    toDate = new Date(tmpToDate.setDate(tmpToDate.getDate() + 1));

    const compareFromDate = { $gte: ['$createdDate', fromDate] };
    const compareToDate = { $lt: ['$createdDate', toDate] };

    const query = {
      $expr: { $and: [compareFromDate, compareToDate] },
    };

    // const s = { $subtract: [100, '$orderDetails.discount'] };

    // const m = { $multiply: ['$orderDetails.price', s] };

    // const d = { $divide: [m, 100] };

    Order.aggregate()
      .lookup({
        from: 'customers',
        localField: 'customerId',
        foreignField: '_id',
        as: 'customer',
      })
      .match(query)
      .unwind('customer')
      .unwind('orderDetails')
      .addFields({
        originalPrice: {
          $divide: [
            {
              $multiply: [
                '$orderDetails.price',
                { $subtract: [100, '$orderDetails.discount'] },
              ],
            },
            100,
          ],
        },
      })
      .group({
        _id: '$customer._id',
        firstName: { $first: '$customer.firstName' },
        lastName: { $first: '$customer.lastName' },
        email: { $first: '$customer.email' },
        phoneNumber: { $first: '$customer.phoneNumber' },
        address: { $first: '$customer.address' },
        birthday: { $first: '$customer.birthday' },
        total_sales: {
          $sum: { $multiply: ['$originalPrice', '$orderDetails.quantity'] },
        },
      })
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// Hiển thị tất cả các nhân viên bán hàng với tổng số tiền bán được

router.get('/24', async (req, res, next) => {
  try {
    const response = await Order.aggregate()
      .lookup({
        from: 'employees',
        localField: 'employeeId',
        foreignField: '_id',
        as: 'employees',
      })
      .unwind('employees')
      .unwind('orderDetails')
      .lookup({
        from: 'products',
        localField: 'orderDetails.productId',
        foreignField: '_id',
        as: 'orderDetails.products',
      })
      .unwind('orderDetails.products')
      .addFields({
        originalPrice: {
          $divide: [
            {
              $multiply: [
                '$orderDetails.products.price',
                { $subtract: [100, '$orderDetails.products.discount'] },
              ],
            },
            100,
          ],
        },
      })
      .group({
        _id: '$employees._id',
        firstName: { $first: '$employees.firstName' },
        lastName: { $first: '$employees.lastName' },
        email: { $first: '$employees.email' },
        phoneNumber: { $first: '$employees.phoneNumber' },
        address: { $first: '$employees.address' },
        birthday: { $first: '$employees.birthday' },
        totalSales: {
          $sum: { $multiply: ['$originalPrice', '$orderDetails.quantity'] },
        },
      });

    if (!response) return res.status(400).send({ message: 'Not found' });

    res.send(response);
  } catch (err) {
    res.sendStatus(500);
  }
});

// ------------------------------------------------------------------------------------------------
// QUESTIONS 25
// Hiển thị tất cả các mặt hàng không bán được
// ------------------------------------------------------------------------------------------------
router.get('/25', async (req, res, next) => {
  try {
    const option = [
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'orderDetails.productId',
          as: 'orders',
        },
      },
      {
        $match: {
          orders: { $size: 0 },
        },
      },
      {
        $project: {
          id: 1,
          name: 1,
          price: 1,
          stock: 1,
          categoryId: 1,
        },
      },
    ];

    Product.aggregate(option)
      .then((result) => {
        res.send({
          total: result.length,
          payload: result,
        });
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (error) {
    res.sendStatus(500);
  }
});

router.get('/25b', async (req, res, next) => {
  try {
    Product.aggregate()
      .lookup({
        from: 'orders',
        localField: '_id',
        foreignField: 'orderDetails.productId',
        as: 'orders',
      })
      .match({
        orders: { $size: 0 },
      })
      .project({
        id: 1,
        name: 1,
        price: 1,
        stock: 1,
      })
      .then((result) => {
        res.send({
          payload: result,
          total: result.length,
        });
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (error) {
    res.sendStatus(500);
  }
});

// QUESTIONS 26a
// Hiển thị tất cả các nhà cung cấp không bán được hàng

router.get('/26a', async (req, res, next) => {
  try {
    Product.aggregate()
      .lookup({
        from: 'orders',
        localField: '_id',
        foreignField: 'orderDetails.productId',
        as: 'orders',
      })
      .match({ orders: { $size: 0 } })
      .lookup({
        from: 'suppliers',
        localField: 'supplierId',
        foreignField: '_id',
        as: 'suppliers',
      })
      .project({
        _id: 0,
        suppliers: 1,
      })
      .unwind({
        path: '$suppliers',
        preserveNullAndEmptyArrays: true,
      })
      .project({
        _id: '$suppliers._id',
        name: '$suppliers.name',
        email: '$suppliers.email',
        phoneNumber: '$suppliers.phoneNumber',
        address: '$suppliers.address',
      })
      .group({
        _id: '$_id',
        name: { $first: '$name' },
        phoneNumber: { $first: '$phoneNumber' },
        email: { $first: '$email' },
        address: { $first: '$address' },
      })

      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (error) {
    res.sendStatus(500);
  }
});

// Hiển thị tất cả các nhà cung cấp không bán được hàng (cú pháp khác)

router.get('/26b', async (req, res, next) => {
  try {
    Product.aggregate()
      .lookup({
        from: 'orders',
        localField: '_id',
        foreignField: 'orderDetails.productId',
        as: 'orders',
      })
      .match({
        orders: { $size: 0 },
      })
      .lookup({
        from: 'suppliers',
        localField: 'supplierId',
        foreignField: '_id',
        as: 'suppliers',
      })
      .project({
        _id: 0,
        suppliers: 1,
      })
      .unwind({
        path: '$suppliers',
        preserveNullAndEmptyArrays: true,
      })
      .addFields({
        _id: '$suppliers._id',
        name: '$suppliers.name',
        email: '$suppliers.email',
        phoneNumber: '$suppliers.phoneNumber',
        address: '$suppliers.address',
      })
      .project({
        suppliers: 0,
      })
      .group({
        _id: '$_id',
        name: { $first: '$name' },
        phoneNumber: { $first: '$phoneNumber' },
        email: { $first: '$email' },
        address: { $first: '$address' },
      })

      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (error) {
    res.sendStatus(500);
  }
});

// QUESTIONS 26c http://localhost:9000/questions/26c?fromDate=2023-03-27&toDate=2023-03-29
// Hiển thị tất cả các nhà cung cấp không bán được trong khoảng từ ngày, đến ngày

router.get('/26c', async (req, res, next) => {
  try {
    let { fromDate, toDate } = req.query;
    fromDate = new Date(fromDate);

    const tmpToDate = new Date(toDate);
    toDate = new Date(tmpToDate.setDate(tmpToDate.getDate() + 1));

    Product.aggregate()
      .lookup({
        from: 'orders',
        localField: '_id',
        foreignField: 'orderDetails.productId',
        as: 'orders',
      })
      .unwind({
        path: '$orders',
        preserveNullAndEmptyArrays: true,
      })
      .match({
        $or: [
          {
            $and: [
              { orders: { $ne: null } },
              {
                $or: [
                  { 'orders.createdDate': { $lte: fromDate } },
                  { 'orders.createdDate': { $gte: toDate } },
                ],
              },
            ],
          },
          {
            orders: null,
          },
        ],
      })
      .lookup({
        from: 'suppliers',
        localField: 'supplierId',
        foreignField: '_id',
        as: 'suppliers',
      })
      .project({
        _id: 0,
        suppliers: 1,
      })
      .unwind({
        path: '$suppliers',
        preserveNullAndEmptyArrays: true,
      })
      .project({
        _id: '$suppliers._id',
        name: '$suppliers.name',
        email: '$suppliers.email',
        phoneNumber: '$suppliers.phoneNumber',
        address: '$suppliers.address',
      })
      .group({
        _id: '$_id',
        name: { $first: '$name' },
        phoneNumber: { $first: '$phoneNumber' },
        email: { $first: '$email' },
        address: { $first: '$address' },
      })

      .then((result) => {
        res.send({
          total: result.length,
          payload: result,
        });
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (error) {
    res.sendStatus(500);
  }
});

// QUESTIONS 26d
// Hiển thị tất cả các nhà cung cấp bán được hàng
router.get('/26b', async (req, res, next) => {
  try {
    Product.aggregate()
      .lookup({
        from: 'orders',
        localField: '_id',
        foreignField: 'orderDetails.productId',
        as: 'orders',
      })
      .addFields({
        orders: { $size: '$orders' },
      })
      .match({
        orders: { $gt: 0 },
      })
      .lookup({
        from: 'suppliers',
        localField: 'supplierId',
        foreignField: '_id',
        as: 'suppliers',
      })
      .project({
        _id: 0,
        suppliers: 1,
      })
      .unwind({
        path: '$suppliers',
        preserveNullAndEmptyArrays: true,
      })
      .project({
        _id: '$suppliers._id',
        name: '$suppliers.name',
        email: '$suppliers.email',
        phoneNumber: '$suppliers.phoneNumber',
        address: '$suppliers.address',
      })
      .group({
        _id: '$_id',
        name: { $first: '$name' },
        phoneNumber: { $first: '$phoneNumber' },
        email: { $first: '$email' },
        address: { $first: '$address' },
      })

      .then((result) => {
        res.send({
          total: result.length,
          payload: result,
        });
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (error) {
    res.sendStatus(500);
  }
});

// Hiển thị top 3 các nhân viên bán hàng với tổng số tiền bán được từ cao đến thấp trong khoảng từ ngày, đến ngày

router.get('/27', async (req, res, next) => {
  try {
    let { fromDate, toDate } = req.query;
    const query = getQueryDateTime(fromDate, toDate);

    const response = await Order.aggregate()
      .match(query)
      .lookup({
        from: 'employees',
        localField: 'employeeId',
        foreignField: '_id',
        as: 'employees',
      })
      .unwind('employees')
      .unwind('orderDetails')
      // .lookup({
      //   from: 'products',
      //   localField: 'orderDetails.productId',
      //   foreignField: '_id',
      //   as: 'orderDetails.products',
      // })
      // .unwind('orderDetails.products')
      .addFields({
        originalPrice: {
          $divide: [
            {
              $multiply: [
                '$orderDetails.price',
                { $subtract: [100, '$orderDetails.discount'] },
              ],
            },
            100,
          ],
        },
      })
      .group({
        _id: '$employees._id',
        firstName: { $first: '$employees.firstName' },
        lastName: { $first: '$employees.lastName' },
        email: { $first: '$employees.email' },
        phoneNumber: { $first: '$employees.phoneNumber' },
        address: { $first: '$employees.address' },
        birthday: { $first: '$employees.birthday' },
        totalSales: {
          $sum: { $multiply: ['$originalPrice', '$orderDetails.quantity'] },
        },
      })

      // Luôn trả về tất cả các nhân viên thỏa mãn với giá trị theo thứ tự sắp xếp
      .group({
        _id: '$totalSales',
        employees: { $push: '$$ROOT' },
      })
      .sort({ _id: -1 })
      .limit(3)
      .skip(0)

      // Luôn luôn trả về 3 kết quả
      // .sort({ totalSales: -1 })
      // .limit(3)
      // .skip(0)

    if (!response) return res.status(400).send({ message: 'Not found' });

    res.send(response);
  } catch (err) {
    res.sendStatus(500);
  }
});

// Hiển thị danh sách các mức giảm giá của các sản phẩm | đơn hàng

router.get('/29', async (req, res, next) => {
  try {
    const response = await Order.distinct("orderDetails.discount")

    if (!response) return res.status(400).send({ message: 'Not found' });

    res.send(response);
  } catch (err) {
    res.sendStatus(500);
  }
});

// Hiển thị tất cả danh mục (Categories) với tổng số tiền bán được trong mỗi danh mục

router.get('/30', async (req, res, next) => {
  try {
    const response = await Category.aggregate()
    .lookup({
      from: 'products',
      localField: '_id',
      foreignField: 'categoryId',
      as: 'products'
    })
    .unwind({
      path: '$products',
      preserveNullAndEmptyArrays: true,
    })
    .lookup({
      from: 'orders',
      localField: 'products._id',
      foreignField: 'orderDetails.productId',
      as: 'orders'
    })
    .unwind({
      path: '$orders',
      preserveNullAndEmptyArrays: true,
    })
    .unwind({
      path: '$orders.orderDetails',
      preserveNullAndEmptyArrays: true,
    })
    .addFields({
      originalPrice: {
        $divide: [
          {
            $multiply: [
              '$orders.orderDetails.price',
              { $subtract: [100, '$orders.orderDetails.discount'] },
            ],
          },
          100,
        ],
      },
      amount: '$orders.orderDetails.quantity',
    })
    .group({
      _id: '$_id',
      name: { $first: '$name' },
      description: { $first: '$description' },
      total: {
        $sum: { $multiply: ['$originalPrice', '$amount'] },
      },
    })

    if (!response) return res.status(400).send({ message: 'Not found' });

    res.send(response);
  } catch (err) {
    res.sendStatus(500);
  }
})

// Hiển thị tất cả đơn hàng có tổng số tiền bán hàng ít nhất trong khoảng từ ngày, đến ngày

router.get('/33', function (req, res, next) {
  try {
    let { fromDate, toDate } = req.query;
    const query = getQueryDateTime(fromDate, toDate);

    Order.aggregate([
      { $match: query },
      { $unwind: '$orderDetails' },
      {
        $addFields: {
          originalPrice: {
            $divide: [
              {
                $multiply: [
                  '$orderDetails.price',
                  { $subtract: [100, '$orderDetails.discount'] },
                ],
              },
              100,
            ],
          },
        },
      },
      {
        $group: {
          _id: '$_id',
          createdDate: { $first: '$createdDate' },
          shippedDate: { $first: '$shippedDate' },
          status: { $first: '$status' },
          shippingAddress: { $first: '$shippingAddress' },
          description: { $first: '$description' },
          total: {
            $sum: { $multiply: ['$originalPrice', '$orderDetails.quantity'] },
          },
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: '$total' },
        },
      },
      {
        $project: {
          _id: 0,
          avg: 1,
        },
      },

      // { $sort: { total: 1}},
      // { $limit: 1 },
      // { $skip: 0 }

      // { $group: {
      //   _id: '$total',
      //   orders: { $push: '$$ROOT' },
      // }},
      // { $project: {
      //   totalPrice: '$_id',
      //   _id: 0,
      //   orders: 1,
      // }}
    ])
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// router.get('/33', function (req, res, next) {
//   try {
//     let { fromDate, toDate } = req.query;

//     fromDate = new Date(fromDate);

//     const tmpToDate = new Date(toDate);
//     toDate = new Date(tmpToDate.setDate(tmpToDate.getDate() + 1));

//     const compareFromDate = { $gte: ['$createdDate', fromDate] };
//     const compareToDate = { $lt: ['$createdDate', toDate] };

//     const query = {
//       $expr: { $and: [compareFromDate, compareToDate] },
//     };

//     Order.aggregate()
//       .match(query)
//       .unwind('orderDetails')
//       .addFields({
//         originalPrice: {
//           $divide: [
//             {
//               $multiply: [
//                 '$orderDetails.price',
//                 { $subtract: [100, '$orderDetails.discount'] },
//               ],
//             },
//             100,
//           ],
//         },
//       })
//       .group({
//         _id: '$_id',
//         createdDate: { $first: '$createdDate' },
//         shippedDate: { $first: '$shippedDate' },
//         status: { $first: '$status' },
//         shippingAddress: { $first: '$shippingAddress' },
//         description: { $first: '$description' },
//         total: {
//           $sum: { $multiply: ['$originalPrice', '$orderDetails.quantity'] },
//         },
//       })
//       .group({
//         _id: '$total',
//         orders: { $push: '$$ROOT' },
//       })
//       .sort({ _id: 1 })
//       .limit(1)
//       .then((result) => {
//         res.send(result);
//       })
//       .catch((err) => {
//         res.status(400).send({ message: err.message });
//       });
//   } catch (err) {
//     res.sendStatus(500);
//   }
// });

// Hiển thị trung bình cộng giá trị các đơn hàng trong khoảng từ ngày, đến ngày

router.get('/34', function (req, res, next) {
  try {
    let { fromDate, toDate } = req.query;
    console.log('««««« fromDate »»»»»', fromDate);
    console.log('««««« toDate »»»»»', toDate);

    const query = getQueryDateTime(fromDate, toDate);

    Order.aggregate([
      { $match: query },
      { $unwind: '$orderDetails' },
      {
        $addFields: {
          originalPrice: {
            $divide: [
              {
                $multiply: [
                  '$orderDetails.price',
                  { $subtract: [100, '$orderDetails.discount'] },
                ],
              },
              100,
            ],
          },
        },
      },
      {
        $group: {
          _id: '$_id',
          createdDate: { $first: '$createdDate' },
          shippedDate: { $first: '$shippedDate' },
          status: { $first: '$status' },
          shippingAddress: { $first: '$shippingAddress' },
          description: { $first: '$description' },
          total: {
            $sum: { $multiply: ['$originalPrice', '$orderDetails.quantity'] },
          },
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: '$total' },
        },
      },
      {
        $project: {
          _id: 0,
          avg: 1,
        },
      },
    ])
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    console.log('««««« err »»»»»', err);
    res.sendStatus(500);
  }
});

router.get('/test', function (req, res) {
  const { text, text2 } = req;

  res.send('');
});

module.exports = router;
