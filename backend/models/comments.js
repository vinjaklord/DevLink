import mongoose from 'mongoose';

const Schema = mongoose.Schema; 

const commentSchema = new Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const Comment = mongoose.model('Comment', commentSchema);