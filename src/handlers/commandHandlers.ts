import { handleTransaction } from "../utils/transaction";
import User from '../utils/User';
import { CommandContext } from "grammy";
import { MyContext } from "../types/types";

export async function handleStart(ctx: CommandContext<MyContext>) {
    await ctx.reply("Hey there! I'm ThunderTip, your friendly Telegram bot for quick and easy transactions. Need help? Just hit /help.");
}

export async function handleHelp(ctx: CommandContext<MyContext>) {
    await ctx.reply("Hey! I'm your go-to bot for fast transactions in Telegram chats.\n\n" +
        "Commands:\n\n" +
        "• Hook up your LN wallet: /connection\n" +
        "• Throw a tip to a user: /tip <username> <amount>\n" +
        "• Tip by replying to a message: /tip <amount>\n\n" +
        "Wanna keep me running? Feel free to send tips for bot maintenance (servers, databases, and all that jazz).");
}

export async function handleConnection(ctx: CommandContext<MyContext>) {
    await ctx.conversation.enter("connection");
}

export async function handleTip(ctx: CommandContext<MyContext>) {
    try {
        const args = ctx.match.split(" ");
        if (args.length === 2) {
            const [tipReceiverString, tipAmountString] = args;
            const sender = ctx.message!.from.id.toString();
            const tipReceiver = await User.getIdByUsername(tipReceiverString);
            console.log(`${tipReceiverString} id is ${tipReceiver}`);
            if (!tipReceiver) {
                const errorMessage = `Sorry, ${tipReceiverString} hasn't connected to this bot. They can't receive your tip!`;
                throw new Error(errorMessage); // Throw a custom error with the desired message
            }
            const tipAmount = parseFloat(tipAmountString);
            if (tipAmount > 0) {
                if (!tipReceiverString || isNaN(tipAmount)) {
                    await ctx.reply(`Oops, something went wrong! Please use the correct syntax: /tip <username> <amount>. For example: /tip @username 10`);
                    return;
                }
                await handleTransaction(tipReceiver.toString(), sender, tipAmount, ctx);
            } else if (tipAmount === 0) {
                await ctx.reply(`You're trying to send 0 satoshi? Why would you do that?`);
            } else {
                await ctx.reply("Negative tips are not allowed. Generosity doesn't work that way!");
            }
        } else if ('reply_to_message' in ctx.message! && args.length === 1) {
            const repliedMessage = ctx.message.reply_to_message;
            if (repliedMessage && repliedMessage.from) {
                console.log(`Username: ${repliedMessage.from.username}`);
                const receiver = repliedMessage.from.id.toString();
                const sender = ctx.message.from.id.toString();
                const amount = parseFloat(args[0]);
                if (amount > 0) {
                    await handleTransaction(receiver, sender, amount, ctx);
                } else {
                    await ctx.reply("Negative tips are not allowed. Generosity doesn't work that way!");
                }
            }
        } else {
            await ctx.reply("Oops, something went wrong with your transaction. Need help? Try /help");
        }
    } catch (error: any) {
        console.error('Unexpected error:', error);
        await ctx.reply(`Oops! ${error.message}`);
    }
}
export async function handleBalance(ctx: CommandContext<MyContext>) {
    try {
        const user = await User.init(ctx.message!.from.id.toString());
        if (user.connection !== undefined) {
            await user.connection.enable();
            const balance = await user.connection.getBalance();
            await ctx.reply(`Your balance is ${balance.balance} ${balance.currency}. Treat yourself!`);
        }
    } catch (error: any) {
        await ctx.reply(`Yikes! Something went wrong. Error code: ${error.code}. Try again later.`);
    }
}