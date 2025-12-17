import { LN } from "@getalby/sdk";

import {
	MyContext,
	MyConversation,
	PlaintextConnectionUri,
	TelegramUserId,
} from "../types";
import User from "../classes/user";
import { handleError, NwcValidationError, InvalidNwcUrlError } from "../errors";
import db from "../db";

async function validateNwcConnection(nwcUrl: string): Promise<void> {
	try {
		if (!nwcUrl || !nwcUrl.startsWith("nostr+walletconnect://")) {
			throw new InvalidNwcUrlError(
				"Invalid NWC URL format. URL must start with 'nostr+walletconnect://'",
			);
		}

		const ln = new LN(nwcUrl);

		try {
			await ln.requestPayment({ satoshi: 1 });
		} catch (error: any) {
			const errorMessage = error?.message || "Unknown NWC connection error";

			if (
				errorMessage.includes("Invalid") ||
				errorMessage.includes("format") ||
				errorMessage.includes("malformed")
			) {
				throw new InvalidNwcUrlError(`Invalid NWC URL: ${errorMessage}`);
			} else if (
				errorMessage.includes("connect") ||
				errorMessage.includes("network") ||
				errorMessage.includes("timeout")
			) {
				throw new NwcValidationError(`Connection failed: ${errorMessage}`);
			} else {
				throw new NwcValidationError(`NWC validation failed: ${errorMessage}`);
			}
		}
	} catch (error: any) {
		if (error instanceof InvalidNwcUrlError || error instanceof NwcValidationError) {
			throw error;
		}

		const errorMessage = error?.message || "Unknown error during NWC validation";
		throw new NwcValidationError(`NWC validation failed: ${errorMessage}`);
	}
}

export async function handleConnect(ctx: MyContext, conversation: MyConversation) {
	const user = await User.init(ctx.message?.from.id.toString()!);
	if (user.isNew) {
		await ctx.reply("To connect your wallet, send your NWC wallet connecting URI", {
			reply_markup: {
				force_reply: true,
				input_field_placeholder: "Reply with your NWC connect URI",
			},
		});

		const { message } = await conversation.wait();
		if (message && message.text) {
			try {
				await validateNwcConnection(message.text);

				await user.addNwcUrl(message.text as PlaintextConnectionUri);
				await ctx.reply("Wallet connected successfully!");
			} catch (error: any) {
				await handleError(error, ctx);
			}
		}
		if (message && message.from) {
			await user.updateUsername("@" + message.from.username!);
		}
	} else {
		await ctx.reply(
			"You're already connected. If you want to change your NWC connection URI, use the update option.",
		);
	}
}

export async function handleUpdate(ctx: MyContext, conversation: MyConversation) {
	const user = await User.init(ctx.message!.from.id.toString());
	if (user.connection) {
		await ctx.reply("Please provide your new NWC URL.");
		const { message } = await conversation.wait();

		if (message && message.text) {
			try {
				await validateNwcConnection(message.text);

				await user.updateNwcUrl(message.text as PlaintextConnectionUri);
				await ctx.reply("Connection URL updated successfully!");
			} catch (error: any) {
				await handleError(error, ctx);
			}
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
	await ctx.reply(
		'Do you really want to delete your NWC connection?\nNo funds will be lost.\nIf yes, text me "yes", if not, send anything else.',
	);
	const { message } = await conversation.wait();
	if (message && message.text === "yes") {
		try {
			await db.userDelete(message.from.id.toString() as TelegramUserId);
			await ctx.reply("Deleted. I hope to see you back!");
		} catch (error) {
			await ctx.reply("Error occurred! Please try again later.");
		}
	} else {
		await ctx.reply("Deletion aborted. What a relief!");
	}
}
