Object.assign(global, { WebSocket: require('ws') });
import { conversations, createConversation } from "@grammyjs/conversations";
import { handleStart, handleHelp, handleConnection, handleTip, handleBalance } from './handlers/commandHandlers';
import { connection } from './utils/conversation';
import bot from './config/botConfig'
import * as dotenv from "dotenv";
import { session } from "grammy";


dotenv.config();
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
bot.use(createConversation(connection));

bot.command('start', handleStart);
bot.command('help', handleHelp);
bot.command('connection', handleConnection);
bot.command('tip', handleTip);
bot.command('balance', handleBalance);

bot.catch(async (err) => {
    const message = await bot.api.sendMessage(parseInt(process.env.OWNER_ID!), err.message);
});
bot.start();
