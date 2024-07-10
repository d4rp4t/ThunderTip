import {createClient} from "@supabase/supabase-js";
import {SUPABASE_KEY, SUPABASE_URL} from "../constants";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
if(!supabase){
    throw new Error("Couldn't estabilish connection with database. Panicking.")
}
export default supabase;