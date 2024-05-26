import User from './User';
import {Context} from "grammy";
import {ThunderError} from "./ThunderError";

export async function handleTransaction(receiverID: string, senderID: string, amount: number, ctx: Context) {
    const receiver = await User.init(receiverID);
    const sender = await User.init(senderID);

     (receiverID === senderID) && (() => {
         throw new ThunderError("Why would you tip yourself?");
     })();

    sender.isNew && (()=> {
        throw new ThunderError("Sender isn't connected to the bot, so the transaction can't be processed. \nTip wasn't sent.");
    })();

    (receiver.isNew) && (()=>{
        throw new ThunderError("Receiver isn't connected to the bot, so the transaction can't be processed. \nTip wasn't sent.");
    })()


    if (!sender.username || sender.username !== ("@" + ctx.message?.from.username)) {
        if (ctx.message) {
            await sender.updateUsername("@" + ctx.message.from.username!);
        }
    }

    const tipAmount = amount;

    (isNaN(tipAmount)) && (() => { throw new ThunderError('Syntax error. If this is a reply to someone\'s message, use /tip >amount<, e.g., /tip 10'); })();
    (!sender.connection) && (() => { throw new ThunderError("Sender's NWC connection error!"); })();
    (!receiver.connection) && (() => { throw new ThunderError("Receiver's NWC connection error!"); })();


    await sender.connection!.enable();
    const senderBalance = await sender.connection!.getBalance();

   (tipAmount > senderBalance.balance) && (()=>{throw new ThunderError("Insufficient funds in sender's account!");})()

    const invoice = await receiver.createInvoice(tipAmount, `Tip for ${receiver.username} from ${sender.username}`);
    if (invoice !== undefined) {
        await ctx.reply(`You're tipping user ${receiver.username} with ${amount} sats`);
        await sender.payInvoice(invoice.paymentRequest);
    }
}
