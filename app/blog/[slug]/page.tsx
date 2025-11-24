// app/blog/[slug]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface BlogPost {
  id: string
  title: string
  content: string
  author_name: string
  created_at: string
  updated_at: string
}

async function getPost(slug: string): Promise<BlogPost | null> {
  // 这里需要通过 slug 查找对应的文章
  // 简化实现，实际应该通过 API 根据 slug 查询
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts`, {
    cache: 'no-store'
  })
  
  if (!res.ok) return null
  
  const posts: BlogPost[] = await res.json()
  const post = posts.find(p => p.slug === slug)
  
  return post || null
}

export default async function BlogDetail({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const post = await getPost(params.slug)

  if (!post) {
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
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }}
              />
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link 
                href="/"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
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