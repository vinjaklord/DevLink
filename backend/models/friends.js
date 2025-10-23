import mongoose from 'mongoose';

const Schema = mongoose.Schema;

import { Member } from './members.js';
import HttpError from './http-error.js';

const friendsSchema = new Schema({
  member: { type: mongoose.Types.ObjectId, required: true, ref: 'Member' },
  pendingFriendRequests: [{ type: mongoose.Types.ObjectId, ref: 'Member', default: [] }],
  friends: [{ type: mongoose.Types.ObjectId, ref: 'Member', default: [] }],
});


export const Friend = mongoose.model('Friend', friendsSchema);
