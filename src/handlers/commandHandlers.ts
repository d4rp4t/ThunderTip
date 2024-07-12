import { handleTransaction } from "../utils/transaction";
import User from '../classes/User';
import { CommandContext } from "grammy";
import { MyContext } from "../types";
import {
    CommandSyntaxError,
    handleError,
    NegativeTipAmountError,
    ReceiverNotConnectedError,
    SenderConnectionError,
    ZeroValueTipError
} from "../errors"


export async function handleStart(ctx: CommandContext<MyContext>) {
    await ctx.reply("Hey there! I'm ThunderTip, your friendly Telegram bot for quick and easy bitcoin transactions, using Nostr Wallet Connect. Need help? Just hit /help.");
}

export async function handleHelp(ctx: CommandContext<MyContext>) {
    await ctx.reply("Hey! I'm your go-to bot for fast bitcoin transactions in Telegram chats.\n\n" +
        "Commands:\n\n" +
        "• Hook up your NWC wallet: /connection\n" +
        "• Throw a tip to a user: /tip <username> <amount>\n" +
        "• Tip by replying to a message: /tip <amount>\n" +
        "• For more info about Nostr wallet connect use /nwc \n\n " +
        "Wanna keep me running? Feel free to send tips for bot maintenance (servers, databases, and all that jazz).");
}

export async function handleNwcInfo(ctx:CommandContext<MyContext>){
    await ctx.reply("NWC or Nostr Wallet Connect is standarized protocol allowing developers to create secure and non-custoidal lightning apps in standarized way. Connection usually works via conection link generated by user in his wallet. Read more at https://github.com/getAlby/nostr-wallet-connect")
}

export async function handleConnection(ctx: CommandContext<MyContext>) {
    try{
        await ctx.conversation.enter("connection");
    }
    catch(err:any){
       await handleError(err, ctx)
    }

}

export async function handleTip(ctx: CommandContext<MyContext>) {
    try {
        const args = ctx.match.split(" ");
        args.length==0&&(()=>{throw new CommandSyntaxError("")})();
        if (args.length === 2) {
            const [tipReceiverString, tipAmountString] = args;
            const sender = ctx.message!.from.id.toString();
            const tipReceiver = await User.getIdByUsername(tipReceiverString);
            !tipReceiver && (() => {throw new ReceiverNotConnectedError("")})();
            const tipAmount = parseFloat(tipAmountString);

            (tipAmount === 0) && (() => { throw new ZeroValueTipError(""); })();
            (tipAmount < 0) && (() => { throw new NegativeTipAmountError(""); })();

            if (tipAmount > 0) {
                (!tipReceiverString || isNaN(tipAmount)) &&(()=>{throw new CommandSyntaxError("")})();
                await handleTransaction(tipReceiver.toString(), sender, tipAmount, ctx);
            }

        }
        else if ('reply_to_message' in ctx.message! && args.length === 1) {
            const repliedMessage = ctx.message.reply_to_message;
            if (repliedMessage && repliedMessage.from) {
                const receiver = repliedMessage.from.id.toString();
                const sender = ctx.message.from.id.toString();
                const tipAmount = parseFloat(args[0]);

                (tipAmount === 0) && (() => { throw new ZeroValueTipError(""); })();
                (tipAmount < 0) && (() => { throw new NegativeTipAmountError(""); })();

                if (tipAmount > 0) {
                    (isNaN(tipAmount)) &&(()=>{throw new CommandSyntaxError("")})();
                    await handleTransaction(receiver, sender, tipAmount, ctx);
                }
            }
        }
        else {
           throw new CommandSyntaxError("");
        }
    }
    catch (error:any) {
        await handleError(error, ctx)
    }
}

export async function handleBalance(ctx: CommandContext<MyContext>) {
    try {
        const user = await User.init(ctx.message!.from.id.toString());
        (!user.connection)&&(()=>{throw new SenderConnectionError("")})();
        await user.connection.enable();
        const balance = await user.connection.getBalance();
        await ctx.reply(`Your balance is ${balance.balance} ${balance.currency}. Treat yourself!`);
        user.connection.close()
    }
    catch (error: any) {
        await handleError(error, ctx)
    }
}