import {Context} from "grammy";
import bot from "../config/botConfig";

class NegativeTipAmountError extends Error{
    constructor(message: string) {
        super(message);
    }
}

class ZeroValueTipError extends Error{
    constructor(msg:string) {
        super(msg);
    }
}

class CommandSyntaxError extends Error{
    constructor(message: string) {
        super(message);
    }

}

class ReceiverNotConnectedError extends Error{
    constructor(msg:string) {
        super(msg);
    }
}

class SenderNotConnectedError extends Error{
    constructor(message: string) {
        super(message);
    }
}

class SelfTipError extends Error{
    constructor(msg:string) {
        super(msg);
    }
}

class InsufficientFundsError extends Error{
    constructor(message: string) {
        super(message);
    }
}

class SenderConnectionError extends Error{
    constructor(message: string) {
        super(message);
    }
}

class ReceiverConnectionError extends Error{
    constructor(message: string) {
        super(message);
    }
}

class ConnectionRequestInGroupChatError extends Error{
    constructor(message: string) {
        super(message);
    }
}
class DatabaseConnectionError extends Error{
    constructor(message: string) {
        super(message);
    }
}
class EncryptionError extends Error{
    constructor(message: string) {
        super(message);
    }
}


async function handleError(error:Error, ctx:Context){
    error.constructor.name
    let message=  "";
    if(error instanceof NegativeTipAmountError){
        message = "Negative tips are not allowed. Generosity doesn't work that way!";
    }
    if(error instanceof ZeroValueTipError){
        message = "You're trying to send 0 satoshi? That doesn't make any sense!"
    }
    if(error instanceof CommandSyntaxError){
        message = "Oops, something went wrong! Please use the correct syntax: /tip <username> <amount>. For example: /tip @username 10"
    }
    if(error instanceof ReceiverNotConnectedError){
        message = `Sorry, but receiver hasn't connected to this bot. They can't receive your tip!`;
    }
    if(error instanceof SenderNotConnectedError){
        message = "Sender isn't connected to the bot, so the transaction can't be processed. \nTip wasn't sent.";
    }
    if(error instanceof SelfTipError){
        message = "Why would you tip yourself?"
    }
    if(error instanceof InsufficientFundsError){
        message = "Insufficient funds in sender's account!";
    }
    if (error instanceof SenderConnectionError){
        message = "It looks like you've encountered an NWC connection error!";
    }
    if (error instanceof ReceiverConnectionError){
        message = "Receiver's NWC connection error!";
    }
    if (error instanceof ConnectionRequestInGroupChatError){
        message = "Hey! For connection settings, DM me!. The NWC URI is sensitive data."
    }
    if(error instanceof DatabaseConnectionError){
        message = "There is something wrong with database! Try again later pls"
    }
    if(message){
        await ctx.reply(message)
    } else{
        await ctx.reply(`Yikes! Something went wrong. Try again later.`);
        await bot.api.sendMessage(parseInt(process.env.OWNER_ID!), error.message);
    }
}

export {
    NegativeTipAmountError,
    ZeroValueTipError,
    CommandSyntaxError,
    ReceiverNotConnectedError,
    SenderNotConnectedError,
    SelfTipError,
    InsufficientFundsError,
    ReceiverConnectionError,
    SenderConnectionError,
    ConnectionRequestInGroupChatError,
    DatabaseConnectionError,
    EncryptionError,
    handleError
}