import { webln } from "@getalby/sdk";
import { RequestInvoiceArgs } from "@webbtc/webln-types";
import * as crypto from 'node:crypto';
import supabase from '../config/supabaseConfig'
import {PASSWORD} from "../constants";
import {DatabaseConnectionError, EncryptionError, ReceiverNotConnectedError} from "../errors";

export default class User {
    public isNew: boolean;
    public connection?: webln.NostrWebLNProvider;
    public userID: string;
    public username?: string;

    private constructor(userID: string, isNew: boolean, nwcUrl?: string, username?: string) {
        this.userID = userID;
        this.isNew = isNew;
        this.username = username;
        if (!isNew && nwcUrl) {
            try {
                let decryptedNwcUrl = this.decryptNwcUri(nwcUrl);
                this.connection = new webln.NWC({ nostrWalletConnectUrl: decryptedNwcUrl });
            } catch (error: any) {
                console.error(error.message);
            }
        }
    }

    public static async init(userID: string): Promise<User> {
        const { data, error } = await supabase
            .from('users')
            .select('nwc_connect_link, username')
            .eq('telegram_user_id', userID);
        if (error) {
            throw new DatabaseConnectionError("");
        }

        if (data && data.length > 0) {
            const userData = data[0];
            if (userData && userData.nwc_connect_link && userData.username) {
                return new User(userID, false, userData.nwc_connect_link, userData.username);
            } else if (userData && userData.nwc_connect_link) {
                return new User(userID, false, userData.nwc_connect_link);
            }
        }
        return new User(userID, true);
    }

    static async getIdByUsername(username: string) {
        const { data, error } = await supabase
            .from('users')
            .select("telegram_user_id")
            .eq('username', username.toLowerCase());
        if (error) {
            throw new DatabaseConnectionError("");
        }
        if (data && data.length > 0) {
            return data[0].telegram_user_id;
        }
        throw new ReceiverNotConnectedError("");
    }

    async addNwcUrl(nwcUrl: string) {
        const encryptedNwcUrl = this.encryptNwcUri(nwcUrl);
        const { data, error } = await supabase
            .from('users')
            .insert([{ telegram_user_id: this.userID, nwc_connect_link: encryptedNwcUrl }])
            .select();
        if (error) {
            throw new DatabaseConnectionError("");
        }
        return { data, error };
    }

    async updateNwcUrl(nwcUrl: string) {
        const encryptedNwcUrl = this.encryptNwcUri(nwcUrl);
        const { data, error } = await supabase
            .from('users')
            .update({ nwc_connect_link: encryptedNwcUrl })
            .eq("telegram_user_id", this.userID)
            .select();
        if (error) {
            throw new DatabaseConnectionError("");
        }
        return { data, error };
    }

    async createInvoice(amount: number, memo: string) {
        const invoiceRequest: RequestInvoiceArgs = {
            amount: amount, defaultMemo: memo
        };
        if (this.connection !== undefined) {
            await this.connection.enable();
            return await this.connection.makeInvoice(invoiceRequest);
        }
    }

    async payInvoice(invoice: string) {
        if (this.connection !== undefined) {
            await this.connection.enable();
            await this.connection.sendPayment(invoice);
        }
    }

    async updateUsername(newUsername: string) {
        const {error } = await supabase
            .from('users')
            .update({ username: newUsername.toLowerCase() })
            .eq('telegram_user_id', this.userID)
            .select();
        if (error) {
            throw new DatabaseConnectionError("");
        }
        this.username = newUsername.toLowerCase();
    }

    private encryptNwcUri(text: string) {
        const key = crypto.createHash('sha256').update(PASSWORD + this.userID).digest();
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('base64') + ':' + encrypted.toString('base64');
    }

    private decryptNwcUri(text: string): string {
        const key = crypto.createHash('sha256').update(PASSWORD + this.userID).digest();
        const textParts = text.split(':');
        const ivString = textParts.shift();
        if (!ivString) {
            throw new EncryptionError("No initialization vector found!")
        }
        const iv = Buffer.from(ivString!, 'base64');
        const encryptedText = Buffer.from(textParts.join(':'), 'base64');
        const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
}