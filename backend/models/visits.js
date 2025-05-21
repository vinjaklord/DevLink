import mongoose from 'mongoose';

const Schema = mongoose.Schema;

import { Member } from './members.js';
import HttpError from './http-error.js';

const visitsSchema = new Schema(
  {
    visitor: { type: mongoose.Types.ObjectId, required: true, ref: 'Member' },
    targetMember: { type: mongoose.Types.ObjectId, required: true, ref: 'Member' },
  },
  { timestamps: true }
);

visitsSchema.pre('save', async function () {
  const foundMVisitor = await Member.findById(this.visitor);

  if (!foundMVisitor) {
    throw new HttpError('Visitor unknow', 404);
  }

  const foundTargetMember = await Member.findById(this.targetMember);

  if (!foundTargetMember) {
    throw new HttpError('Target member unknow', 404);
  }
});

export const Visit = mongoose.model('Visit', visitsSchema);
