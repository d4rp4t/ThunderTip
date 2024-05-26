export class ThunderError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, ThunderError.prototype);
        this.name = "ThunderError";
    }
}

export const syntaxError = `Oops, something went wrong! Please use the correct syntax: /tip <username> <amount>. For example: /tip @username 10`
export const userNotConnectedError = (username:string)=>{
   return `Sorry, ${username} hasn't connected to this bot. They can't receive your tip!`;
}
export const negativeTipError = "Negative tips are not allowed. Generosity doesn't work that way!";
export const zeroTipError = `You're trying to send 0 satoshi? That doesn't make any sense!`;

