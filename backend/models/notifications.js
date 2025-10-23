import mongoose from 'mongoose';

const Schema = mongoose.Schema

const notificationSchema = new Schema({
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  type: { type: String, enum: ['like', 'comment', 'friend_request', 'friend_accept'], required: true },
  message: String,
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Notification = mongoose.model('Notification', notificationSchema);