Object.assign(global, { WebSocket: require('ws') });
import { conversations, createConversation } from "@grammyjs/conversations";
import {
    handleStart,
    handleHelp,
    handleConnection,
    handleTip,
    handleBalance,
    handleNwcInfo
} from './handlers/commandHandlers';
import { connection } from './utils/conversation';
import bot from './config/botConfig'
import { session } from "grammy";
import {OWNER_ID, PORT} from "./constants";
console.log(PORT);
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
bot.use(createConversation(connection));

bot.command('start', handleStart);
bot.command('help', handleHelp);
bot.command('connection', handleConnection);
bot.command('tip', handleTip);
bot.command('balance', handleBalance);
bot.command('nwc', handleNwcInfo);

bot.catch(async (err) => {
    const message = await bot.api.sendMessage(parseInt(OWNER_ID), err.message);
});
bot.start();

