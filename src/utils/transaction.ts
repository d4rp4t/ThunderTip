import { Context } from "grammy";

import User from "../classes/user";
import {
	CommandSyntaxError,
	InsufficientFundsError,
	ReceiverConnectionError,
	ReceiverNotConnectedError,
	SelfTipError,
	SenderConnectionError,
	SenderNotConnectedError,
	NwcPaymentError,
	NwcConnectionError,
} from "../errors";
import { TelegramUserId } from "../types";

export async function handleTransaction(
	receiverID: TelegramUserId,
	senderID: TelegramUserId,
	amount: number,
	ctx: Context,
) {
	const receiver = await User.init(receiverID);
	const sender = await User.init(senderID);
	const tipAmount = amount;

	receiverID == senderID &&
		(() => {
			throw new SelfTipError("");
		})();
	sender.isNew &&
		(() => {
			throw new SenderNotConnectedError("");
		})();
	receiver.isNew &&
		(() => {
			throw new ReceiverNotConnectedError("");
		})();
	!sender.connection &&
		(() => {
			throw new SenderConnectionError("");
		})();
	!receiver.connection &&
		(() => {
			throw new ReceiverConnectionError("");
		})();
	isNaN(tipAmount) &&
		(() => {
			throw new CommandSyntaxError("");
		})();

	if (!sender.username || sender.username !== "@" + ctx.message?.from.username) {
		if (ctx.message) {
			await sender.updateUsername("@" + ctx.message.from.username!);
		}
	}

	try {
		const senderBalance = await sender.connection?.nwcClient.getBalance();
		tipAmount > senderBalance.balance &&
			(() => {
				throw new InsufficientFundsError("");
			})();

		const invoice = await receiver.createInvoice(
			tipAmount,
			`Tip for ${receiver.username} from ${sender.username}`,
		);
		if (invoice !== undefined) {
			if (ctx.msg) {
				await ctx.reply(`You're tipping user ${receiver.username} with ${amount} sats`, {
					reply_parameters: { message_id: ctx.msg.message_id },
				});
			} else {
				await ctx.reply(`You're tipping user ${receiver.username} with ${amount} sats`);
			}

			await sender.payInvoice(invoice.invoice.paymentRequest);
		}
	} catch (error: any) {
		if (error instanceof NwcPaymentError || error instanceof NwcConnectionError) {
			throw error;
		}

		if (error?.message?.includes("balance") || error?.message?.includes("insufficient")) {
			throw new InsufficientFundsError("Insufficient funds for this transaction");
		}

		throw new NwcPaymentError(
			`Transaction failed: ${error?.message || "Unknown payment error"}`,
		);
	}
}
