import messages from '../assets/messages';
import InlineKeyboards from '../assets/inline_keyboard';
import Keyboards from '../assets/keyboards';
import ChannelService from '../../app/modules/channels/channel.service';
import PostService from '../../app/modules/posts/posts.service';
import stringTimeValidator from '../utils/stringTimeValidator';
import { InlineKeyboard } from 'grammy';

export default class BotUsersController {
    private channelSercvice = new ChannelService();
    private postService = new PostService();

    public sendInlineMenu = async (ctx, edit: boolean = false) => {
        try {
            if (edit)
                await ctx.api.editMessageText(
                    ctx.callbackQuery.message.chat.id,
                    ctx.callbackQuery.message.message_id,
                    messages.menuMsg,
                    {
                        parse_mode: 'HTML',
                        reply_markup: InlineKeyboards.inline_menu,
                    }
                );
            else
                await ctx.reply(messages.menuMsg, {
                    parse_mode: 'HTML',
                    reply_markup: InlineKeyboards.inline_menu,
                });
        } catch (err) {
            console.log(err.message);
        }
    };

    public sendChannels = async (ctx, edit: boolean = false, page = 1) => {
        try {
            if (page == 0)
                return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
                    text: '❗️ Bu oxirgi sahifa',
                });

            const data = await this.channelSercvice.getAll(
                ctx.update.message.from.id,
                page
            );

            if (page > 1 && data.pageCount < page) {
                return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
                    text: '❗️ Bu oxirgi sahifa',
                });
            }
            if (!data.channels && page == 1 && data.channels.length == 0)
                return ctx.reply(
                    `Sizda hali hech qanday kanal yoki gruppa yo'q`
                );

            if (edit)
                await ctx.api.editMessageText(
                    ctx.callbackQuery.message.chat.id,
                    ctx.callbackQuery.message.message_id,
                    `🗒 kanal va guruhlar ro'yxati`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: InlineKeyboards.channels(
                                data.channels,
                                page,
                                data.pageCount
                            ),
                        },
                    }
                );
            else
                await ctx.reply(`🗒 kanal va guruhlar ro'yxati`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: InlineKeyboards.channels(
                            data.channels,
                            page,
                            data.pageCount
                        ),
                    },
                });
        } catch (err) {
            console.log(err.message);
        }
    };

    public sendPosts = async (
        ctx,
        edit: boolean = false,
        channelId: string,
        page: number = 1
    ) => {
        try {
            if (page == 0)
                return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
                    text: '❗️ Bu oxirgi sahifa',
                });
            const channel = await this.channelSercvice.getOne(
                Number(channelId)
            );
            const { posts, pageCount } = await this.postService.getAll(
                channel._id.toString(),
                page
            );

            if (page > 1 && pageCount < page) {
                return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
                    text: '❗️ Bu oxirgi sahifa',
                });
            }

            if (edit)
                await ctx.api.editMessageText(
                    ctx.callbackQuery.message.chat.id,
                    ctx.callbackQuery.message.message_id,
                    `"<b>${channel.chatTitle}</b>" kanaldagi postlar`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: InlineKeyboards.posts(
                                posts,
                                page,
                                pageCount,
                                channel.chatId
                            ),
                        },
                    }
                );
            else
                await ctx.reply(
                    `"<b>${channel.chatTitle}</b>" kanaldagi postlar`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: InlineKeyboards.posts(
                                posts,
                                page,
                                pageCount,
                                channel.chatId
                            ),
                        },
                    }
                );
        } catch (err) {
            console.log(err.message);
        }
    };

    public sendMenu = async (ctx) => {
        try {
            await ctx.reply(messages.start_message(ctx), {
                parse_mode: 'HTML',
                reply_markup: Keyboards.main_menu,
            });
        } catch (err) {
            console.log(err.message);
        }
    };

    public statisticsTable = async (ctx, edit: boolean = false) => {
        await ctx.api.editMessageText(
            ctx.callbackQuery.message.chat.id,
            ctx.callbackQuery.message.message_id,
            messages.statistics_menu,
            {
                parse_mode: 'HTML',
                reply_markup: InlineKeyboards.statisticsTable(true),
            }
        );
    };

    public setPostTime = async (ctx, time) => {
        stringTimeValidator(time);
        ctx.session.post_time = time;
    };
}
