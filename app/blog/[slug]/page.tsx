// app/blog/[slug]/page.tsx
// 在 app/blog/[slug]/page.tsx 中添加打赏功能
import TipButton from '@/components/TipButton'
import WalletConnect from '@/components/WalletConnect'
import ContractAdmin from '@/components/ContractAdmin'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt?: string
  slug: string
  author_name: string
  created_at: string
  updated_at: string
  is_published: boolean
}

// 添加这个函数来生成静态参数
export async function generateStaticParams() {
  try {
    const { data: posts } = await supabaseServer
      .from('posts')
      .select('slug')
      .eq('is_published', true)

    return posts?.map((post) => ({
      slug: post.slug,
    })) || []
  } catch (error) {
    return []
  }
}

// 添加动态渲染
export const dynamic = 'force-dynamic'

async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    console.log('🔍 正在获取博客，slug:', slug)
    
    if (!slug || slug === 'undefined') {
      console.error('❌ Slug 参数无效:', slug)
      return null
    }

    const { data: post, error } = await supabaseServer
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single()

    console.log('📊 查询结果:', { 
      post, 
      error: error?.message 
    })

    if (error) {
      console.error('❌ 数据库错误:', error)
      return null
    }

    if (!post) {
      console.log('❌ 未找到匹配的博客')
      return null
    }

    console.log('✅ 找到博客:', { 
      title: post.title, 
      is_published: post.is_published 
    })

    return post

  } catch (error) {
    console.error('💥 获取博客详情错误:', error)
    return null
  }
}

// 修改组件定义，使用 Promise 类型
export default async function BlogDetail(props: {
  params: Promise<{ slug: string }>
}) {
  // 等待 params Promise 解析
  const params = await props.params
  const { slug } = params
  
  console.log('🚀 页面加载，参数:', { slug, params })

  if (!slug) {
    console.error('❌ Slug 参数为空')
    notFound()
  }

  const post = await getPostBySlug(slug)

  if (!post) {
    console.log('❌ 博客不存在，显示404')
    notFound()
  }

  // 如果博客未发布，也显示404
  if (!post.is_published) {
    console.log('❌ 博客未发布，显示404')
    notFound()
  }

return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 hover:text-indigo-600">
                我的博客
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {/* 这些是客户端组件，会自己处理 hydration */}
              <ContractAdmin />
              <WalletConnect />
              <Link 
                href="/create" 
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                写博客
              </Link>
            </div>
          </div>
        </div>
      </nav>

      

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-8">
              <span>作者: {post.author_name}</span>
              <div className="space-x-4">
                <span>发布时间: {new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                {post.updated_at !== post.created_at && (
                  <span>更新于: {new Date(post.updated_at).toLocaleDateString('zh-CN')}</span>
                )}
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">支持作者</h3>
          <p className="text-gray-600 mt-1">如果觉得文章对你有帮助，可以打赏支持作者</p>
        </div>
        <TipButton 
        postId={post.id}
        authorAddress={process.env.NEXT_PUBLIC_AUTHOR_ADDRESS || '0x0000000000000000000000000000000000000000'}
        postTitle={post.title}
        />
      </div>
    </div>
            
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link 
                href="/"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← 返回首页
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}