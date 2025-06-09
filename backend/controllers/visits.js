// Import der Models
import { Visit } from '../models/visits.js';

import HttpError from '../models/http-error.js';

const addVisit = async (req, res, next) => {
  try {
    // neuen Visit erschaffen
    const createdVisit = new Visit({
      ...req.body,
    });

    // Visit speichern
    const newVisit = await createdVisit.save();

    // Daten des neuen Visits an Client senden
    res.json(newVisit);
  } catch (error) {
    return next(new HttpError(error, 422));
  }
};

const deleteVisit = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Visit löschen
    const deletedVisit = await Visit.findOneAndDelete({ _id: id });

    if (!deletedVisit) {
      throw new HttpError('Cannot find visit', 404);
    }

    // Erfolgsmeldung nach dem Löschen senden
    res.send('Visit was deleted successfully');
  } catch (error) {
    return next(new HttpError(error, 422));
  }
};

const getAllVisits = async (req, res, next) => {
  try {
    const { targetMember } = req.params;

    // alle Visits der übermittelten ID
    const visitsList = await Visit.find({ targetMember }).populate('visitor');

    // Liste aller Visits in JSON-Format an Client senden
    res.json(visitsList);
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

export { addVisit, deleteVisit, getAllVisits };
