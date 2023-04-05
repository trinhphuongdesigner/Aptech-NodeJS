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
  insertDocuments,
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
});

router.post('/upload-single', (req, res) =>
  upload.single('file')(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        res.status(500).json({ type: 'MulterError', err: err });
      } else if (err) {
        res.status(500).json({ type: 'UnknownError', err: err });
      } else {
        const imageUrl = `/uploads/media/${req.file.filename}`;
        const name = req.file.filename;

        const response = await insertDocument(
          { location: imageUrl, name },
          'Media',
        );
        res.status(200).json({ ok: true, payload: response });
      }
    } catch (error) {
      res.status(500).json({ ok: false, error });
    }
  }),
);

router.post('/upload-multiple', (req, res) =>
  upload.array('files', 3)(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        res.status(500).json({ type: 'MulterError', err: err });
      } else if (err) {
        res.status(500).json({ type: 'UnknownError', err: err });
      } else {
        const files = req.files;

        const dataInsert = files.reduce((prev, nextP) => {
          prev.push({ name: nextP.filename, location: nextP.path });
          return prev;
        }, []);

        const response = await insertDocuments(dataInsert, 'Media');

        res.status(200).json({ ok: true, payload: response });
      }
    } catch (error) {
      res.status(500).json({ ok: false, error });
    }
  }),
);

router.get('/media/:id', async (req, res, next) => {
  const { id } = req.params;

  const found = await findDocument(id, 'Media');
  if (!found) {
    return res
      .status(410)
      .json({ message: `${collectionName} with id ${id} not found` });
  }

  res.status(200).json({ ok: true, payload: found });
});

router.post('/media/update/:id', async (req, res) => {
  const { id } = req.params;

  const found = await findDocument(id, 'Media');
  if (!found) res.status(410).json({ message: `${collectionName} with id ${id} not found` });

  upload.single('file')(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        res.status(500).json({ type: 'MulterError', err: err });
      } else if (err) {
        res.status(500).json({ type: 'UnknownError', err: err });
      } else {
        const imageUrl = `/uploads/media/${req.file.filename}`;
        const name = req.file.filename;

        const response = await updateDocument(
          { _id: id },
          {
            location: imageUrl,
            name,
          },
          'Media',
        );

        res.status(200).json({ ok: true, payload: response });
      }
    } catch (error) {
      res.status(500).json({ ok: false, error });
    }
  });
});

module.exports = router;
