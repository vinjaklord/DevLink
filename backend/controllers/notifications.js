import { getRecieverSocketId, io } from '../common/socket.js';
import HttpError from '../models/http-error.js';
import { Notification } from '../models/notifications.js';

export const createNotification = async ({ fromUser, targetUser, message, relatedPost, type}) => {
  const notif = await Notification.create({ fromUser, targetUser, message, relatedPost, type });

  // emit to target user if connected
  const socketId = getRecieverSocketId(targetUser.toString());
  if (socketId) {
    io.to(socketId).emit('notification', notif);
  }

  return notif;
};

export const markRead = async (req, res) => {
  try {
    const userId = req.verifiedMember?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: user not found' });
    }

    const { id } = req.params;

    if (id === 'all') {
      const result = await Notification.updateMany(
        { targetUser: userId, isRead: false },
        { isRead: true }
      );

      return res.json({
        message: `All notifications marked as read (${result.modifiedCount} updated)`,
      });
    }

    const notif = await Notification.findOneAndUpdate(
      { _id: id, targetUser: userId },
      { isRead: true },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.json({ message: 'Notification marked as read', notif });
  } catch (err) {
    console.error('markRead error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.verifiedMember._id;


    const notifications = await Notification.find({ targetUser: userId })
      .populate('fromUser', 'username photo')
      .populate('relatedPost', 'content')
      .sort({ createdAt: -1 }); // latest first

    res.json(notifications);
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

export const getUnreadNotifications = async (req, res, next) => {
  try {
    const userId = req.verifiedMember._id;
    const notifications = await Notification.find({
      targetUser: userId,
      isRead: false,
    })
      .populate('fromUser', 'username photo')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.verifiedMember._id;
    const count = await Notification.countDocuments({
      targetUser: userId,
      isRead: false,
    });

    res.json({ unreadCount: count });
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};




