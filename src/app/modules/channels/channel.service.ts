import ChannelsDao from './dao/channel.dao';
import { AddChannelDto } from './dto/channel.dto';

export default class ChannelService {
    private channelsDao = new ChannelsDao();

    async create(values: AddChannelDto) {
        return await this.channelsDao.create(values);
    }

    async delete(channelId: number, userId: number) {
        return await this.channelsDao.delete(channelId, userId);
    }

    async getOne(channelId: number) {
        return await this.channelsDao.getOne(channelId);
    }

    async getAll(userId: number, page: number) {
        return await this.channelsDao.getAll(userId, page);
    }
}
