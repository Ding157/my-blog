// app/page.tsx
import Link from 'next/link'
import WalletConnect from '@/components/WalletConnect'
import ContractAdmin from '@/components/ContractAdmin'

interface BlogPost {
  id: string
  title: string
  excerpt?: string
  slug: string
  author_name: string
  created_at: string
  is_published: boolean
}

async function getPosts(): Promise<BlogPost[]> {
  try {
    console.log('获取博客列表...')
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    })
    
    console.log('响应状态:', res.status)
    
    if (!res.ok) {
      console.error('获取失败:', res.statusText)
      return []
    }
    
    const posts = await res.json()
    console.log('获取到的博客:', posts)
    return posts
  } catch (error) {
    console.error('获取博客错误:', error)
    return []
  }
}

export default async function Home() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">我的博客</h1>
            </div>
                      <ContractAdmin />
                     <WalletConnect />
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

      {/* 调试信息 */}
      {/* <div className="max-w-4xl mx-auto py-4 px-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
            调试信息: 共找到 {posts.length} 篇博客
          </p>
          {posts.map((post, index) => (
            <p key={post.id} className="text-xs text-yellow-600 mt-1">
              {index + 1}. {post.title} (发布状态: {post.is_published ? '已发布' : '未发布'})
            </p>
          ))}
        </div>
      </div> */}

      {/* 博客列表 */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {posts.filter(post => post.is_published).map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-2xl font-bold text-gray-900 hover:text-indigo-600 cursor-pointer">
                    {post.title}
                  </h2>
                </Link>
                
                {post.excerpt && (
                  <p className="mt-3 text-gray-600">{post.excerpt}</p>
                )}
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    作者: {post.author_name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                
                <div className="mt-4">
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    阅读更多 →
                  </Link>
                </div>
              </div>
            </article>
          ))}
          
          {posts.filter(post => post.is_published).length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">暂无已发布的博客文章</p>
              <p className="text-gray-400 text-sm mt-2">
                总文章数: {posts.length} (包括未发布的)
              </p>
              <Link 
                href="/create" 
                className="mt-4 inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
              >
                开始写第一篇博客
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}