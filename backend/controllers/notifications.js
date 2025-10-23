import HttpError from '../models/http-error.js';
import { Notification } from '../models/notifications.js';

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.verifiedMember._id; 

    const notification = await Notification.findOneAndUpdate(
      { _id: id, targetUser: userId },
      { isRead: true },
      { new: true }
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.verifiedMember._id;
    console.log('user id is', userId);

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




