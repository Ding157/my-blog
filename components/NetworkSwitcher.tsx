// components/NetworkSwitcher.tsx
'use client'

import { useState } from 'react'
import { useWeb3 } from '@/contexts/Web3Context'
import { switchNetwork, NETWORKS } from '@/utils/networks'

export default function NetworkSwitcher() {
  const { chainId, isConnected } = useWeb3()
  const [isSwitching, setIsSwitching] = useState(false)

  const getCurrentNetworkName = () => {
    if (!chainId) return '未知网络'
    
    const network = Object.values(NETWORKS).find(
      net => parseInt(net.chainId, 16) === chainId
    )
    return network ? network.chainName : `网络 ${chainId}`
  }

  const handleSwitchNetwork = async (networkKey: keyof typeof NETWORKS) => {
    if (!isConnected) {
      alert('请先连接钱包')
      return
    }

    setIsSwitching(true)
    try {
      await switchNetwork(networkKey)
      alert('网络切换成功！')
    } catch (error: any) {
      console.error('切换网络失败:', error)
      alert(`切换网络失败: ${error.message || '未知错误'}`)
    } finally {
      setIsSwitching(false)
    }
  }

  if (!isConnected) return null

  return (
    <div className="relative group">
      <button
        disabled={isSwitching}
        className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 disabled:opacity-50 flex items-center space-x-1"
      >
        <span>{getCurrentNetworkName()}</span>
        {isSwitching ? (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <span>▼</span>
        )}
      </button>
      
      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="p-2 space-y-1">
          <div className="px-3 py-2 text-xs text-gray-500 border-b">切换到网络</div>
          
          <button
            onClick={() => handleSwitchNetwork('SEPOLIA_TESTNET')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded flex items-center justify-between"
          >
            <span>Sepolia测试网</span>
            {chainId === parseInt(NETWORKS.SEPOLIA_TESTNET.chainId, 16) && (
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </button>
          
          <button
            onClick={() => handleSwitchNetwork('ETHEREUM_MAINNET')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded flex items-center justify-between"
          >
            <span>以太坊主网</span>
            {chainId === parseInt(NETWORKS.ETHEREUM_MAINNET.chainId, 16) && (
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </button>
          
          <button
            onClick={() => handleSwitchNetwork('AVALANCHE_MAINNET')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded flex items-center justify-between"
          >
            <span>Avalanche主网</span>
            {chainId === parseInt(NETWORKS.AVALANCHE_MAINNET.chainId, 16) && (
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </button>
          
          <button
            onClick={() => handleSwitchNetwork('AVALANCHE_FUJI')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded flex items-center justify-between"
          >
            <span>Avalanche测试网</span>
            {chainId === parseInt(NETWORKS.AVALANCHE_FUJI.chainId, 16) && (
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}