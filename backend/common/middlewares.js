import * as dotenv from 'dotenv';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import HttpError from '../models/http-error.js';
import NewsAPI from 'newsapi';
import cron from 'node-cron';
import { News } from '../models/news.js';

const newsapi = new NewsAPI('127492f7631c44d6b2347add9a84f6c0');
import { Member } from '../models/members.js';

dotenv.config();

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

async function scheduleNews() {
  cron.schedule('0 * * * *', async () => {
    try {
      const response = await newsapi.v2.everything({
        q: 'javascript',
        language: 'en',
        sortBy: 'publishedAt',
        sources:
          'bbc-news,bbc-sport,cnn,reuters,engadget,techcrunch,the-verge,wired,the-wall-street-journal,the-washington-post,fortune,business-insider,ars-technica,associated-press,bloomberg,nbc-news,independent,abc-news,fox-news,al-jazeera-english',
      });

      const limitedArticles = response.articles.slice(0, 100);

      await News.deleteMany({});
      await News.insertMany(limitedArticles, { ordered: false });

      console.log('News updated successfully at', new Date().toISOString());
    } catch (error) {
      console.error('Error fetching API data | ', error.message);
    }
  });
}

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

export { upload, checkToken, scheduleNews };
