// benötigte Imports
import * as dotenv from 'dotenv';
import { validationResult, matchedData } from 'express-validator';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

// Import der Models
import { Member, Password, Resettoken } from '../models/members.js';

import HttpError from '../models/http-error.js';

import { handleValidationErrors } from '../common/index.js';

import {
  sendFileToCloudinary,
  getGeolocation,
  getHash,
  deleteFile,
  checkHash,
  getToken,
  deleteFileInCloudinary,
  getGeoDistance,
} from '../common/index.js';

dotenv.config();

// TODO: user, pass in Umgebungsvariablen speichern
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'bridgette.pfeffer21@ethereal.email',
    pass: 'MUU1mH9R46XzPt2RD2',
  },
});

const FOLDER_NAME = 'lh2024';

// Resttoken-Gültigkeit: 5 Minuten
const RESETTOKEN_EXPIRATION_TIME = 1000 * 60 * 5;

const signup = async (req, res, next) => {
  let photo;
  try {
    // Daten validieren
    const result = validationResult(req);

    if (result.errors.length > 0) {
      // TODO: temporäres Foto löschen
      throw new HttpError(JSON.stringify(result.errors), 422);
    }

    const data = matchedData(req);

    // // ist ein Bild vorhanden?
    // if (!req.file) {
    //   throw new HttpError('Photo is missing', 422);
    // }

    // // Bild zu Cloudinary transferieren
    // const response = await sendFileToCloudinary(FOLDER_NAME, req.file.path);

    // photo = {
    //   cloudinaryPublicId: response.public_id,
    //   url: response.secure_url,
    // };

    // // Geodaten holen
    // const address = data.street + ', ' + data.zip + ' ' + data.city;
    // const geo = await getGeolocation(address);

    // Password generiert
    const password = getHash(data.password);

    let newMember;

    // neuen Member erschaffen
    const createdMember = new Member({
      //Spread-Opertor
      ...data,
      // geo,
      // photo,
    });

    // Member speichern und Password speichern in einer Transaktion
    const session = await mongoose.startSession();
    session.startTransaction();

    // Member speichern
    newMember = await createdMember.save({ session });

    const createdPassword = new Password({
      password,
      // Member-ID auslesen
      member: newMember._id,
    });

    // Passwort speichern
    await createdPassword.save({ session });

    // Bestätigen der Transaction
    await session.commitTransaction();

    // Daten des neuen Members an Client gesendet (ohne Passwort)
    res.json(newMember);
  } catch (error) {
    // TODO: temporäres Foto löschen
    if (photo) {
      deleteFile(req.file.path);
    }
    return next(new HttpError(error, 422));
  }
};

const login = async (req, res, next) => {
  try {
    // Daten validieren
    const result = validationResult(req);

    if (result.errors.length > 0) {
      throw new HttpError(JSON.stringify(result.errors), 422);
    }

    const data = matchedData(req);
    // Member suchen, wenn nicht vorhanden -> Abbruch mit Fehlermeldung
    const foundMember = await Member.findOne({
      $or: [{ username: data.username }, { email: data.username }],
    });

    if (!foundMember) {
      throw new HttpError('Cannot find member', 401);
    }

    // Passwort holen
    const foundPassword = await Password.findOne({
      member: foundMember._id,
    });

    // Hash mit Klartext-Passwort vergleichen
    // wenn keine Überstimmung -> Abbruch mit Fehlermeldung
    if (!checkHash(data.password, foundPassword.password)) {
      throw new HttpError('Wrong username / email or password', 401);
    }

    // Token generieren mit ID des Members als Inhalt
    const token = getToken(foundMember._id);

    // JWT-Token an Client senden
    res.send(token);
  } catch (error) {
    // if (error instanceof HttpError) {
    //   return next(error);
    // }
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const changePassword = async (req, res, next) => {
  try {
    // Daten validieren
    const result = validationResult(req);

    if (result.errors.length > 0) {
      throw new HttpError(JSON.stringify(result.errors), 422);
    }

    const data = matchedData(req);

    // Member suchen, wenn nicht vorhanden -> Abbruch mit Fehlermeldung
    const foundMember = await Member.findById(req.verifiedMember._id);

    if (!foundMember) {
      throw new HttpError('Cannot change password', 401);
    }

    // Passwort holen
    const foundPassword = await Password.findOne({
      member: foundMember._id,
    });

    // Hash mit Klartext-Passwort vergleichen
    // wenn keine Überstimmung -> Abbruch mit Fehlermeldung
    if (!checkHash(data.oldPassword, foundPassword.password)) {
      throw new HttpError('Cannot change password', 401);
    }

    // neues Passwort generieren und speichern
    // Password generiert
    foundPassword.password = getHash(data.newPassword);
    await foundPassword.save();

    // JWT-Token an Client senden
    res.send('Password changed successfully');
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const deleteMember = async (req, res, next) => {
  try {
    // Sicherheitsprüfung: ist die ID des angemeldeten Members gleich der übermittelten ID?
    // wenn nein, Abbruch
    if (!req.verifiedMember.isAdmin) {
      if (req.verifiedMember._id.toString() !== req.params.id) {
        throw new HttpError('Cant delete member', 403);
      }
    }

    // Member suchen und gleichzeitig löschen, wenn nicht vorhanden -> Fehlermeldung ausgeben
    const deletedMember = await Member.findOneAndDelete({ _id: req.params.id });
    // console.log('was ist deletedMember?', deletedMember);

    if (!deletedMember) {
      throw new HttpError('Member was not found', 404);
    }

    // Erfolgsmeldung rausschicken
    res.send('Member was deleted successfully');
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const getAllMembers = async (req, res, next) => {
  console.log(req.verifiedMember);
  try {
    // mit leerem Objekt bekommen wir alle Members
    const membersList = await Member.find({})
      // Liste aller Members in JSON-Format an Client senden
    res.json(membersList);
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const getOneMember = async (req, res, next) => {
  try {
    // einen Member suchen über die ID
    const member = await Member.findById(req.params.id);

    if (!member) {
      throw new HttpError('Cannot find member', 404);
    }

    // Members als Objekt in JSON-Format an Client senden
    res.json(member);
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};
const filterMember = async (req, res, next) => {
  const { q } = req.query;
  // if(!q) {
  //   throw new HttpError('query is required', 418);
  // }

  try {
    const users = await Member.find({
      username: { $regex: q, $options: 'i' },
    });

    res.json(users);
  } catch (err) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const updateMember = async (req, res, next) => {
  try {
    // Sicherheitsprüfung: Member kann sich nur selbst wollen
    const { id } = req.params;

    if (!req.verifiedMember.isAdmin) {
      if (req.verifiedMember._id.toString() !== id) {
        throw new HttpError('Cant update member', 403);
      }
    }

    // Feldprüfungen Ergebnis checken
    const result = validationResult(req);

    if (result.errors.length > 0) {
      throw new HttpError(JSON.stringify(result.errors), 422);
    }

    const data = matchedData(req);

    // gibt es den Member überhaupt? Wenn nein, Abbruch
    const foundMember = await Member.findById(id);

    if (!foundMember) {
      throw new HttpError('Member cannot be found', 404);
    }

    // Es werden nur die Felder geändert, die über die Schnittstelle kommen
    Object.assign(foundMember, data);

    // wenn ein Bild kommt:
    if (req.file) {
      // Neues Bild in Cloudinary speichern
      const response = await sendFileToCloudinary(FOLDER_NAME, req.file.path);

      // Cloudinary Bild löschen
      await deleteFileInCloudinary(foundMember.photo.cloudinaryPublicId);

      const photo = {
        cloudinaryPublicId: response.public_id,
        url: response.secure_url,
      };

      foundMember.photo = photo;
    }

    // nur wenn Zip, Street oder City kommt, dann Geodaten neu holen
    if (data.zip || data.street || data.city) {
      const address = data.street + ', ' + data.zip + ' ' + data.city;
      const geo = await getGeolocation(address);
      foundMember.geo = geo;
    }

    // Member speichern
    const updatedMember = await foundMember.save();

    // geänderten Daten rausschicken
    res.json(updatedMember);
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const getDistances = async (req, res, next) => {
  try {
    // gewünschten Member suchen, wenn nicht vorhanden -> Abbruch mit Fehler
    // gibt es den Member überhaupt? Wenn nein, Abbruch
    const { id } = req.params;
    const foundMember = await Member.findById(id);

    if (!foundMember) {
      throw new HttpError('Member cannot be found', 404);
    }

    const otherMembers = await Member.find({ _id: { $ne: id } });

    // alle Member außer mir suchen -> Array
    // Array durchlaufen und für jeden anderen Member die Entfernung kalkulieren
    const calculatesMembers = otherMembers.map((member) => {
      return {
        ...member.toObject(),
        distance: getGeoDistance(
          foundMember.geo.lat,
          foundMember.geo.lon,
          member.geo.lat,
          member.geo.lon
        ),
      };
    });
    // Array ausgeben
    res.json(calculatesMembers);
  } catch (error) {
    return next(
      new HttpError(error, error.errorCode || 500, error.messageArray)
    );
  }
};

const resetPassword = async (req, res, next) => {
  try {
    // gibts es den Member? Wenn nein -> Abbruch mit Fehler
    const { login } = req.body;
    const foundMember = await Member.findOne({
      $or: [{ username: login }, { email: login }],
    });

    if (!foundMember) {
      throw new HttpError('Cannot find member', 404);
    }

    // alle bestehenden Reset-Tokens dieses Members löschen
    await Resettoken.deleteMany({ member: foundMember._id });

    // Token erzeugen mit UUID
    const token = uuidv4();

    // Reset Token mit Zeitangabe speichern
    const newResettoken = new Resettoken({ token, member: foundMember._id });
    await newResettoken.save();

    // Email produzieren (Text mit Link) und raussenden an Email-Adresse
    const link = `http://${req.hostname}:${
      process.env.port || 80
    }/set-new-password?t=${token}`;
    const html = `
    <p>Lieber ${foundMember.firstName} ${foundMember.lastName}!</p>
    <p>Mittels nachfolgendem Link können Sie ein neues Passwort setzen!</p>
    <a href="${link}">Link für Password resetten</a>
    <br /><br />
    <p>Liebe Grüße, dein Admin.</p>
  `;

    const text = `
  Lieber ${foundMember.firstName} ${foundMember.lastName}!

  Mittels nachfolgendem Link können Sie ein neues Passwort setzen!

  ${link}

  Liebe Grüße, dein Admin.
  `;

    await transporter.sendMail({
      from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
      to: 'bar@example.com, baz@example.com', // list of receivers
      subject: 'Kennwort zurücksetzen', // Subject line
      text, // plain text body
      html, // html body
    });

    // Erfolgsmeldung rausschicken
    res.send('Mail was sent successfully');
  } catch (error) {
    return next(
      new HttpError(error, error.errorCode || 500, error.messageArray)
    );
  }
};

const setNewPassword = async (req, res, next) => {
  try {
    // Express Validator Überprüfung checken
    const result = validationResult(req);

    if (result.errors.length > 0) {
      const errors = result.array();
      throw handleValidationErrors(errors);
    }

    const data = matchedData(req);

    // Token aus dem Header auslesen
    const { password, 'reset-token': token } = data;

    // Token in Resettoken suchen, wenn nicht vorhanden oder abgelaufen -> Abbruch
    const foundResettoken = await Resettoken.findOne({ token });

    if (!foundResettoken) {
      throw new HttpError('Cannot find reset information', 404);
    }

    const createdAt = new Date(foundResettoken.createdAt);
    const now = new Date();
    const diff = now - createdAt;

    if (diff > RESETTOKEN_EXPIRATION_TIME) {
      throw new HttpError('Expiration time has expired', 409);
    }

    // Member überprüfen auf Vorhandensein
    const foundMember = await Member.findById(foundResettoken.member);

    if (!foundMember) {
      throw new HttpError('Cannot find member', 404);
    }

    // Passwort-hash erstellen
    const newPassword = getHash(password);

    // Altes Passwort suchen, mit neuem überschreiben, speichern
    await Password.findOneAndUpdate(
      { member: foundResettoken.member },
      { password: newPassword }
    );

    // alle bestehenden Reset-Tokens dieses Members löschen
    await Resettoken.deleteMany({ member: foundResettoken.member });

    // Erfolgsmeldung rausschicken
    res.send('New Password was set successfully');
  } catch (error) {
    return next(
      new HttpError(error, error.errorCode || 500, error.messageArray)
    );
  }
};

export {
  signup,
  login,
  getAllMembers,
  getOneMember,
  changePassword,
  deleteMember,
  updateMember,
  getDistances,
  resetPassword,
  setNewPassword,
  filterMember,
};
