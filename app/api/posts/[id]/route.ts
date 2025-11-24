// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: post, error } = await supabaseServer
      .from('posts')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json(
      { error: '博客不存在' },
      { status: 404 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, content, excerpt, is_published } = body

    const { data: post, error } = await supabaseServer
      .from('posts')
      .update({
        title,
        content,
        excerpt,
        is_published,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json(
      { error: '更新博客失败' },
      { status: 500 }
    )
  }
}