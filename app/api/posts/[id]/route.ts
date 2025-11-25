// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 等待 params Promise 解析
    const resolvedParams = await params
    const id = resolvedParams.id

    const { data: post, error } = await supabaseServer
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !post) {
      return NextResponse.json(
        { error: '博客不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 等待 params Promise 解析
    const resolvedParams = await params
    const id = resolvedParams.id

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
      .eq('id', id)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 等待 params Promise 解析
    const resolvedParams = await params
    const id = resolvedParams.id

    const { error } = await supabaseServer
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '删除博客失败' },
      { status: 500 }
    )
  }
}