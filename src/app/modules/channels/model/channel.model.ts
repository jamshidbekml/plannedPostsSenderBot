import mongoose from 'mongoose';
import { IChannel } from '../interface/channel.interface';

const channelSchema = new mongoose.Schema<IChannel>(
    {
        chatId: { type: Number, required: true },
        chatTitle: { type: String, required: true },
        chatLink: { type: String },
        userChatId: { type: Number, required: true },
    },
    {
        timestamps: true,
    }
);

export const ChannelsModel = mongoose.model<IChannel>(
    'channels',
    channelSchema
);
