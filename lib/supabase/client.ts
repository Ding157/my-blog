// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

// 提供默认值避免构建错误
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://default-url.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'default-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)