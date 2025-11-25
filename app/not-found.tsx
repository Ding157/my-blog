// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">博客不存在</h2>
        <p className="text-gray-500 mb-8">您访问的博客可能已被删除或不存在。</p>
        <Link 
          href="/"
          className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
        >
          返回首页
        </Link>
      </div>
    </div>
  )
}