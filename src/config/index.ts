import * as dotenv from "dotenv";
export { bot } from "./botConfig";
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN || "";
const PASSWORD = process.env.PASSWORD || "";
const OWNER_ID = process.env.OWNER_ID || "";
const TABLE_NAME = "nwc_connections";

if (!BOT_TOKEN) {
	throw new Error("Bot token missing!");
}

if (!PASSWORD) {
	throw new Error("No password variable provided");
}

export { BOT_TOKEN, PASSWORD, OWNER_ID, TABLE_NAME };
