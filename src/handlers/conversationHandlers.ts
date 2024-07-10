import { webln } from "@getalby/sdk";
import {MyContext, MyConversation} from "../types";
import User from '../classes/User'
import supabase from "../config/supabaseConfig";
import {handleError} from "../errors";

export async function handleConnect(ctx: MyContext, conversation: MyConversation) {
    const user = await User.init(ctx.message?.from.id.toString()!);
    if (user.isNew) {
        await ctx.reply('To connect your wallet, send your NWC wallet connecting URI', {
            reply_markup: {
                force_reply: true, input_field_placeholder: 'Reply with your NWC connect URI',
            },
        });

        const { message } = await conversation.wait();
        if (message && message.text) {
            try {
                const connection = new webln.NWC({ nostrWalletConnectUrl: message.text });
                await user.addNwcUrl(message.text);
                await ctx.reply("Wallet connected successfully!");
            } catch (err:any) {
                await handleError(err, ctx)
            }
        }
        if (message && message.from) {
            await user.updateUsername("@" + message.from.username!);
        }
    } else {
        await ctx.reply("You're already connected. If you want to change your NWC connection URI, use the update option.");
    }
}

export async function handleUpdate(ctx: MyContext, conversation: MyConversation) {
    const user = await User.init(ctx.message!.from.id.toString());
    if (user.connection) {
        await ctx.reply("Please provide your new NWC URL.");
        const { message } = await conversation.wait();

        if (message && message.text) {
            await user.updateNwcUrl(message.text);
            await ctx.reply("Connection URL updated successfully!");
        } else {
            await ctx.reply("This definitely isn't an NWC URL, is it?");
        }
        if (message && message.from) {
            await user.updateUsername("@" + message.from.username!);
        }
    } else {
        await ctx.reply("Can't update a non-existing connection. Use the connect option.");
    }
}

export async function handleDelete(ctx: MyContext, conversation: MyConversation) {
    await ctx.reply('Do you really want to delete your NWC connection?\nNo funds will be lost.\nIf yes, text me "yes", if not, send anything else.');
    const { message } = await conversation.wait();
    if (message && message.text === "yes") {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('telegram_user_id', message.from.id);
        if (!error) {
            await ctx.reply("Deleted. I hope to see you back!");
        } else {
            await ctx.reply("Error occurred! Please try again later.");
        }
    } else {
        await ctx.reply("Deletion aborted. What a relief!");
    }
}
