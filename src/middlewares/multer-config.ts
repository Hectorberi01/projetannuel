import multer from 'multer';
import path from 'path';
import fs from 'fs';

const MIME_TYPES: { [key: string]: string } = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const imagesPath = path.join(__dirname, '../../src/documents');
    // Check if the directory exists, if not, create it
    if (!fs.existsSync(imagesPath)) {
      fs.mkdirSync(imagesPath, { recursive: true });
    }
    callback(null, imagesPath);
  },
  filename: (req, file, callback) => {
    const extension = MIME_TYPES[file.mimetype];
    const name = file.originalname.split(' ').join('_').replace(`.${extension}`, '');
    callback(null, name + Date.now() + '.' + extension);
  }
});

export const upload = multer({ storage: storage });