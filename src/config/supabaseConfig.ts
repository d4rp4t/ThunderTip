import {createClient} from "@supabase/supabase-js";

import * as dotenv from "dotenv";
dotenv.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_KEY || !SUPABASE_URL) {
    throw new Error("Supabase not connected!");
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

export default supabase;