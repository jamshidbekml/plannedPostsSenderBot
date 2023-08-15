import {
    SendMessageBySchedule,
    SendMessageBySchedules,
} from '../../../bot/utils/cron';
import PostsDao from './dao/posts.dao';
import { IPost } from './interface/posts.interface';

export default class PostService {
    private postsDao = new PostsDao();

    async create(values: IPost) {
        const post = await this.postsDao.createPost(values);

        SendMessageBySchedule(post);
        return post;
    }

    async delete(id: number) {
        await this.postsDao.deletePost(id);

        const posts = await this.postsDao.getAllActive();

        SendMessageBySchedules(posts);
    }

    async getAll(channelId: string, page: number) {
        return await this.postsDao.getAll(channelId, page);
    }

    async getAllActive() {
        return await this.postsDao.getAllActive();
    }
}
