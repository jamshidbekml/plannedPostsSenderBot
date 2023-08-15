import cron from 'node-cron';
import TgBot from '../bot';

export const SendMessageBySchedules = (data) => {
    const bot = new TgBot();
    if (data.length)
        data.forEach((post) => {
            cron.schedule(
                `${post.time.slice(3) - 0} ${post.time.slice(0, 2) - 0} * * *`,
                () => {
                    bot.sendPost(
                        Number(post.chatId),
                        post.postItems,
                        post.type
                    );
                },
                {
                    scheduled: true,
                    timezone: 'Asia/Tashkent',
                }
            );
        });
};

export const SendMessageBySchedule = (post) => {
    const bot = new TgBot();

    cron.schedule(
        `${post.time.slice(3) - 0} ${post.time.slice(0, 2) - 0} * * *`,
        () => {
            bot.sendPost(Number(post.chatId), post.postItems, post.type);
        },
        {
            scheduled: true,
            timezone: 'Asia/Tashkent',
        }
    );
};
