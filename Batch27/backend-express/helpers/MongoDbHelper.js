'use strict';
const { CONNECTION_STRING, DATABASE_NAME } = require('../constants/dbSettings');
// Khai báo thư viện MongoClient
const { MongoClient, ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const path = require('path')

// INSERT: Thêm mới (một)
// insertDocument({ name: 'Peter', email: 'peter@gmail.com' }, 'employees').then((result) => {}).catch(err => {});

function insertDocument(data, collectionName) {
  return new Promise((resolve, reject) => {
    mongoose.model(collectionName)
      .create(data)
      .then((result) => {
        resolve({ data: data, result: result });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// function insertDocument(data, collectionName) {
//   return new Promise((resolve, reject) => {
//     MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
//       .then((client) => {
//         const dbo = client.db(DATABASE_NAME);
//         const collection = dbo.collection(collectionName);
//         collection
//           .insertOne(data)
//           .then((result) => {
//             client.close();
//             resolve({ data: data, result: result });
//           })
//           .catch((err) => {
//             client.close();
//             reject(err);
//           });
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
// }

// ----------------------------------------------------------------------------
// INSERT: Thêm mới (nhiều)
function insertDocuments(list, collectionName) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
      .then((client) => {
        const dbo = client.db(DATABASE_NAME);
        const collection = dbo.collection(collectionName);
        collection
          .insertMany(list)
          .then((result) => {
            client.close();
            resolve(result);
          })
          .catch((err) => {
            client.close();
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// ----------------------------------------------------------------------------
// UPDATE: Sửa
function updateDocument(id, data, collectionName) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
      .then((client) => {
        const dbo = client.db(DATABASE_NAME);
        const collection = dbo.collection(collectionName);
        const query = { _id: ObjectId(id) };
        collection
          .findOneAndUpdate(query, { $set: data })
          .then((result) => {
            client.close();
            resolve(result);
          })
          .catch((err) => {
            client.close();
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// ----------------------------------------------------------------------------
// UPDATE: Sửa (nhiều)
function updateDocuments(query, data, collectionName) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
      .then((client) => {
        const dbo = client.db(DATABASE_NAME);
        const collection = dbo.collection(collectionName);
        collection
          .updateMany(query, { $set: data })
          .then((result) => {
            client.close();
            resolve(result);
          })
          .catch((err) => {
            client.close();
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// ----------------------------------------------------------------------------
// REMOVE: Xoá
function deleteDocument(id, collectionName) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
      .then((client) => {
        const dbo = client.db(DATABASE_NAME);
        const collection = dbo.collection(collectionName);
        const query = { _id: ObjectId(id) };
        collection
          .deleteOne(query)
          .then((result) => {
            client.close();
            resolve(result);
          })
          .catch((err) => {
            client.close();
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// ----------------------------------------------------------------------------
// REMOVE: Xoá (nhiều)
function deleteDocuments(query, collectionName) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
      .then((client) => {
        const dbo = client.db(DATABASE_NAME);
        const collection = dbo.collection(collectionName);
        collection
          .deleteMany(query)
          .then((result) => {
            client.close();
            resolve(result);
          })
          .catch((err) => {
            client.close();
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}
// ----------------------------------------------------------------------------
// FIND: Tìm kiếm (id)
function findDocument(id ,collectionName) {
  return new Promise((resolve, reject) => {
    const collection = mongoose.model(collectionName);
    const query = { _id: id };
    collection
      .findOne(query)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
// ----------------------------------------------------------------------------
// FIND: Tìm kiếm (nhiều)
function findDocuments({ query = null, sort = null, limit = 50, aggregate = [], skip = 0, projection = null }, collectionName) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
      .then((client) => {
        const dbo = client.db(DATABASE_NAME);
        const collection = dbo.collection(collectionName);
        let cursor = collection;
        if (query) {
          cursor = cursor.find(query);
        } else {
          cursor = cursor.aggregate(aggregate);
        }

        if (sort) {
          cursor = cursor.sort(sort);
        }
        cursor.limit(limit).skip(skip);

        if (projection) {
          cursor = cursor.project(projection);
        }

        cursor
          .toArray()
          .then((result) => {
            client.close();
            resolve(result);
          })
          .catch((err) => {
            console.log(err);
            client.close();
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function toSafeFileName(fileName) {
  const fileInfo = path.parse(fileName);
  const safeFileName = fileInfo.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() + fileInfo.ext;
  return `${Date.now()}-${safeFileName}`;
}

module.exports = { insertDocument, insertDocuments, updateDocument, updateDocuments, deleteDocument, deleteDocuments, findDocument, findDocuments, toSafeFileName };
