import { handleConnect, handleUpdate, handleDelete } from '../handlers/conversationHandlers';
import {MyContext, MyConversation} from "../types/types";
import {InlineKeyboard} from "grammy";
export async function connection(conversation: MyConversation, ctx: MyContext) {
    const connectionKeyboard = new InlineKeyboard()
        .text("Create new Connection", "connect").row()
        .text("Update Connection", "update").row()
        .text("Delete Connection", "delete");

    if (ctx.message?.chat.type === "private") {
        await ctx.reply("If you're a new user, you probably want to connect to the bot. " +
            "If you're already connected and you want to update your NWC connection - feel free! Click the update button below. " +
            "If you want to delete your connection URI from the database - use the delete button.", { reply_markup: connectionKeyboard });

        const callback = await conversation.waitForCallbackQuery(/^(connect|update|delete)$/);

        switch (callback.callbackQuery.data) {
            case "connect":
                await handleConnect(ctx, conversation);
                break;
            case "update":
                await handleUpdate(ctx, conversation);
                break;
            case "delete":
                await handleDelete(ctx, conversation);
                break;
            default:
                await ctx.reply("Unknown action. Please try again.");
                break;
        }
        await callback.answerCallbackQuery();
    } else {
        await ctx.reply("For connection settings, please DM this bot. The NWC URI is sensitive data.");
    }
}