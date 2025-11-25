// app/debug/posts/page.tsx (更新版本)
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'

interface BlogPost {
  id: string
  title: string
  slug: string
  is_published: boolean
  created_at: string
  content: string
}

async function getAllPosts(): Promise<BlogPost[]> {
  const { data: posts } = await supabaseServer
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  return posts || []
}

export default async function DebugPosts() {
  const posts = await getAllPosts()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">博客调试页面</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 博客列表 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">数据库中的博客列表</h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{post.title}</h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Slug:</span> 
                          <code className="ml-2 bg-gray-100 px-1 rounded">{post.slug}</code>
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">ID:</span> 
                          <code className="ml-2 bg-gray-100 px-1 rounded text-xs">{post.id}</code>
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">内容长度:</span> 
                          {post.content.length} 字符
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        post.is_published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.is_published ? '已发布' : '未发布'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(post.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      访问详情页
                    </Link>
                    <a 
                      href={`/api/debug/${post.slug}`}
                      target="_blank"
                      className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      API调试
                    </a>
                    <span className="text-sm text-gray-500 self-center">
                      链接: /blog/{post.slug}
                    </span>
                  </div>
                </div>
              ))}
              
              {posts.length === 0 && (
                <p className="text-gray-500">数据库中暂无博客</p>
              )}
            </div>
          </div>

          {/* 调试信息 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">调试信息</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">测试步骤:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>点击"API调试"链接检查数据查询</li>
                  <li>点击"访问详情页"测试路由</li>
                  <li>查看浏览器控制台输出</li>
                  <li>检查网络请求状态</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">常见问题:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Slug 包含空格或特殊字符</li>
                  <li>数据库查询条件不匹配</li>
                  <li>RLS 策略限制</li>
                  <li>路由参数解析问题</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link 
            href="/"
            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}