// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('API: 获取博客列表')
    
    const { data: posts, error } = await supabaseServer
      .from('posts')
      .select('*')
      .eq('is_published', true)  // 确保只获取已发布的
      .order('created_at', { ascending: false })

    if (error) {
      console.error('API错误:', error)
      throw error
    }

    console.log('API返回数据:', posts)
    return NextResponse.json(posts)
  } catch (error) {
    console.error('API服务器错误:', error)
    return NextResponse.json(
      { error: '获取博客列表失败' },
      { status: 500 }
    )
  }
}