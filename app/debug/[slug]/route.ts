// app/api/debug/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // 等待 params Promise 解析
    const resolvedParams = await params
    const slug = resolvedParams.slug

    console.log('🔍 API调试: 查询slug:', slug)

    // 方法1: 精确查询
    const { data: exactMatch, error: exactError } = await supabaseServer
      .from('posts')
      .select('*')
      .eq('slug', slug)

    // 方法2: 模糊查询（检查是否有类似的）
    const { data: allPosts } = await supabaseServer
      .from('posts')
      .select('slug, title')

    return NextResponse.json({
      success: true,
      debug: {
        requestedSlug: slug,
        exactMatch: exactMatch || [],
        exactError: exactError?.message,
        allSlugs: allPosts?.map(p => ({ slug: p.slug, title: p.title })),
        totalPosts: allPosts?.length
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
}