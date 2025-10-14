import * as dotenv from 'dotenv';
import { validationResult, matchedData } from 'express-validator';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { uploadImage, deleteFileInImageKit } from '../utils/imageKit.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Member, Password, Resettoken } from '../models/members.js';

import HttpError from '../models/http-error.js';

import { handleValidationErrors } from '../common/index.js';

import { getHash, deleteFile, checkHash, getToken, getGeoDistance } from '../common/index.js';

///////////////////////////////////////////////////////////////////////////////////////

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesDir = path.join(__dirname, '..', 'utils', 'email_templates');

dotenv.config();

// TODO: user, pass in Umgebungsvariablen speichern
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

// Resttoken-Gültigkeit: 5 Minuten
const RESETTOKEN_EXPIRATION_TIME = 1000 * 60 * 5;

const signup = async (req, res, next) => {
  let photo;
  try {
    // Daten validieren
    const result = validationResult(req);

    if (result.errors.length > 0) {
      throw new HttpError(JSON.stringify(result.errors), 422);
    }

    const data = matchedData(req);

    // Password generiert
    const password = getHash(data.password);

    let newMember;

    // neuen Member erschaffen (photo is optional, defaults to model pre-save hook if not provided)
    const createdMember = new Member({
      ...data,
      photo: req.file
        ? {
            fileId: (await uploadImage(req.file.buffer, req.file.originalname)).fileId,
            url: (await uploadImage(req.file.buffer, req.file.originalname)).url,
          }
        : {},
    });

    // Member speichern und Password speichern in einer Transaktion
    const session = await mongoose.startSession();
    session.startTransaction();

    // Member speichern
    newMember = await createdMember.save({ session });

    const createdPassword = new Password({
      password,
      member: newMember._id,
    });

    await createdPassword.save({ session });

    await session.commitTransaction();

    session.endSession();
    const link = process.env.FRONTEND_URL;

    const signupHtmlTemplate = path.join(templatesDir, 'signup.html');
    const signupTextTemplate = path.join(templatesDir, 'signup.txt');

    let signupHtml = fs.readFileSync(signupHtmlTemplate, 'utf-8');
    let signupText = fs.readFileSync(signupTextTemplate, 'utf-8');

    signupHtml = signupHtml.replace(
      '[FIRST_NAME] [LAST_NAME]',
      `${req.body.firstName} ${req.body.lastName}`
    );
    signupText = signupText
      .replace('[FIRST_NAME]', req.body.lastName)
      .replace('[LAST_NAME]', req.body.firstName)
      .replace('[LINK]', link);

    await transporter.sendMail({
      from: 'noreply.env <noreply.envv@gmail.com>', // sender address
      to: `aronpozsar@gmail.com`, // list of receivers
      subject: `Welcome, ${req.body.firstName}!`, // Subject line
      text: signupText, // plain text body
      html: signupHtml, // html body
    });

    res.status(201).json(newMember);
  } catch (error) {
    if (photo) {
      deleteFile(photo);
    }
    if (error.code === 11000) {
      const value = Object.keys(error.keyValue)[0];
      let message = '';
      if (value === 'username') {
        message = 'This username is already taken.';
      } else if (value === 'email') {
        message = 'This email is already registered.';
      }
      return next(new HttpError(message, 409));
    }

    return next(new HttpError(error.message || error, 422));
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
      throw new HttpError('Invalid Credentials ', 401);
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
    const membersList = await Member.find({});
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

const getMemberByUsername = async (req, res, next) => {
  try {
    const username = req.params.username;
    const member = await Member.findOne({ username });

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
  const member = req.verifiedMember._id;
  console.log('Verified member:', req.verifiedMember);
  // if(!q) {
  //   throw new HttpError('query is required', 418);
  // }

  try {
    //Maybe index this stuff next time
    const users = await Member.find({
      $and: [
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } },
          ],
        },
        { _id: { $ne: member } }, // exclude logged-in user
      ],
    })
      .select('username firstName lastName photo')
      .limit(5)
      .lean();

    res.json(users);
  } catch (err) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const updateMember = async (req, res, next) => {
  try {
    // Sicherheitsprüfung: Member kann sich nur selbst wollen
    const { id } = req.params;

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
      // Neues Bild in ImageKit speichern
      const uploadResponse = await uploadImage(req.file.buffer, req.file.originalname);

      // ImageKit Bild löschen (using fileId instead of cloudinaryPublicId)
      if (foundMember.photo && foundMember.photo.fileId) {
        await deleteFileInImageKit(foundMember.photo.fileId); // Replace with your ImageKit delete function
      }

      const photo = {
        fileId: uploadResponse.fileId,
        url: uploadResponse.url,
      };

      foundMember.photo = photo;
    }

    // Member speichern
    const updatedMember = await foundMember.save();

    // geänderten Daten rausschicken
    res.json(updatedMember);
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const resetPassword = async (req, res, next) => {
  try {
    // gibts es den Member? Wenn nein -> Abbruch mit Fehler
    const { email } = req.body;
    console.log('Incoming body:', req.body);

    const foundMember = await Member.findOne({ email });
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
    const link = `${process.env.FRONTEND_URL}/set-new-password?t=${token}`;

    const ResetPasswordHtmlTemplate = path.join(templatesDir, 'reset-password.html');
    const ResetPasswordTextTemplate = path.join(templatesDir, 'reset-password.txt');

    let ResetPasswordHtml = fs.readFileSync(ResetPasswordHtmlTemplate, 'utf-8');
    let ResetPasswordText = fs.readFileSync(ResetPasswordTextTemplate, 'utf-8');

    ResetPasswordHtml = ResetPasswordHtml.replace(
      '[FIRST_NAME] [LAST_NAME]',
      `${foundMember.firstName} ${foundMember.lastName}`
    );
    ResetPasswordText = ResetPasswordText.replace('[FIRST_NAME]', foundMember.lastName)
      .replace('[LAST_NAME]', foundMember.firstName)
      .replace('[LINK]', link);

    await transporter.sendMail({
      from: 'DevLink <noreply.envv@gmail.com>', // sender address
      to: 'aronpozsar@gmail.com', // list of receivers
      subject: 'Password Reset', // Subject line
      text: ResetPasswordText, // plain text body
      html: ResetPasswordHtml, // html body
    });

    // Erfolgsmeldung rausschicken
    res.send('Mail was sent successfully');
  } catch (error) {
    const status = error.errorCode || error.statusCode || 500;
    return res.status(status).json({ message: error.message || 'Internal Server Error' });
  }
};

const setNewPassword = async (req, res, next) => {
  try {
    // 1. Express Validator check (only for the password now)
    const result = validationResult(req);

    if (result.errors.length > 0) {
      const errors = result.array();
      throw handleValidationErrors(errors);
    } // 2. Get password from body (via matchedData)

    const { password } = matchedData(req);

    // 3. Get token directly from the URL query
    const token = req.query.t;

    // 4. Manually check if the token exists and has the correct length
    if (!token || typeof token !== 'string' || token.length !== 36) {
      // This handles both 'undefined' (which has length 9) and a missing token.
      throw new HttpError('Invalid or missing reset token', 400);
    } // Token in Resettoken suchen, wenn nicht vorhanden oder abgelaufen -> Abbruch

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
    await Password.findOneAndUpdate({ member: foundResettoken.member }, { password: newPassword });

    // alle bestehenden Reset-Tokens dieses Members löschen
    await Resettoken.deleteMany({ member: foundResettoken.member });

    // Erfolgsmeldung rausschicken
    res.send('New Password was set successfully');
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500, error.messageArray));
  }
};

export {
  signup,
  login,
  getAllMembers,
  getOneMember,
  getMemberByUsername,
  changePassword,
  deleteMember,
  updateMember,
  resetPassword,
  setNewPassword,
  filterMember,
};
