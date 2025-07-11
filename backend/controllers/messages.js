import HttpError from '../models/http-error.js';
import { Member } from '../models/members.js';

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInMember = req.verifiedMember._id;
    const filteredUsers = await Member.find({
      _id: { $ne: loggedInMember },
    });

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error('Error in getUsersForSidebar: ', error.message);
    throw new HttpError(error.message);
  }
};
