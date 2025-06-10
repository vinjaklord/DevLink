import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';

import HttpError from './models/http-error.js';

import router from './routes/router.js';

import { errorHandler } from './common/index.js';

dotenv.config();

const PORT = process.env.PORT || 8000;
const CONNECTION_STRING = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@lh-remake.johjfoh.mongodb.net/`;

// console.log(CONNECTION_STRING);
const app = express();

// Middlewares
app.use(cors());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
    },
  })
);

// Form body parser
app.use(express.urlencoded({ extended: true }));

// JSON parser
app.use(express.json());

// Statische Websites ausgeben
app.use(express.static('www'));
app.use('/axios', express.static('node_modules/axios/dist'));

// app.get('/', (req, res) => {
//   res.send('There are no Easter Eggs up here. Go away.');
// });

// alle anderen Routen
app.use('/', router);

// Fehler erzeugen, wenn die Route nicht gefunden wird
app.use((req) => {
  throw new HttpError('Could not found route: ' + req.originalUrl, 404);
});

app.use(errorHandler);

// Zentrale Fehlerbehandlung, wenn erster Parameter ein Fehlerobjekt ist
app.use((error, req, res, next) => {
  // wenn bereits ein Header gesetzt wurde, keinen Response senden sondern
  // einfach in die nächste Middleware weiterschalten (next)
  if (res.headerSent) {
    return next(error);
  }

  const { errorCode, message } = error;
  res.status(errorCode).json({ message });
});

// Verbindung MongoDB aufbauen
mongoose
  .connect(CONNECTION_STRING)
  .then(() => {
    // Server starten
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log('Verbindung zu MongoDB nicht möglich', error);
  });
