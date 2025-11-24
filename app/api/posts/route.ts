// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET() {
  try {
    const { data: posts, error } = await supabaseServer
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json(
      { error: '获取博客列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, excerpt, slug, is_published = false } = body

    // 这里应该从会话中获取用户信息
    // 简化版本，实际应该使用 Supabase Auth
    const { data: post, error } = await supabaseServer
      .from('posts')
      .insert([
        {
          title,
          content,
          excerpt,
          slug,
          author_id: 'temp-user-id', // 实际应该从 auth 获取
          author_name: '当前用户',
          is_published
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json(
      { error: '创建博客失败' },
      { status: 500 }
    )
  }
}