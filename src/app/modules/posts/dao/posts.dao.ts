import mongoose from 'mongoose';
import { IPost } from '../interface/posts.interface';
import { PostModel } from '../model/posts.model';

export default class PostsDao {
    async createPost(values: IPost) {
        const lastPost = await PostModel.find()
            .sort({ createdAt: -1 })
            .limit(1);

        values.uid = lastPost[0] ? lastPost[0].uid : 1;

        const post = new PostModel(values);

        return await post.save();
    }

    async updatePost(id: number, isActive: boolean) {
        return await PostModel.findOneAndUpdate({ uid: id }, { isActive });
    }

    async deletePost(id: number) {
        return await PostModel.findOneAndDelete({ uid: id });
    }

    async getAll(channelId: string, page: number) {
        const pageCount = await PostModel.find({ channelId }).count();
        const posts = await PostModel.aggregate([
            {
                $match: {
                    channelId: new mongoose.Types.ObjectId(channelId),
                },
            },
            {
                $skip: (page - 1) * 4,
            },
            {
                $limit: 4,
            },
        ]);
        return { posts, pageCount: Math.ceil(pageCount / 4) };
    }

    async getAllActive() {
        return await PostModel.find({ isActive: true });
    }
}
