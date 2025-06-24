import * as dotenv from 'dotenv';
import multer from 'multer';
import jwt from 'jsonwebtoken';

import HttpError from '../models/http-error.js';

import { Member } from '../models/members.js';

dotenv.config();

// Middleware multer erzeugen
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './uploads');
//   },
//   filename: (req, file, cb) => {
// const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
// cb(null, file.fieldname + '-' + uniqueSuffix);
//     const extArray = file.mimetype.split('/');
//     const extension = extArray[extArray.length - 1];
//     cb(null, file.fieldname + '-' + Date.now() + '.' + extension);
//   },
// });

const storage = multer.memoryStorage(); //Store the file in memory buffer

const limits = {
  fileSize: 1024 * 1024 * 5, // max. 5 MB
};

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/gif' ||
    file.mimetype === 'image/svg'
  ) {
    return cb(null, true);
  }

  cb(null, false);
};

const upload = multer({ storage, limits, fileFilter });

// Middleware für Tokenüberprüfung
const checkToken = async (req, res, next) => {
  // Http Methode OPTIONS durchlassen
  if (req.method === 'OPTONS') {
    return next();
  }

  try {
    // Header prüfen ob ein Authorization Token kommt
    const { authorization } = req.headers;

    if (!authorization) {
      throw new HttpError('Invalid token', 401);
    }

    const token = authorization.split(' ')[1];
    // console.log('token', token);

    // Token überprüfen (ist er abgelaufen? Kommt eine ID mit)
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    // console.log('decoded', decoded);

    const { id } = decoded;

    const member = await Member.findById(id);

    if (!member) {
      throw new HttpError('Invalid token!', 401);
    }

    // Request um den Eintrag verifiedMember erweitern
    req.verifiedMember = member;

    //nur weiterschalten, wenn alles ok ist
    next();
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

export { upload, checkToken };
