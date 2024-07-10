import { Context } from "grammy";
import {Conversation, ConversationFlavor} from "@grammyjs/conversations";

export type MyContext = Context & ConversationFlavor;
export type MyConversation = Conversation<MyContext>;