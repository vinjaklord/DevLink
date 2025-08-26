import { validationResult, matchedData } from 'express-validator';
import mongoose from 'mongoose';
import HttpError from '../models/http-error.js';
import { Friend, Member } from '../models/members.js';

const addFriend = async (req, res, next) => {
  try {
    const result = validationResult(req);

    if (result.errors.length > 0) {
      throw new HttpError(JSON.stringify(result.errors), 422);
    }

    const data = matchedData(req);
    // const { sender, recipient } = data; // as IDs
    const sender = req.verifiedMember._id;
    const { id: recipient } = req.params;

    const senderMember = await Member.findById(sender);
    const recipientMember = await Member.findById(recipient);
    if (!senderMember || !recipientMember) {
      throw new HttpError('Cannot find member by id', 404);
    }

    let recipientFriend = await Friend.findOne({ member: recipient });
    if (!recipientFriend) {
      recipientFriend = new Friend({ member: recipient });
      await recipientFriend.save();
    } else {
    }

    if (
      recipientFriend.pendingFriendRequests.some(
        (id) => id.toString() === sender.toString()
      )
    ) {
      throw new HttpError('Friend request already sent', 409);
    }

    recipientFriend.pendingFriendRequests.push(sender);
    await recipientFriend.save();

    res.json(recipientFriend);
  } catch (error) {
    return next(new HttpError(error, 422));
  }
};

const deleteFriend = async (req, res, next) => {
  try {
    const loggedInUser = req.verifiedMember._id;
    const { friendId } = req.params;

    if (loggedInUser === friendId) {
      throw new HttpError('You cannot remove yourself as a friend.', 400);
    }

    const updatedUserDocument = await Friend.findOneAndUpdate(
      { member: loggedInUser },
      { $pull: { friends: friendId } },
      { new: true, runValidators: true }
    );

    if (!updatedUserDocument) {
      throw new HttpError(
        'Could not find friend list for the logged-in user.',
        404
      );
    }

    const updatedFriendDocument = await Friend.findOneAndUpdate(
      { member: friendId },
      { $pull: { friends: loggedInUser } },
      { new: true, runValidators: true }
    );

    if (!updatedFriendDocument) {
      console.warn(
        `Friend list not found for user ${friendId}. Data may be inconsistent.`
      );
    }

    res.json({
      message: 'Friend removed successfully.',
      updatedUserDocument,
    });
  } catch (error) {
    console.error('Error in removeFriend controller:', error.message);
    return next(
      new HttpError(
        error.message || 'Failed to remove friend.',
        error.code || 500
      )
    );
  }
};

const getPendingFriendRequests = async (req, res, next) => {
  try {
    if (!req.verifiedMember) throw new HttpError('Unauthorized', 401);

    const foundMember = await Member.findById(req.verifiedMember._id);
    if (!foundMember) {
      throw new HttpError('logged in member not found', 404);
    }

    const friendDoc = await Friend.findOne({
      member: req.verifiedMember._id,
    }).populate('pendingFriendRequests', 'username firstName');
    if (!friendDoc) {
      return res.json([]);
    }
    console.log(
      'Pending requests for:',
      req.verifiedMember._id,
      friendDoc.pendingFriendRequests
    );
    res.json(friendDoc.pendingFriendRequests);
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const getAllFriends = async (req, res, next) => {
  try {
    if (!req.verifiedMember) throw new HttpError('Unauthorized', 401);

    const friendDoc = await Friend.findOne({
      member: req.verifiedMember._id,
    }).populate('friends', 'username firstName lastName photo email');
    if (!friendDoc) {
      return res.json([]);
    }
    res.json(friendDoc.friends);
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const manageFriendRequest = async (req, res, next) => {
  let session;
  try {
    const { senderId } = req.params;
    if (!req.verifiedMember) throw new HttpError('Unauthorized', 401);
    const result = validationResult(req);

    if (result.errors.length > 0) {
      throw new HttpError(JSON.stringify(result.errors), 422);
    }

    const data = matchedData(req);
    const { action } = data;

    const recipientMember = await Member.findById(req.verifiedMember._id);
    const senderMember = await Member.findById(senderId);

    if (!senderMember || !recipientMember) {
      throw new HttpError('Cannot find member by id', 404);
    }

    let recipientFriend = await Friend.findOne({
      member: req.verifiedMember._id,
    });
    if (!recipientFriend) {
      recipientFriend = new Friend({ member: req.verifiedMember._id });
      await recipientFriend.save();
    } else {
    }

    if (
      !recipientFriend.pendingFriendRequests.some(
        (id) => id.toString() === senderId.toString()
      )
    ) {
      throw new HttpError('Friend request not found!', 404);
    }

    // Check if already friends to prevent multiple accepts
    if (
      action === 'accept' &&
      recipientFriend.friends.some(
        (id) => id.toString() === senderId.toString()
      )
    ) {
      throw new HttpError('Already friends!', 409);
    }

    session = await mongoose.startSession();
    session.startTransaction();

    if (action === 'decline') {
      recipientFriend.pendingFriendRequests.pull(senderId);
      await recipientFriend.save({ session });
      await session.commitTransaction();
    } else if (action === 'accept') {
      recipientFriend.pendingFriendRequests.pull(senderId);
      recipientFriend.friends.push(senderId);
      await recipientFriend.save({ session });

      // Update sender's Friend document with recipientId
      let senderFriend = await Friend.findOne({ member: senderId }).session(
        session
      );
      if (!senderFriend) {
        senderFriend = new Friend({ member: senderId });
        await senderFriend.save({ session });
      }
      if (
        !senderFriend.friends.some(
          (id) => id.toString() === req.verifiedMember._id.toString()
        )
      ) {
        senderFriend.friends.push(req.verifiedMember._id);
        await senderFriend.save({ session });
      }

      await session.commitTransaction();
    } else {
      throw new HttpError('You must accept or decline', 422);
    }

    res.json({
      message:
        action === 'decline'
          ? 'Friend request declined'
          : 'Friend request accepted!',
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      await session.endSession();
    }
    next(new HttpError(error, error.errorCode || 500));
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

export {
  addFriend,
  getPendingFriendRequests,
  manageFriendRequest,
  getAllFriends,
  deleteFriend,
};
