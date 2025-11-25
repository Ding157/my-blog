// app/env-check/page.tsx
export default function EnvCheck() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">环境变量检查</h1>
      <div className="space-y-2">
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{' '}
          {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置'}
        </div>
        <div>
          <strong>SUPABASE_SERVICE_ROLE_KEY:</strong>{' '}
          {process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已设置' : '❌ 未设置'}
        </div>
        <div>
          <strong>NEXT_PUBLIC_BASE_URL:</strong>{' '}
          {process.env.NEXT_PUBLIC_BASE_URL || '未设置'}
        </div>
      </div>
    </div>
  )
}