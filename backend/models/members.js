import mongoose from 'mongoose';
import { getZodiac, getAge } from '../common/index.js';

const Schema = mongoose.Schema;

const photoSchema = new Schema({
  fileId: { type: String },
  url: { type: String },
});

photoSchema.pre('save', function (next) {
  if (!this.fileId || !this.url) {
    this.fileId = '1';
    this.url = 'https://ik.imagekit.io/LHR/user-octagon-svgrepo-com.svg?updatedAt=1750339421935';
  }
  next();
});

const membersSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },

    photo: { type: photoSchema, required: false },
  },
  { timestamps: true }
);

const passwordsSchema = new Schema(
  {
    member: {
      type: mongoose.Types.ObjectId,
      ref: 'Member',
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
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

// automatisch vor dem Speichern Alter und Sternzeichen ermittelt werden
membersSchema.pre('save', function (next) {
  const member = this;
  member.age = getAge(this.birthYear, this.birthMonth, this.birthDay);
  member.zodiac = getZodiac(this.birthYear, this.birthMonth, this.birthDay);
  next();
});

// automatisch vor dem Löschen verknüpfte Inhalte anderer Collections entfernen
membersSchema.post('findOneAndDelete', async (deletedMember) => {
  if (deletedMember) {
    await Friend.deleteOne({ member: deletedMember._id });
    await Password.deleteMany({ member: deletedMember._id });
    await Resettoken.deleteMany({ member: deletedMember._id });
    // TODO: weitere Collections beachten wie z.B. hearts, visits, usw.
  }
});

export const Member = mongoose.model('Member', membersSchema);
export const Password = mongoose.model('Password', passwordsSchema);
export const Resettoken = mongoose.model('Resettoken', resettokensSchema);
