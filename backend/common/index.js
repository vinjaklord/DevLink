import * as dotenv from 'dotenv';
import fs from 'fs';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import HttpError from '../models/http-error.js';

const SALT_ROUNDS = 10;

dotenv.config();

const getHash = (plainText) => {
  const hash = bcrypt.hashSync(plainText, SALT_ROUNDS);

  return hash;
};

const checkHash = (plainText, hashText) => {
  return bcrypt.compareSync(plainText, hashText);
};

const deleteFile = (path) => {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};

const getToken = (id) => {
  const token = jwt.sign(
    {
      id,
    },
    process.env.JWT_KEY,
    { expiresIn: '7d' },
  );

  return token;
};

const handleValidationErrors = (errors) => {
  const uniqueErrorsPath = [];
  const addedPaths = new Set();
  let error;

  errors.forEach((error) => {
    if (!error.from) {
      if (!addedPaths.has(error.path)) {
        uniqueErrorsPath.push({
          path: error.path,
          msg: error.msg,
        });
        addedPaths.add(error.path);
      }
    }
  });

  error = new HttpError('Validation Error', 400, uniqueErrorsPath);

  return error;
};

const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    const errorResponse = err.toJSON();
    res.status(err.errorCode).json(errorResponse);
  } else {
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

export { getHash, deleteFile, checkHash, getToken, handleValidationErrors, errorHandler };
