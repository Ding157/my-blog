// app/tips/page.tsx (更新后的路径)
'use client'

import { useEffect, useState } from 'react'
import { useWeb3 } from '@/contexts/Web3Context'
import WalletConnect from '@/components/WalletConnect'
import Link from 'next/link' // 添加这行

interface Tip {
  id: string
  post_id: string
  from_address: string
  to_address: string
  amount: string
  currency: string
  transaction_hash: string
  message: string
  created_at: string
}

export default function TipsPage() {
  const { account } = useWeb3()
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const response = await fetch('/api/tips')
        if (response.ok) {
          const data = await response.json()
          setTips(data)
        }
      } catch (error) {
        console.error('获取打赏记录失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTips()
  }, [])

  const myTips = account ? tips.filter(tip => tip.from_address.toLowerCase() === account.toLowerCase()) : []

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
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">打赏记录</h1>
        
        {account ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">我的打赏记录</h2>
              {loading ? (
                <p className="text-gray-500">加载中...</p>
              ) : myTips.length === 0 ? (
                <p className="text-gray-500">暂无打赏记录</p>
              ) : (
                <div className="space-y-4">
                  {myTips.map((tip) => (
                    <div key={tip.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">金额: {tip.amount} {tip.currency}</p>
                          <p className="text-sm text-gray-600">收款人: {tip.to_address}</p>
                          {tip.message && <p className="text-sm text-gray-600">留言: {tip.message}</p>}
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>{new Date(tip.created_at).toLocaleDateString('zh-CN')}</p>
                          <a 
                            href={`https://etherscan.io/tx/${tip.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            查看交易
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">请连接钱包查看打赏记录</p>
          </div>
        )}
      </main>
    </div>
  )
}