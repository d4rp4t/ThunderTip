import { Bot } from "grammy";
import {MyContext} from "../types";
import {BOT_TOKEN} from "../constants";

const bot = new Bot<MyContext>(BOT_TOKEN);
if (!bot){
    throw new Error("Couldn't create bot object! Panicking.")
}
export default bot;