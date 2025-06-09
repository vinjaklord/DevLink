import mongoose from 'mongoose';

const Schema = mongoose.Schema;

import { Member } from './members.js';
import HttpError from './http-error.js';

const messagesSchema = new Schema(
  {
    sender: { type: mongoose.Types.ObjectId, required: true, ref: 'Member' },
    recipient: { type: mongoose.Types.ObjectId, required: true, ref: 'Member' },
    text: { type: String, required: true },
    read: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

messagesSchema.pre('save', async function () {
  const foundSender = await Member.findById(this.sender);

  if (!foundSender) {
    throw new HttpError('Sender unknow', 404);
  }

  const foundRecipient = await Member.findById(this.recipient);

  if (!foundRecipient) {
    throw new HttpError('Recipient unknow', 404);
  }
});

export const Message = mongoose.model('Message', messagesSchema);
