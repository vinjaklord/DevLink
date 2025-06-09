// benötigte Imports
import mongoose from 'mongoose';

import { validationResult, matchedData } from 'express-validator';

// Import der Models
import { Message } from '../models/messages.js';

import HttpError from '../models/http-error.js';

// const handleValidationErrors = (errors) => {
//   const uniqueErrorsPath = [];
//   const uniqueErrorsFrom = [];
//   const addedPaths = new Set();
//   const addedFrom = new Set();
//   let error;

//   errors.forEach((error) => {

//   });
//   // Customize the errorCode, typ, redirectTo, and messageArray as per your requirements
//   error = new HttpError(
//       'Validation Error',
//       400
//   );

// Return or throw the error object
//   return error;
// };

const addMessage = async (req, res, next) => {
  try {
    // Daten validieren
    const result = validationResult(req);

    if (result.errors.length > 0) {
      throw new HttpError(JSON.stringify(result.errors), 422);
    }

    const data = matchedData(req);

    // neue Nachricht erschaffen
    const createdMessage = new Message({
      ...data,
    });

    // Nachricht speichern
    const newMessage = await createdMessage.save();

    // Daten der neuen Nachricht an Client senden
    res.json(newMessage);
  } catch (error) {
    return next(new HttpError(error, 422));
  }
};

const updateMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Daten validieren
    const result = validationResult(req);

    if (result.errors.length > 0) {
      throw new HttpError(JSON.stringify(result.errors), 422);
    }

    const data = matchedData(req);

    // Nachricht ändern
    const changedMessage = await Message.findOneAndUpdate({ _id: id }, { ...data }, { new: true });

    if (!changedMessage) {
      throw new HttpError('Cannot find message', 404);
    }

    // TODO: Problem changedMesasge hat nicht die aktuellen Daten
    console.log(changedMessage);

    // Daten der neuen Nachricht an Client senden
    res.json(changedMessage);
  } catch (error) {
    return next(new HttpError(error, 422));
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Nachricht löschen
    const deletedMessage = await Message.findOneAndDelete({ _id: id });

    if (!deletedMessage) {
      throw new HttpError('Cannot find message', 404);
    }

    // Erfolgsmeldung nach dem Löschen senden
    res.send('Message was deleted successfully');
  } catch (error) {
    return next(new HttpError(error, 422));
  }
};

const getAllMessages = async (req, res, next) => {
  try {
    // mit leerem Objekt bekommen wir alle Messages
    const messagesList = await Message.find({}).populate('sender').populate('recipient');

    // Liste aller Nachrichten in JSON-Format an Client senden
    res.json(messagesList);
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const getOneMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('Cant find messages', 404);
    }

    // auf die ID filtern
    const foundMessage = await Message.find({ _id: id }).populate('sender').populate('recipient');

    // Eine Nachricht in JSON-Format an Client senden
    res.json(foundMessage);
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const getThreads = async (req, res, next) => {
  try {
    // Daten validieren
    const result = validationResult(req);

    if (result.errors.length > 0) {
      throw new HttpError(JSON.stringify(result.errors), 422);
    }

    const data = matchedData(req);

    const { id } = data;

    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //   throw new HttpError('Cant find threads', 404);
    // }

    // Annahme: standardmäßig ist der Posteingang (inbox)
    let findField = 'recipient';
    let populateField = 'sender';

    const url = req.url.toLowerCase();

    if (url.includes('outbox')) {
      findField = 'sender';
      populateField = 'recipient';
    }

    // Liste aller Nachrichten, wo die ID der Recipient ist (Inbox)
    const messages = await Message.find({ [findField]: id })
      .populate(populateField)
      .sort({ createdAt: 'desc' });

    // Suchergebnis durchlaufen und Threads (Gruppierungen) finden
    const threads = [];
    messages.forEach((message) => {
      const index = threads.findIndex(
        (thread) => String(thread[populateField]) === String(message[populateField])
      );

      if (index < 0) {
        threads.push(message);
      }
    });

    // Liste der Threads an den Client senden (im JSON-Format)
    res.json(threads);
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const getThreadMessages = async (req, res, next) => {
  // URL Parameter auslesen (sender, recipient)
  const { sender, recipient } = req.query;

  // Nachrichten filter nach sender, recipient
  const messages = await Message.find({ sender, recipient }).sort({ createdAt: 'asc' });

  // Nachrichten als JSON ausgeben
  res.json(messages);
};

export {
  addMessage,
  updateMessage,
  deleteMessage,
  getAllMessages,
  getOneMessage,
  getThreads,
  getThreadMessages,
};
