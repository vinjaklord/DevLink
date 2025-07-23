import HttpError from '../models/http-error.js';
import { Member } from '../models/members.js';
import { Message } from '../models/messages.js';

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

export const getMessages = async (req, res) => {
  try {
    const { id: guestId } = req.params;
    const myId = req.verifiedMember._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: guestId },
        { senderId: guestId, receiverId: myId },
      ],
    });
    res.json(messages);
  } catch (error) {
    console.error('Error in getMessages controller: ', error.message);
    throw new HttpError(error.message);
  }
};
