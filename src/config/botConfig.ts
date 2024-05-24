import { Bot } from "grammy";
import {MyContext} from "../types/types";
import * as dotenv from "dotenv";
dotenv.config();
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
    throw new Error("Can't initialize bot - token not provided");
}

const bot = new Bot<MyContext>(BOT_TOKEN);
export default bot;