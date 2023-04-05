const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
// MULTER UPLOAD
const multer = require('multer');
const {
  updateDocument,
  findDocument,
  toSafeFileName,
  insertDocument,
} = require('../helpers/MongoDbHelper');
const { isValidObjectId } = require('mongoose');

const UPLOAD_DIRECTORY = './public/uploads';

const upload = multer({
  storage: multer.diskStorage({
    contentType: multer.AUTO_CONTENT_TYPE,
    destination: function (req, file, callback) {
      // const { id, collectionName } = req.params;

      const PATH = `${UPLOAD_DIRECTORY}/media/${file.fieldname}`;
      // console.log('PATH', PATH);
      if (!fs.existsSync(PATH)) {
        // Create a directory
        fs.mkdirSync(PATH, { recursive: true });
      }
      callback(null, PATH);
    },
    filename: function (req, file, callback) {
      const safeFileName = toSafeFileName(file.originalname);
      callback(null, safeFileName);
    },
  }),
}).single('file');

router.post('/create', async (req, res, next) =>
upload(req, res, async (err) => {
  if (err instanceof multer.MulterError) {
    res.status(500).json({ type: 'MulterError', err: err });
  } else if (err) {
    res.status(500).json({ type: 'UnknownError', err: err });
  } else {
    const imageUrl = `/uploads/media/${req.file.filename}`;
    const name = req.file.filename;

    const result = await insertDocument({ location: imageUrl, name}, 'Media')
    res.status(200).json({ ok: true, });
  }
})
);

// http://127.0.0.1:9000/upload/media/63293fea50d2f78624e0c6f3/image
router.post('/:collectionName/:id/image', async (req, res, next) => {
  const { collectionName, id } = req.params;

  const found = await findDocument(id, collectionName);
  if (!found) {
    return res
      .status(410)
      .json({ message: `${collectionName} with id ${id} not found` });
  }

  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      res.status(500).json({ type: 'MulterError', err: err });
    } else if (err) {
      res.status(500).json({ type: 'UnknownError', err: err });
    } else {
      // UPDATE MONGODB
      updateDocument(
        id,
        { imageUrl: `/uploads/${collectionName}/${id}/${req.file.filename}` },
        collectionName,
      );
      //
      // console.log('host', req.get('host'));
      const publicUrl = `${req.protocol}://${req.get(
        'host',
      )}/uploads/${collectionName}/${id}/${req.file.filename}`;
      res.status(200).json({ ok: true, publicUrl: publicUrl });
    }
  });
});

// http://127.0.0.1:9000/upload/media/63293fea50d2f78624e0c6f3/images
// router.post('/:collectionName/:id/images', async (req, res, next) => {
//   const { collectionName, id } = req.params;

//   const found = await findDocument(id, collectionName);
//   if (!found) {
//     return res.status(410).json({ message: `${collectionName} with id ${id} not found` });
//   }

//   upload(req, res, async (err) => {
//     if (err instanceof multer.MulterError) {
//       res.status(500).json({ type: 'MulterError', err: err });
//     } else if (err) {
//       res.status(500).json({ type: 'UnknownError', err: err });
//     } else {
//       // UPDATE MONGODB
//       const newImageUrl = `/uploads/${collectionName}/${id}/${req.file.filename}`;

//       let images = found.images;
//       if (!images) {
//         images = [];
//       }
//       images.push(newImageUrl);

//       await updateDocument(id, { images: images }, collectionName);

//       // console.log('host', req.get('host'));
//       const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${collectionName}/${id}/${req.file.filename}`;
//       res.status(200).json({ ok: true, publicUrl: publicUrl });
//     }
//   });
// });

module.exports = router;
