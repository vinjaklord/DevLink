// benötigte Imports
import { validationResult, matchedData } from 'express-validator';

// Import der Models
import { Heart } from '../models/hearts.js';

import HttpError from '../models/http-error.js';

const addHeart = async (req, res, next) => {
  try {
    // Daten validieren
    const result = validationResult(req);

    if (result.errors.length > 0) {
      throw new HttpError(JSON.stringify(result.errors), 422);
    }

    const data = matchedData(req);

    // Prüfen, ob Herz schon vorkommt (sender, recipient)
    const { sender, recipient } = data;
    const foundedHearts = await Heart.find({ sender, recipient });

    if (foundedHearts.length > 0) {
      throw new HttpError('only one heart is possible', 409);
    }

    // neues Herz erschaffen
    const createdHeart = new Heart({
      ...data,
    });

    // Herz speichern
    const newHeart = await createdHeart.save();

    // Daten des neuen Herzens an Client senden
    res.json(newHeart);
  } catch (error) {
    return next(new HttpError(error, 422));
  }
};

const updateHeart = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Daten validieren
    const result = validationResult(req);

    if (result.errors.length > 0) {
      throw new HttpError(JSON.stringify(result.errors), 422);
    }

    const data = matchedData(req);

    // Herz ändern
    const changedHeart = await Heart.findOneAndUpdate({ _id: id }, { ...data });

    if (!changedHeart) {
      throw new HttpError('Cannot find heart', 404);
    }

    // Daten des neuen Herzens an Client
    res.json(changedHeart);
  } catch (error) {
    return next(new HttpError(error, 422));
  }
};

const deleteHeart = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Herz löschen
    const deletedHeart = await Heart.findOneAndDelete({ _id: id });

    if (!deletedHeart) {
      throw new HttpError('Cannot find heart', 404);
    }

    // Erfolgsmeldung nach dem Löschen senden
    res.send('Heart was deleted successfully');
  } catch (error) {
    return next(new HttpError(error, 422));
  }
};

const getAllHearts = async (req, res, next) => {
  try {
    const { recipient } = req.params;

    // mit leerem Objekt bekommen wir alle Members
    const heartsList = await Heart.find({ recipient }).populate('sender').populate('recipient');

    // Liste aller Herzen in JSON-Format an Client senden
    res.json(heartsList);
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

export { addHeart, updateHeart, deleteHeart, getAllHearts };
