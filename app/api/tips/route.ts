// app/api/tips/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    let query = supabaseServer
      .from('tips')
      .select('*')
      .order('created_at', { ascending: false })

    if (postId) {
      query = query.eq('post_id', postId)
    }

    const { data: tips, error } = await query

    if (error) throw error

    return NextResponse.json(tips || [])
  } catch (error) {
    return NextResponse.json(
      { error: '获取打赏记录失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      post_id, 
      from_address, 
      to_address, 
      amount, 
      currency = 'ETH', 
      transaction_hash, 
      message 
    } = body

    // 验证必填字段
    if (!post_id || !from_address || !to_address || !amount || !transaction_hash) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    const { data: tip, error } = await supabaseServer
      .from('tips')
      .insert([
        {
          post_id,
          from_address,
          to_address,
          amount,
          currency,
          transaction_hash,
          message
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(tip)
  } catch (error) {
    return NextResponse.json(
      { error: '记录打赏失败' },
      { status: 500 }
    )
  }
}