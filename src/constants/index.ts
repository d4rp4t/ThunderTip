import * as dotenv from 'dotenv';
dotenv.config()

const BOT_TOKEN = process.env.BOT_TOKEN||"";
const SUPABASE_URL = process.env.SUPABASE_URL||"";
const SUPABASE_KEY = process.env.SUPABASE_KEY||"";
const PASSWORD = process.env.PASSWORD||"";
const OWNER_ID = process.env.OWNER_ID||"";

//ENVIRONMENTAL VARIABLE PORT MUST BE USED BECAUSE OF HEROKU SERVERS
const PORT = process.env.PORT||3000;
if(!BOT_TOKEN){
    throw new Error("Bot token missing!")
}
if(!SUPABASE_URL||!SUPABASE_KEY){
    throw new Error("Supabase creditentials missing!")
}

if (!PASSWORD) {
    throw new Error("No password variable provided");
}

export{
    BOT_TOKEN,
    SUPABASE_KEY,
    SUPABASE_URL,
    PASSWORD,
    OWNER_ID,
    PORT
}