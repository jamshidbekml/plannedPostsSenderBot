import { Bot, session, GrammyError, HttpError } from 'grammy';
import { Router } from '@grammyjs/router';
import parseUrl from 'url-parse';

import { bot as botConfig } from '../config/conf';

import BotUsersController from './controllers/bot.users.controller';
import ChannelService from '../app/modules/channels/channel.service';
import PostService from '../app/modules/posts/posts.service';

import messages from './assets/messages';
import InlineKeyboards from './assets/inline_keyboard';

import { SendMessageBySchedules } from './utils/cron';

const bot = new Bot(botConfig.token);

export default class TgBot {
    private botUsersController = new BotUsersController();
    private channelService = new ChannelService();
    private postService = new PostService();

    private router = new Router((ctx) => ctx['session'].step);

    public async runBot() {
        const posts = await this.postService.getAllActive();
        SendMessageBySchedules(posts);
        bot.use(
            session({
                initial: () => ({
                    chat_id: null,
                    post_time: null,
                    step: 'idle',
                    post_items: [],
                    type: null,
                }),
            })
        );

        await bot.api.setMyCommands([
            {
                command: 'start',
                description: 'Start the bot',
            },
        ]);

        bot.command('start', async (ctx, next) => {
            try {
                ctx['session'].step = 'idle';
                const chat_id = ctx.msg.chat.id;

                return this.botUsersController.sendMenu(ctx);
            } catch (err) {
                console.log(err);
            }
        });

        bot.hears(messages.channels, async (ctx) => {
            ctx['session'].step = 'idle';

            return this.botUsersController.sendChannels(ctx);
        });

        bot.on('callback_query:data', async (ctx) => {
            const { pathname: command, query } = parseUrl(
                ctx.callbackQuery.data,
                true
            );

            switch (command) {
                case 'my_statistics':
                    try {
                        await this.botUsersController.statisticsTable(
                            ctx,
                            true
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'get_channels':
                    try {
                        await this.botUsersController.sendChannels(
                            ctx,
                            true,
                            query.page
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'get_channel':
                    try {
                        await this.botUsersController.sendPosts(
                            ctx,
                            true,
                            query.id,
                            query.page
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'add_post':
                    try {
                        ctx['session']['step'] = 'post_time';
                        ctx['session'].chat_id = query.id;
                        ctx.reply(
                            `Post yuborish vaqtini jo'nating\n\nNa'muna: 09:30`
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'reset_post':
                    try {
                        ctx['session'].step = 'post_time';
                        ctx.reply(
                            `Post yuborish vaqtini jo'nating\n\nNa'muna: 09:30`
                        );
                        ctx['session'].post_time = null;
                        ctx['session'].type = null;
                        ctx['session'].post_items = [];
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'set_post':
                    try {
                        ctx['session'].step = 'idle';
                        const channel = await this.channelService.getOne(
                            ctx['session'].chat_id
                        );

                        await this.postService.create({
                            channelId: channel._id,
                            postItems: ctx['session'].post_items,
                            chatId: Number(ctx['session'].chat_id),
                            time: ctx['session'].post_time,
                            type: ctx['session'].type,
                        });
                        ctx.reply('Tabriklaymiz postingiz tasdiqlandi!');
                        ctx['session'].post_time = null;
                        ctx['session'].type = null;
                        ctx['session'].post_items = [];
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'delete_post':
                    try {
                        await this.postService.delete(Number(query.id));
                        await this.botUsersController.sendPosts(
                            ctx,
                            true,
                            query.channel
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'back':
                    switch (query.step) {
                        case 'main_menu':
                            try {
                                await this.botUsersController.sendInlineMenu(
                                    ctx,
                                    true
                                );
                            } catch (error) {
                                console.log(error);
                            }
                            break;
                    }
                    break;

                default:
                    break;
            }
        });

        bot.use(this.router);

        this.router.route('post_time', async (ctx) => {
            try {
                await this.botUsersController.setPostTime(ctx, ctx.msg.text);
                ctx['session'].step = 'post';
                ctx.reply('Postni yuboring');
                ctx['session'].post_items = [];
            } catch (error) {
                console.log(error.message);
                await ctx.reply(messages.wrongTimeMsg, {
                    parse_mode: 'HTML',
                });
            }
        });

        this.router.route('post', async (ctx) => {
            try {
                if (ctx['session'].post_items.length == 0) {
                    await ctx.reply(`Postni tasdiqlaysizmi ?`, {
                        parse_mode: 'HTML',
                        reply_markup: InlineKeyboards.post_checker,
                    });
                }

                if (ctx.message.photo) {
                    ctx['session'].type = 'media';
                    ctx['session'].post_items.push({
                        type: 'photo',
                        media: ctx.message.photo[0].file_id,
                    });
                }
                if (ctx.message.video) {
                    ctx['session'].type = 'media';
                    ctx['session'].post_items.push({
                        type: 'video',
                        media: ctx.message.video.file_id,
                    });
                }
                if (ctx.message.caption) {
                    ctx['session'].post_items[0].caption = ctx.message.caption;
                    ctx['session'].post_items[0]['parse_mode'] = 'HTML';
                }
                if (ctx.message.text) {
                    ctx['session'].post_items.push(ctx.message.text);
                    ctx['session'].type = 'text';
                }
            } catch (error) {
                console.log(error.message);
            }
        });

        bot.use(async (ctx) => {
            if (
                ctx?.update?.my_chat_member?.new_chat_member?.status == 'member'
            ) {
                if (ctx?.update?.my_chat_member?.chat['username']) {
                    ctx.api.sendMessage(
                        ctx?.update?.my_chat_member?.from?.id,
                        `Siz "<a href="t.me/${ctx?.update?.my_chat_member?.chat['username']}"><b>${ctx?.update?.my_chat_member?.chat['title']}</b></a>" ushbu guruhga Botni qo'shdingiz !`,
                        { parse_mode: 'HTML' }
                    );
                } else
                    ctx.api.sendMessage(
                        ctx?.update?.my_chat_member?.from?.id,
                        `Siz "<b>${ctx?.update?.my_chat_member?.chat['title']}</b>" ushbu guruhga Botni qo'shdingiz !`,
                        { parse_mode: 'HTML' }
                    );

                await this.channelService.create({
                    chatId: ctx?.update?.my_chat_member?.chat.id,
                    chatTitle: ctx?.update?.my_chat_member?.chat['title'],
                    userChatId: ctx?.update?.my_chat_member?.from?.id,
                    chatLink: ctx?.update?.my_chat_member?.chat['username'],
                });
            }

            if (
                ctx?.update?.my_chat_member?.new_chat_member?.status == 'left'
            ) {
                if (ctx?.update?.my_chat_member?.chat['username']) {
                    ctx.api.sendMessage(
                        ctx?.update?.my_chat_member?.from?.id,
                        `Siz "<a href="t.me/${ctx?.update?.my_chat_member?.chat['username']}"><b>${ctx?.update?.my_chat_member?.chat['title']}</b></a>" ushbu guruhdan Botni chiqarib yubordingiz !`,
                        { parse_mode: 'HTML' }
                    );
                } else
                    ctx.api.sendMessage(
                        ctx?.update?.my_chat_member?.from?.id,
                        `Siz "<b>${ctx?.update?.my_chat_member?.chat['title']}</b>" ushbu guruhdan Botni chiqarib yubordingiz !`,
                        { parse_mode: 'HTML' }
                    );

                await this.channelService.delete(
                    ctx?.update?.my_chat_member?.chat.id,
                    ctx?.update?.my_chat_member?.from?.id
                );
            }

            if (
                ctx?.update?.my_chat_member?.new_chat_member?.status ==
                'administrator'
            ) {
                ctx.api.sendMessage(
                    ctx?.update?.my_chat_member?.from?.id,
                    `Siz "<a href="t.me/${ctx?.update?.my_chat_member?.chat['username']}"><b>${ctx?.update?.my_chat_member?.chat['title']}</b></a>" ushbu kanaliga Botni qo'shdingiz !`,
                    { parse_mode: 'HTML' }
                );

                await this.channelService.create({
                    chatId: ctx?.update?.my_chat_member?.chat.id,
                    chatTitle: ctx?.update?.my_chat_member?.chat['title'],
                    userChatId: ctx?.update?.my_chat_member?.from?.id,
                    chatLink: ctx?.update?.my_chat_member?.chat['username'],
                });
            }

            if (
                ctx?.update?.my_chat_member?.new_chat_member?.status == 'kicked'
            ) {
                if (ctx?.update?.my_chat_member?.chat['username']) {
                    ctx.api.sendMessage(
                        ctx?.update?.my_chat_member?.from?.id,
                        `Siz "<a href="t.me/${ctx?.update?.my_chat_member?.chat['username']}"><b>${ctx?.update?.my_chat_member?.chat['title']}</b></a>" ushbu kanaldan Botni chiqarib yubordingiz !`,
                        { parse_mode: 'HTML' }
                    );
                } else
                    ctx.api.sendMessage(
                        ctx?.update?.my_chat_member?.from?.id,
                        `Siz "<b>${ctx?.update?.my_chat_member?.chat['title']}</b>" ushbu kanaldan Botni chiqarib yubordingiz !`,
                        { parse_mode: 'HTML' }
                    );
                await this.channelService.delete(
                    ctx?.update?.my_chat_member?.chat.id,
                    ctx?.update?.my_chat_member?.from?.id
                );
            }
        });

        bot.catch((err) => {
            const ctx = err.ctx;
            console.error(
                `Error while handling update ${ctx.update.update_id}:`
            );
            const e = err.error;
            if (e instanceof GrammyError) {
                console.error('Error in request:', e.description);
            } else if (e instanceof HttpError) {
                console.error('Could not contact Telegram:', e);
            } else {
                console.error('Unknown error:', e);
            }
        });

        bot.use(this.router);

        bot.start();
    }

    public async sendMessage(chatId: number, message: string) {
        try {
            if (chatId) {
                await bot.api.sendMessage(chatId, message, {
                    parse_mode: 'HTML',
                });
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    public async sendPost(chatId: number, post_Items: any, type: string) {
        try {
            switch (type) {
                case 'media':
                    bot.api.sendMediaGroup(chatId, post_Items);
                    break;
                case 'text':
                    bot.api.sendMessage(chatId, post_Items[0]);
                    break;
            }
        } catch (err) {
            console.log(err);
        }
    }
}
