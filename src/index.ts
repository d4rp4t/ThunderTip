Object.assign(global, { WebSocket: require("ws") });
import { conversations, createConversation } from "@grammyjs/conversations";

import { session } from "grammy";

import {
	handleStart,
	handleHelp,
	handleConnection,
	handleZap,
	handleBalance,
	handleNwcInfo,
} from "./handlers/commandHandlers";
import { connection } from "./utils/conversation";
import { OWNER_ID, bot } from "./config";

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
bot.use(createConversation(connection));

bot.command("start", handleStart);
bot.command("help", handleHelp);
bot.command("connection", handleConnection);
bot.command("zap", handleZap);
bot.command("balance", handleBalance);
bot.command("nwc", handleNwcInfo);

bot.catch(async (err) => {
	await bot.api.sendMessage(parseInt(OWNER_ID), err.name + " " + err.message);
});
bot.start();
