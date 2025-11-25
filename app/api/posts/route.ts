// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, checkSupabaseConfig } from '@/lib/supabase/server'

export async function GET() {
  try {
    // 检查环境变量配置
    checkSupabaseConfig()
    
    const { data: posts, error } = await supabaseServer
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取博客列表错误:', error)
      return NextResponse.json(
        { error: '获取博客列表失败' },
        { status: 500 }
      )
    }

    return NextResponse.json(posts || [])
  } catch (error: any) {
    console.error('服务器错误:', error)
    return NextResponse.json(
      { error: error.message || '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 检查环境变量配置
    checkSupabaseConfig()
    
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: '请求体必须是有效的 JSON' },
        { status: 400 }
      )
    }
    
    const { title, content, excerpt, slug, is_published = false } = body

    // 验证必填字段
    if (!title?.trim() || !content?.trim() || !slug?.trim()) {
      return NextResponse.json(
        { error: '标题、内容和URL标识为必填项' },
        { status: 400 }
      )
    }

    // 检查 slug 是否唯一
    const { data: existingPost } = await supabaseServer
      .from('posts')
      .select('id')
      .eq('slug', slug.trim())
      .single()

    if (existingPost) {
      return NextResponse.json(
        { error: '该URL标识已被使用，请换一个' },
        { status: 400 }
      )
    }

    const { data: post, error } = await supabaseServer
      .from('posts')
      .insert([
        {
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt?.trim(),
          slug: slug.trim(),
          author_id: '00000000-0000-0000-0000-000000000000',
          author_name: '博主',
          is_published
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('创建博客错误:', error)
      return NextResponse.json(
        { error: `创建博客失败: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(post)
  } catch (error: any) {
    console.error('服务器错误:', error)
    return NextResponse.json(
      { error: error.message || '服务器内部错误' },
      { status: 500 }
    )
  }
}