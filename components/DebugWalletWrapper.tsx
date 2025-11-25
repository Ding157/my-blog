// components/DebugWalletWrapper.tsx
'use client'

import dynamic from 'next/dynamic'

// 使用动态导入，只在客户端加载调试组件
const DebugWallet = dynamic(() => import('./DebugWallet'), {
  ssr: false, // 禁用服务器端渲染
  loading: () => null // 加载时显示空内容
})

export default function DebugWalletWrapper() {
  if (process.env.NODE_ENV !== 'development') {
    return null // 生产环境不显示调试组件
  }
  
  return <DebugWallet />
}