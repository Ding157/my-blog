// app/api/test-publish/route.ts
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST() {
  try {
    const testData = {
      title: '测试博客 ' + Date.now(),
      content: '这是一篇测试博客的内容',
      slug: 'test-blog-' + Date.now(),
      excerpt: '测试博客摘要',
      is_published: true
    }

    console.log('🧪 测试发布:', testData)

    const { data, error } = await supabaseServer
      .from('posts')
      .insert([testData])
      .select()
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error.details,
        code: error.code
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: '测试发布成功'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}