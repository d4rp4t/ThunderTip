import { Bot } from "grammy";

import { MyContext } from "../types";

import { BOT_TOKEN } from "./";

const bot = new Bot<MyContext>(BOT_TOKEN);
if (!bot) {
	throw new Error("Couldn't create bot object! Panicking.");
}
export { bot };
