import multer from "multer";
import path from 'path';

const MIME_TYPES: { [key: string]: string } = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Définir une interface pour le type de fichier de Multer
interface MulterFile {
  mimetype: string;
  originalname: string;
}

const storage = multer.diskStorage({
  destination: (req, file: Express.Multer.File, callback) => {
    const imagesPath = path.join('src', 'images');
    callback(null, imagesPath);
  },
  filename: (req, file: MulterFile, callback) => {
    const extension = MIME_TYPES[file.mimetype];
    const name = file.originalname.split(' ').join('_').replace(`.${extension}`, '');
    callback(null, name + Date.now() + '.' + extension);
  }
});

export const upload = multer({ storage: storage });
