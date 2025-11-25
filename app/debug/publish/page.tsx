// app/debug/publish/page.tsx
'use client'

export default function DebugPublish() {
  const testPublish = async () => {
    try {
      const response = await fetch('/api/test-publish', {
        method: 'POST'
      })
      const result = await response.json()
      alert(JSON.stringify(result, null, 2))
    } catch (error) {
      alert('测试失败: ' + error)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">发布功能调试</h1>
      <button 
        onClick={testPublish}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        测试发布功能
      </button>
    </div>
  )
}