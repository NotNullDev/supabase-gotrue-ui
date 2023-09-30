import { GoTrueClient } from '@supabase/gotrue-js'

const GOTRUE_URL = 'http://127.0.0.1:9999'

export const auth = new GoTrueClient({ url: GOTRUE_URL })
