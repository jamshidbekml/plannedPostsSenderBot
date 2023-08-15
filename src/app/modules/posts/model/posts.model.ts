import mongoose from 'mongoose';
import { IPost } from '../interface/posts.interface';

const postsSchema = new mongoose.Schema<IPost>(
    {
        channelId: {
            type: mongoose.Types.ObjectId,
            ref: 'channels',
            required: true,
        },
        chatId: { type: Number },
        time: { type: String },
        postItems: { type: Array, required: true },
        isActive: { type: Boolean, default: true },
        type: { type: String },
        uid: { type: Number },
    },
    {
        timestamps: true,
    }
);

export const PostModel = mongoose.model<IPost>('posts', postsSchema);
