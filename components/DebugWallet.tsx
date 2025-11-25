// components/DebugWallet.tsx
'use client'  // 添加这行，确保是客户端组件

import { useWeb3 } from '@/contexts/Web3Context'

export default function DebugWallet() {
  const { account, chainId, isConnected, error } = useWeb3()

  const checkWindowEthereum = () => {
    console.log('window.ethereum:', window.ethereum)
    console.log('isMetaMask:', window.ethereum?.isMetaMask)
    console.log('chainId:', window.ethereum?.chainId)
    console.log('selectedAddress:', window.ethereum?.selectedAddress)
  }

  // 在客户端安全地访问 window
  const ethereumType = typeof window !== 'undefined' ? typeof window.ethereum : 'undefined'
  const isMetaMask = typeof window !== 'undefined' ? window.ethereum?.isMetaMask?.toString() : 'undefined'

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">钱包调试信息</h3>
      <div className="space-y-1">
        <div>window.ethereum: {ethereumType}</div>
        <div>isMetaMask: {isMetaMask}</div>
        <div>连接状态: {isConnected ? '已连接' : '未连接'}</div>
        <div>账户: {account || '无'}</div>
        <div>链ID: {chainId || '无'}</div>
        {error && <div className="text-red-300">错误: {error}</div>}
      </div>
      <button 
        onClick={checkWindowEthereum}
        className="mt-2 bg-blue-500 px-2 py-1 rounded text-xs"
      >
        控制台输出
      </button>
    </div>
  )
}