import mongoose from 'mongoose';
import { getZodiac, getAge } from '../common/index.js';
import { Friend } from './friends.js';

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


const locationSchema = new Schema({
  city: { type: String },
  country: { type: String },
  countryCode: { type: String }, // e.g., "US", "RS"
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
  },
});

const membersSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    photo: { type: photoSchema, required: false },
    location: { type: locationSchema, required: false }, 
  },
  { timestamps: true }
);


membersSchema.index({ 'location.coordinates': '2dsphere' });

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

membersSchema.methods.getAge = function () {
  return getAge(this.birthYear, this.birthMonth, this.birthDay);
};

membersSchema.pre('save', function (next) {
  const member = this;
  member.age = getAge(this.birthYear, this.birthMonth, this.birthDay);
  member.zodiac = getZodiac(this.birthYear, this.birthMonth, this.birthDay);
  next();
});

membersSchema.post('findOneAndDelete', async (deletedMember) => {
  if (deletedMember) {
    const { Post } = await import('./posts.js');
    const { Comment } = await import('./comments.js');

    try {
    
      await Friend.deleteOne({ member: deletedMember._id });

     
      await Friend.updateMany(
        { friends: deletedMember._id },
        { $pull: { friends: deletedMember._id } }
      );

    
      await Friend.updateMany(
        { pendingFriendRequests: deletedMember._id },
        { $pull: { pendingFriendRequests: deletedMember._id } }
      );

   
      await Post.deleteMany({ author: deletedMember._id });
      await Comment.deleteMany({ author: deletedMember._id });

      await Password.deleteMany({ member: deletedMember._id });
      await Resettoken.deleteMany({ member: deletedMember._id });
    } catch (error) {
      console.error('Cleanup error in post-hook:', error);
    }
  }
});

export const Member = mongoose.model('Member', membersSchema);
export const Password = mongoose.model('Password', passwordsSchema);
export const Resettoken = mongoose.model('Resettoken', resettokensSchema);
