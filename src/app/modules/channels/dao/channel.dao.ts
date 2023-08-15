import { IChannel } from '../interface/channel.interface';
import { ChannelsModel } from '../model/channel.model';

export default class ChannelsDao {
    async create(values: IChannel) {
        const channel = new ChannelsModel(values);
        return await channel.save();
    }

    async delete(id: number, userId: number) {
        return await ChannelsModel.findOneAndDelete({
            chatId: id,
            userChatId: userId,
        });
    }

    async getOne(chatId: number) {
        return await ChannelsModel.findOne({ chatId });
    }

    async getAll(user: number, page: number) {
        const pageCount = await ChannelsModel.find({
            userChatId: user,
        }).count();
        const channels = await ChannelsModel.aggregate([
            {
                $match: {
                    userChatId: user,
                },
            },
            {
                $skip: (page - 1) * 4,
            },
            {
                $limit: 4,
            },
        ]);
        return { channels, pageCount: Math.ceil(pageCount / 4) };
    }
}
