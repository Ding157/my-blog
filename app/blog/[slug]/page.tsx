// app/blog/[slug]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import ContractAdmin from '@/components/ContractAdmin'
import WalletConnect from '@/components/WalletConnect'
import TipButton from '@/components/TipButton'

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

async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const { data: post, error } = await supabaseServer
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !post) {
      return null
    }

    return post
  } catch (error) {
    return null
  }
}

export default async function BlogDetail({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // 等待 params Promise 解析
  const resolvedParams = await params
  const slug = resolvedParams.slug
  
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // 如果博客未发布，也显示404
  if (!post.is_published) {
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
            
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>
            
            {/* 打赏区域 */}
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

            <div className="mt-6">
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