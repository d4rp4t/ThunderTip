import * as crypto from "node:crypto";

import { LN, LNClient } from "@getalby/sdk";

import { PASSWORD } from "../config";
import {
	EncryptionError,
	ReceiverNotConnectedError,
	NwcPaymentError,
	NwcConnectionError,
} from "../errors";
import db from "../db";
import {
	EncryptedConnectionUri,
	NwcConnection,
	PlaintextConnectionUri,
	TelegramUserId,
	Username,
} from "../types";

export default class User {
	public isNew: boolean;
	public connection?: LNClient;
	public userID: TelegramUserId;
	public username?: Username;

	private constructor(
		userID: TelegramUserId,
		isNew: boolean,
		nwcUrl?: EncryptedConnectionUri,
		username?: Username,
	) {
		this.userID = userID;
		this.isNew = isNew;
		this.username = username;
		if (!isNew && nwcUrl) {
			try {
				const decryptedNwcUrl = this.decryptNwcUri(nwcUrl);
				this.connection = new LN(decryptedNwcUrl);
			} catch (error: any) {
				console.error(error.message);
			}
		}
	}

	public static async init(userId: TelegramUserId): Promise<User> {
		const doc = await db.getById(userId);
		if (doc) {
			return new User(userId, false, doc.nwcConnectionLink, doc.username);
		}

		return new User(userId, true);
	}

	static async getIdByUsername(username: string): Promise<TelegramUserId> {
		const userId = await db.getUserIdByUsername(username);
		if (!userId) {
			throw new ReceiverNotConnectedError("");
		}
		return userId as TelegramUserId;
	}

	async addNwcUrl(nwcUrl: PlaintextConnectionUri): Promise<NwcConnection> {
		const encryptedNwcUrl = this.encryptNwcUri(nwcUrl);
		return db.userCreate(this.userID, encryptedNwcUrl);
	}

	async updateNwcUrl(nwcUrl: PlaintextConnectionUri): Promise<NwcConnection> {
		const encryptedNwcUrl = this.encryptNwcUri(nwcUrl);
		return db.updateNwcUrl(this.userID, encryptedNwcUrl);
	}

	async createInvoice(amount: number, memo: string) {
		if (this.connection !== undefined) {
			try {
				return await this.connection.requestPayment(
					{ satoshi: amount },
					{ description: memo },
				);
			} catch (error: any) {
				const errorMessage = error?.message || "Failed to create invoice";
				throw new NwcPaymentError(`Invoice creation failed: ${errorMessage}`);
			}
		} else {
			throw new NwcConnectionError("No NWC connection available for invoice creation");
		}
	}

	async payInvoice(invoice: string) {
		if (this.connection !== undefined) {
			try {
				await this.connection.pay(invoice);
			} catch (error: any) {
				const errorMessage = error?.message || "Payment failed";
				throw new NwcPaymentError(`Payment failed: ${errorMessage}`);
			}
		} else {
			throw new NwcConnectionError("No NWC connection available for payment");
		}
	}

	async updateUsername(newUsername: string): Promise<void> {
		await db.updateUsername(this.userID, newUsername);
		this.username = newUsername.toLowerCase() as Username;
	}

	private encryptNwcUri(text: PlaintextConnectionUri) {
		const key = crypto
			.createHash("sha256")
			.update(PASSWORD + this.userID)
			.digest();
		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv("aes-256-ctr", key, iv);
		let encrypted = cipher.update(text);
		encrypted = Buffer.concat([encrypted, cipher.final()]);
		return iv.toString("base64") + ":" + encrypted.toString("base64");
	}

	private decryptNwcUri(text: EncryptedConnectionUri): string {
		const key = crypto
			.createHash("sha256")
			.update(PASSWORD + this.userID)
			.digest();
		const textParts = text.split(":");
		const ivString = textParts.shift();
		if (!ivString) {
			throw new EncryptionError("No initialization vector found!");
		}
		const iv = Buffer.from(ivString!, "base64");
		const encryptedText = Buffer.from(textParts.join(":"), "base64");
		const decipher = crypto.createDecipheriv("aes-256-ctr", key, iv);
		let decrypted = decipher.update(encryptedText);
		decrypted = Buffer.concat([decrypted, decipher.final()]);
		return decrypted.toString();
	}
}
