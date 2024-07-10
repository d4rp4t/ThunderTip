Object.assign(global, { WebSocket: require('ws') });
import { conversations, createConversation } from "@grammyjs/conversations";
import { handleStart, handleHelp, handleConnection, handleTip, handleBalance } from './handlers/commandHandlers';
import { connection } from './utils/conversation';
import bot from './config/botConfig'
import { session } from "grammy";
import {OWNER_ID} from "./constants"

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
bot.use(createConversation(connection));

bot.command('start', handleStart);
bot.command('help', handleHelp);
bot.command('connection', handleConnection);
bot.command('tip', handleTip);
bot.command('balance', handleBalance);

bot.catch(async (err) => {
    const message = await bot.api.sendMessage(parseInt(OWNER_ID), err.message);
});
bot.start();

