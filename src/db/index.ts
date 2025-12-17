import {
	EncryptedConnectionUri,
	NwcConnection,
	NwcConnectionDbRecord,
	TelegramUserId,
	Username,
} from "../types";

import { TABLE_NAME } from "../config";

import { queryBuilder } from "./query-builder";

const dbService = () => ({
	async userCreate(
		userId: TelegramUserId,
		nwcUrl: string,
		username?: string,
	): Promise<NwcConnection> {
		const now = new Date();
		const insertData: Partial<NwcConnectionDbRecord> = {
			telegram_user_id: userId,
			nwc_connection_link: nwcUrl,
			created_at: now,
		};

		if (username) {
			insertData.username = username;
		}

		const [record] = await queryBuilder<NwcConnectionDbRecord>(TABLE_NAME)
			.insert(insertData)
			.returning("*");

		return translateToNwcConnection(record);
	},

	async getById(userId: TelegramUserId): Promise<NwcConnection | null> {
		const record = await queryBuilder<NwcConnectionDbRecord>(TABLE_NAME)
			.where({ telegram_user_id: userId })
			.first();

		return record ? translateToNwcConnection(record) : null;
	},

	async getUserIdByUsername(username: string): Promise<TelegramUserId | null> {
		const record = await queryBuilder<NwcConnectionDbRecord>(TABLE_NAME)
			.where({ username: username.toLowerCase() })
			.select("telegram_user_id")
			.first();

		return record ? (record.telegram_user_id as TelegramUserId) : null;
	},

	async updateNwcUrl(userId: TelegramUserId, nwcUrl: string): Promise<NwcConnection> {
		const [record] = await queryBuilder<NwcConnectionDbRecord>(TABLE_NAME)
			.where({ telegram_user_id: userId })
			.update({ nwc_connection_link: nwcUrl })
			.returning("*");

		return translateToNwcConnection(record);
	},

	async updateUsername(userId: TelegramUserId, username: string): Promise<NwcConnection> {
		const [record] = await queryBuilder<NwcConnectionDbRecord>(TABLE_NAME)
			.where({ telegram_user_id: userId })
			.update({ username: username.toLowerCase() })
			.returning("*");

		return translateToNwcConnection(record);
	},

	async userDelete(userId: TelegramUserId): Promise<boolean> {
		try {
			await queryBuilder<NwcConnectionDbRecord>(TABLE_NAME)
				.where({ telegram_user_id: userId })
				.del();
			return true;
		} catch (_) {
			return false;
		}
	},
});

const translateToNwcConnection = (obj: NwcConnectionDbRecord): NwcConnection => {
	return {
		telegramUID: obj.telegram_user_id as TelegramUserId,
		createdAt: obj.created_at,
		nwcConnectionLink: obj.nwc_connection_link as EncryptedConnectionUri,
		username: obj.username as Username,
	};
};

export default dbService();
