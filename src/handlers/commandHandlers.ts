import {handleTransaction} from "../utils/transaction";
import User from '../utils/User';
import {CommandContext} from "grammy";
import {MyContext} from "../types/types";

export async function handleStart(ctx:CommandContext<MyContext>) {
    await ctx.reply('Hello! My name is ThunderTip! I am a Telegram bot created for sending fast and easy transactions in Telegram chat! For help, use the /help command.');
}

export async function handleHelp(ctx:CommandContext<MyContext>) {
    await ctx.reply('I am a Telegram bot created for sending fast and easy transactions in Telegram chat!\nTo connect your LN wallet using NWC use /connection\nTo make a tip use /tip >username< >amount<\nYou can also tip by replying to someone\'s message using /tip >amount<');
}

export async function handleConnection(ctx:CommandContext<MyContext>) {
    await ctx.conversation.enter("connection");
}

export async function handleTip(ctx:CommandContext<MyContext>) {
    try {
        const args = ctx.match.split(" ");
        if (args.length == 2) {
            const [tipReceiverString, tipAmountString] = args;
            const sender = ctx.message!.from.id.toString();
            const tipReceiver = await User.getIdByUsername(tipReceiverString);
            console.log(`${tipReceiverString} id is ${tipReceiver}`);
            if (!tipReceiver) {
                await ctx.reply(`${tipReceiverString} is not connected to this bot and can't receive your tip!`);
                return;
            }
            const tipAmount = parseFloat(tipAmountString);
            if (tipAmount > 0) {
                if (!tipReceiverString || isNaN(tipAmount)) {
                    await ctx.reply('Syntax error. Use /tip >username< >amount<, e.g., /tip @username 10');
                    return;
                }
                await handleTransaction(tipReceiver.toString(), sender, tipAmount, ctx);
            } else {
                await ctx.reply(`Negative tips? That's not how generosity works!`);
            }
        } else if ('reply_to_message' in ctx.message! && args.length == 1) {
            const repliedMessage = ctx.message.reply_to_message;
            if (repliedMessage && repliedMessage.from) {
                console.log(`Username: ${repliedMessage.from.username}`);
                const receiver = repliedMessage.from.id.toString();
                const sender = ctx.message.from.id.toString();
                const amount = parseFloat(args[0]);
                if (amount > 0) {
                    await handleTransaction(receiver, sender, amount, ctx);
                } else {
                    await ctx.reply(`Negative tips? That's not how generosity works!`);
                }
            }
        } else {
            await ctx.reply("Couldn't send the transaction. For guidance, use /help");
        }
    } catch (error: any) {
        await ctx.reply(`Something went wrong! Error code: ${error.code}. Please try again later.`);
    }
}

export async function handleBalance(ctx:CommandContext<MyContext>) {
    try {
        const user = await User.init(ctx.message!.from.id.toString());
        if (user.connection !== undefined) {
            await user.connection.enable();
            const balance = await user.connection.getBalance();
            await ctx.reply(`Your balance is ${balance.balance} ${balance.currency}`);
        }
    } catch (error: any) {
        await ctx.reply(`Oops! Something went wrong. Error code: ${error.code}`);
    }
}