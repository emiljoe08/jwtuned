import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ikxfmesesuevmibieach.supabase.co'
const SUPABASE_KEY = 'sb_publishable_TXI92hXjul9on9pNGI5Mzw_aCYow8oN'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)