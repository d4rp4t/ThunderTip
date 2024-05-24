import User from './User';
import {Context} from "grammy";

export async function handleTransaction(receiverID: string, senderID: string, amount: number, ctx: Context) {
    const receiver = await User.init(receiverID);
    const sender = await User.init(senderID);

    if (receiverID === senderID) {
        await ctx.reply("Why would you tip yourself?");
        return;
    }

    if (sender.isNew) {
        await ctx.reply("Sender isn't connected to the bot, so the transaction can't be processed. \nTip wasn't sent.");
        return;
    }

    if (receiver.isNew) {
        await ctx.reply("Receiver isn't connected to the bot, so the transaction can't be processed. \nTip wasn't sent.");
        return;
    }

    if (!sender.username || sender.username !== ("@" + ctx.message?.from.username)) {
        if (ctx.message) {
            await sender.updateUsername("@" + ctx.message.from.username!);
        }
    }

    const tipAmount = amount;
    if (isNaN(tipAmount)) {
        await ctx.reply('Syntax error. If this is a reply to someone\'s message, use /tip >amount<, e.g., /tip 10');
        return;
    }

    if (!sender.connection) {
        await ctx.reply("Sender's NWC connection error!");
        return;
    } else if (!receiver.connection) {
        await ctx.reply("Receiver's NWC connection error!");
        return;
    }

    await sender.connection.enable();
    const senderBalance = await sender.connection.getBalance();
    if (tipAmount > senderBalance.balance) {
        await ctx.reply("Insufficient funds in sender's account!");
        return;
    }

    const invoice = await receiver.createInvoice(tipAmount, `Tip for ${receiver.username} from ${sender.username}`);
    if (invoice !== undefined) {
        await ctx.reply(`You're tipping user ${receiver.username} with ${amount} sats`);
        await sender.payInvoice(invoice.paymentRequest);
    }
}
