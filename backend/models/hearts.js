import mongoose from 'mongoose';

const Schema = mongoose.Schema;

import { Member } from './members.js';
import HttpError from './http-error.js';

const heartsSchema = new Schema(
  {
    sender: { type: mongoose.Types.ObjectId, required: true, ref: 'Member' },
    recipient: { type: mongoose.Types.ObjectId, required: true, ref: 'Member' },
    text: { type: String, default: '' },
    confirmed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

heartsSchema.pre('save', async function () {
  const foundMember = await Member.findById(this.sender);

  if (!foundMember) {
    throw new HttpError('Sender unknow', 404);
  }

  const foundRecipient = await Member.findById(this.recipient);

  if (!foundRecipient) {
    throw new HttpError('Recipient unknow', 404);
  }
});

export const Heart = mongoose.model('Heart', heartsSchema);
