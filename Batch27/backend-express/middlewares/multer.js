const multer = require('multer');
const { updateDocument, findDocument } = require('../helpers/MongoDbHelper');

const UPLOAD_DIRECTORY = './public/uploads';

var upload = multer({
  storage: multer.diskStorage({
    contentType: multer.AUTO_CONTENT_TYPE,
    destination: function (req, file, callback) {
      const { id, collectionName } = req.params;

      const PATH = `${UPLOAD_DIRECTORY}/${collectionName}/${id}`;
      // console.log('PATH', PATH);
      if (!fs.existsSync(PATH)) {
        // Create a directory
        fs.mkdirSync(PATH, { recursive: true });
      }
      callback(null, PATH);
    },
    filename: function (req, file, callback) {
      // Xử lý tên file cho chuẩn
      const safeFileName = toSafeFileName(file.originalname);
      // return
      callback(null, safeFileName);
    },
  }),
}).single('file');