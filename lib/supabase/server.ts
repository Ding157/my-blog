// lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js'

// 在构建时提供默认值，避免立即抛出错误
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// 创建客户端，但在环境变量缺失时返回一个安全的客户端
export const supabaseServer = createClient(
  supabaseUrl || 'https://default-url.supabase.co', // 提供默认值
  supabaseServiceKey || 'default-service-key', // 提供默认值
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
)

// 添加环境变量检查函数
export function checkSupabaseConfig() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('缺少 NEXT_PUBLIC_SUPABASE_URL 环境变量')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('缺少 SUPABASE_SERVICE_ROLE_KEY 环境变量')
  }
}