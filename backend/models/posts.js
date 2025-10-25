
import mongoose from 'mongoose';

const Schema = mongoose.Schema; 

const postSchema = new Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    caption: { type: String, required: true },
    imageUrl: { type: String },
    imageFileId: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Member" }],
    comments: [
        {
            author: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Member",
                required: true,
            },
            text: {
                type: String, required: true
            },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now },
});

//GETTERS
postSchema.virtual("likeCount").get(function () {
    return this.likes.lenght;
});

postSchema.virtual("commentCount").get(function () {
    return this.comments.length;
});

export const Post = mongoose.model('Post', postSchema);