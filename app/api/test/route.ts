// app/api/test/route.ts
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET() {
  try {
    // 测试连接
    const { data, error } = await supabaseServer
      .from('posts')
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: 'Supabase 连接失败'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase 连接正常',
      data
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      details: '服务器错误'
    })
  }
}