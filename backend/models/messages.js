import mongoose from 'mongoose';

const Schema = mongoose.Schema;

import { Member } from './members.js';
import HttpError from './http-error.js';

const messagesSchema = new Schema(
  {
    senderId: { type: mongoose.Types.ObjectId, required: true, ref: 'Member' },
    recipientId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Member',
    },
    text: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

messagesSchema.pre('save', async function () {
  const foundSender = await Member.findById(this.senderId);

  if (!foundSender) {
    throw new HttpError('Sender unknow', 404);
  }

  const foundRecipient = await Member.findById(this.recipientId);

  if (!foundRecipient) {
    throw new HttpError('Recipient unknow', 404);
  }
});

export const Message = mongoose.model('Message', messagesSchema);
