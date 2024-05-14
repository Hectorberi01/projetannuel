import express, { Request, Response} from "express";
//import multer, { diskStorage, StorageEngine } from 'multer';
//const multer = require('multer');
import multer from 'multer';
import path from 'path';
// Définition des types MIME avec une correspondance d'extensions de fichier
const MIME_TYPES: { [key: string]: string } = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};


console.log("beri");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const imagesPath = path.join(__dirname, '..', 'images');
        cb(null, imagesPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        console.log("Hector")
    }
}); 
export const upload = multer({ storage: storage });

// Configuration de stockage pour multer
// const storage: StorageEngine = diskStorage({
//   destination: (req: Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) => {
//     callback(null,'../images/uploads');
//   },
//   filename: (req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {
//     const extension = MIME_TYPES[file.mimetype];
//     const name = file.originalname.split(' ').join('_').replace(new RegExp(`.${extension}$`), '');
//     console.log("Rivaldo")
//     callback(null, `${name}${Date.now()}.${extension}`);
//   }
// });

// module.exports = multer({ storage: storage });

