import { Post } from '../models/posts.js';
import { Member } from '../models/members.js';
import { uploadImage } from '../utils/imageKit.js';
import { Friend } from '../models/friends.js';
import HttpError from '../models/http-error.js';
import { matchedData, validationResult } from 'express-validator';
import { Notification } from '../models/notifications.js';
import { createNotification } from './notifications.js';

const createPost = async (req, res, next) => {
  try {
    const result = validationResult(req);

    if (result.errors.length > 0) {
      throw new HttpError(JSON.stringify(result.errors), 422);
    }

    const data = matchedData(req);

    const { caption } = data;
    const image = req.file;
    const authorId = req.verifiedMember;

    const author = await Member.findById(authorId);

    if (!author) {
      throw new HttpError('author is required', 400);
    }

    let imageUrl = null;
    let imageFileId = null;

    if (image) {
      const uploadResponse = await uploadImage(image.buffer, image.originalname);
      imageUrl = uploadResponse.url,
      imageFileId = uploadResponse.fileId
    }

    const post = await Post.create({
      caption,
      imageUrl,
      imageFileId,
      author,
    });

    res.status(201).json(post);
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const toggleLike = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.verifiedMember._id;
    const user = await Member.findById(userId);

    const post = await Post.findById(postId).populate('author');
    if (!post) {
      throw new HttpError('Post is not found', 404);
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    if (post.author._id.toString() !== userId.toString()) {
      await createNotification({
        fromUser: userId,
        targetUser: post.author._id,
        relatedPost: postId,
        message: `${user.username} liked your post`,
        type: 'like',
      });
    }

    await post.save();

    res.status(200).json({
      liked: !alreadyLiked,
      likes: post.likes,
      likeCount: post.likes.length,
    });
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const addComment = async (req, res, next) => {
  try {
    const result = validationResult(req);

    if (result.errors.length > 0) {
      throw new HttpError(JSON.stringify(result.errors), 422);
    }

    const data = matchedData(req);
    console.log(data);

    const { text } = data;
    const postId = req.params.id;
    const commentAuthorId = req.verifiedMember;
    const commentAuthor = await Member.findById(commentAuthorId);

    const post = await Post.findById(postId).populate('author');
    if (!post) {
      throw new HttpError('Post is not found', 404);
    }

    const comment = {
      author: commentAuthorId,
      text,
    };

    post.comments.push(comment);
    await post.save();

    if (post.author._id.toString() !== commentAuthorId.toString()) {
      await createNotification({
        fromUser: commentAuthorId,
        targetUser: post.author._id,
        relatedPost: postId,
        message: `${commentAuthor.username} commented on your post.`,
        type: 'comment'
      });
    }

    res.status(201).json({ comment, commentCount: post.comments.length });
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const getPostById = async (req, res, next) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId)
      .populate('author', 'username firstName lastName photo')
      .populate('comments.author', 'username firstName lastName photo');

    if (!post) {
      throw new HttpError('Post is not found', 404);
    }

    res.json(post);
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const getAllPosts = async (req, res, next) => {
  try {
    const postsList = await Post.find({})
      .populate('author', 'username firstName lastName photo')
      .populate('comments.author', 'username firstName lastName photo');
    res.json(postsList);
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const getMyPosts = async (req, res, next) => {
  const memberId = req.verifiedMember;

  try {
    const postsList = await Post.find({ author: memberId }).populate(
      'author',
      'username firstName lastName photo'
    );

    res.json(postsList);
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const getFriendsPosts = async (req, res, next) => {
  try {
    const memberId = req.verifiedMember._id;
    const friendDocument = await Friend.findOne({ member: memberId });

    if (!friendDocument || !friendDocument.friends || friendDocument.friends.length === 0) {
      return res.json([]);
    }

    const postsList = await Post.find({
      author: { $in: friendDocument.friends },
    })
      .populate('author', 'username firstName lastName photo')
      .populate('comments.author', 'username firstName lastName photo');

    res.json(postsList);
  } catch (error) {
    // This will catch any other errors, including if friendDocument is null
    return next(new HttpError(error, error.errorCode || 500));
  }
};

const getMemberPosts = async (req, res, next) => {
  const username = req.params.username;

  try {
    const member = await Member.findOne({ username });

    const postsList = await Post.find({ author: member._id }).populate(
      'author',
      'username firstName lastName photo'
    );

    res.json(postsList);
  } catch (error) {
    return next(new HttpError(error, error.errorCode || 500));
  }
};

export {
  createPost,
  toggleLike,
  addComment,
  getPostById,
  getAllPosts,
  getMyPosts,
  getMemberPosts,
  getFriendsPosts,
};
