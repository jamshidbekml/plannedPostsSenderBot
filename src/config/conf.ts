import { config } from 'dotenv';

config();

const { env } = process;

export const bot: { token: string; admin: string; channel: string } = {
    token: env.BOT_TOKEN,
    admin: env.TELEGRAM_ADMIN,
    channel: env.TELEGRAM_CH,
};

export const MONGO_URI = env.MONGO_URL || 'mongodb://127.0.0.1:27017/bot';
