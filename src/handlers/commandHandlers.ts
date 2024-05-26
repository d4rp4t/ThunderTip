import { handleTransaction } from "../utils/transaction";
import User from '../utils/User';
import { CommandContext } from "grammy";
import { MyContext } from "../types/types";
import {negativeTipError, syntaxError, ThunderError, userNotConnectedError, zeroTipError} from "../utils/ThunderError";
import bot from "../config/botConfig";

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
        args.length==0&&(()=>{throw new ThunderError(syntaxError)})();
        if (args.length === 2) {
            const [tipReceiverString, tipAmountString] = args;
            const sender = ctx.message!.from.id.toString();
            const tipReceiver = await User.getIdByUsername(tipReceiverString);
            !tipReceiver && (() => {throw new ThunderError(userNotConnectedError(tipReceiverString))})();
            const tipAmount = parseFloat(tipAmountString);

            (tipAmount === 0) && (() => { throw new ThunderError(zeroTipError); })();
            (tipAmount < 0) && (() => { throw new ThunderError(negativeTipError); })();

            if (tipAmount > 0) {
                (!tipReceiverString || isNaN(tipAmount)) &&(()=>{throw new ThunderError(syntaxError)})();
                await handleTransaction(tipReceiver.toString(), sender, tipAmount, ctx);
            }

        } else if ('reply_to_message' in ctx.message! && args.length === 1) {
            const repliedMessage = ctx.message.reply_to_message;
            if (repliedMessage && repliedMessage.from) {
                const receiver = repliedMessage.from.id.toString();
                const sender = ctx.message.from.id.toString();
                const tipAmount = parseFloat(args[0]);

                (tipAmount === 0) && (() => { throw new ThunderError(zeroTipError); })();
                (tipAmount < 0) && (() => { throw new ThunderError(negativeTipError); })();

                if (tipAmount > 0) {
                    (isNaN(tipAmount)) &&(()=>{throw new ThunderError(syntaxError)})();
                    await handleTransaction(receiver, sender, tipAmount, ctx);
                }
            }
        } else {
            await ctx.reply("Oops, something went wrong with your transaction. Need help? Try /help");
        }
    } catch (error:any) {
        if (error.name==="ThunderError") {
            await ctx.reply(error.message)
        } else {
            const message = await bot.api.sendMessage(parseInt(process.env.OWNER_ID!), error.message);
        }
    }
}

export async function handleBalance(ctx: CommandContext<MyContext>) {
    try {
        const user = await User.init(ctx.message!.from.id.toString());
        if (user.connection !== undefined) {
            await user.connection.enable();
            const balance = await user.connection.getBalance();
            await ctx.reply(`Your balance is ${balance.balance} ${balance.currency}. Treat yourself!`);
            user.connection.close()
        }
    } catch (error: any) {
        await ctx.reply(`Yikes! Something went wrong. Try again later.`);
    }

}