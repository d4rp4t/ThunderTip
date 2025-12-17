import { Context } from "grammy";
import { Conversation, ConversationFlavor } from "@grammyjs/conversations";

export type MyContext = Context & ConversationFlavor;
export type MyConversation = Conversation<MyContext>;

export type TelegramUserId = string & { readonly brand: unique symbol };
export type EncryptedConnectionUri = string & { readonly brand: unique symbol };
export type PlaintextConnectionUri = string & { readonly brand: unique symbol };
export type Username = string & { readonly brand: unique symbol };
export type NwcConnection = {
	telegramUID: TelegramUserId;
	createdAt: Date;
	nwcConnectionLink: EncryptedConnectionUri;
	username: Username;
};

export type NwcConnectionDbRecord = {
	telegram_user_id: string;
	created_at: Date;
	nwc_connection_link: string;
	username: string;
};
