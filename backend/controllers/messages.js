import { getRecieverSocketId } from '../common/socket.js';
import HttpError from '../models/http-error.js';
import { Member } from '../models/members.js';
import { Message } from '../models/messages.js';
import { uploadImage } from '../utils/imageKit.js';
import { io } from '../common/socket.js';

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInMember = req.verifiedMember._id;
    const filteredUsers = await Member.find({
      _id: { $ne: loggedInMember },
    });

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error('Error in getUsersForSidebar: ', error.message);
    throw new HttpError(error.message, 500);
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.verifiedMember._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, recipientId: userId },
        { senderId: userId, recipientId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error in getMessages controller:', error.message);
    throw new HttpError(error.message, 500);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: recipientId } = req.params;
    const senderId = req.verifiedMember._id;

    // Validate recipient exists
    const recipient = await Member.findById(recipientId);
    if (!recipient) {
      throw new HttpError('Recipient not found', 404);
    }

    let imageUrl = null;
    if (req.file) {
      const uploadResponse = await uploadImage(
        req.file.buffer,
        req.file.originalname
      );
      imageUrl = uploadResponse.url;
    }

    const newMessage = new Message({
      senderId,
      recipientId,
      text,
      image: imageUrl,
      createdAt: new Date(),
    });

    await newMessage.save();

    const recieverSocketId = getRecieverSocketId(recipientId);
    if (recieverSocketId) {
      io.to(recieverSocketId).emit('newMessage', newMessage);
      console.log(
        `Emitted newMessage to ${recieverSocketId} for user ${recipientId}`
      );
    } else {
      console.log(
        `Recipient ${recipientId} is offline; message saved to database`
      );
    }

    res.json(newMessage);
  } catch (error) {
    console.error('Error in sendMessage controller:', error.message);
    throw new HttpError(error.message, 500);
  }
};
