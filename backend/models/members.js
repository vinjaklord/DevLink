import mongoose from 'mongoose';

import { getZodiac, getAge } from '../common/index.js';

import { Visit } from './visits.js';
import { Heart } from './hearts.js';
import { Message } from './messages.js';

const Schema = mongoose.Schema;

const membersSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    // photo: {
    //   cloudinaryPublicId: { type: String, required: true },
    //   url: { type: String, required: true },
    // },
  },
  { timestamps: true }
);

const passwordsSchema = new Schema(
  {
    password: { type: String, required: true },
    member: { type: mongoose.Types.ObjectId, required: true, ref: 'Member' },
  },
  { timestamps: true }
);

const resettokensSchema = new Schema(
  {
    token: { type: String, required: true },
    member: { type: mongoose.Types.ObjectId, required: true, ref: 'Member' },
  },
  { timestamps: true }
);

// dem Member-Model eine Methode hinzufügen
membersSchema.methods.getAge = function () {
  return getAge(this.birthYear, this.birthMonth, this.birthDay);
};

// automatisch vor dem Speichern Alter und Sternzeichen ermmittelt werden
membersSchema.pre('save', function () {
  const member = this;
  member.age = getAge(this.birthYear, this.birthMonth, this.birthDay);
  member.zodiac = getZodiac(this.birthYear, this.birthMonth, this.birthDay);
});

// automatisch vor dem Löschen verknüpfte Inhalte anderer Collections entfernen
membersSchema.post('findOneAndDelete', async (deletedMember) => {
  if (deletedMember) {
    await Password.deleteMany({ member: deletedMember._id });

    await Resettoken.deleteMany({ member: deletedMember._id });

    await Visit.deleteMany({
      $or: [
        { visitor: deletedMember._id },
        { targetMember: deletedMember._id },
      ],
    });

    await Heart.deleteMany({
      $or: [{ sender: deletedMember._id }, { recipient: deletedMember._id }],
    });

    await Message.deleteMany({
      $or: [{ sender: deletedMember._id }, { recipient: deletedMember._id }],
    });
    // TODO: weitere Collections beachten wie z.B. hearts, visits, usw.
  }
});

export const Member = mongoose.model('Member', membersSchema);
export const Password = mongoose.model('Password', passwordsSchema);
export const Resettoken = mongoose.model('Resettoken', resettokensSchema);
