import mongoose from 'mongoose';

const Schema = mongoose.Schema;

import { Member } from './members.js';
import HttpError from './http-error.js';

const friendsSchema = new Schema({
  member: { type: mongoose.Types.ObjectId, required: true, ref: 'Member' },
  pendingFriendRequests: [{ type: mongoose.Types.ObjectId, ref: 'Member', default: [] }],
  friends: [{ type: mongoose.Types.ObjectId, ref: 'Member', default: [] }],
});

friendsSchema.pre('save', async function () {
  const foundMember = await Member.findById(this.sender);

  if (!foundMember) {
    throw new HttpError('Sender unknown', 404);
  }

  const foundRecipient = await Member.findById(this.recipient);

  if (!foundRecipient) {
    throw new HttpError('Recipient unknown', 404);
  }

  if (this.sender.equals(this.recipient)) throw new HttpError('Cannot friend yourself', 422);
});

export const Friend = mongoose.model('Friend', friendsSchema);
