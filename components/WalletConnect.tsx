// components/WalletConnect.tsx
'use client'

import { useWeb3 } from '@/contexts/Web3Context'
import { useState, useEffect } from 'react'

export default function WalletConnect() {
  const { 
    account, 
    connectWallet, 
    disconnectWallet, 
    isConnected, 
    isLoading, 
    chainId, 
    error 
  } = useWeb3()
  
  const [showNetworkWarning, setShowNetworkWarning] = useState(false)
  const [hasEthereum, setHasEthereum] = useState(false) // 初始化为 false

  // 在 useEffect 中检查 ethereum，避免 hydration 不匹配
  useEffect(() => {
    setHasEthereum(typeof window !== 'undefined' && !!window.ethereum)
  }, [])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkName = (chainId: number | null) => {
    if (!chainId) return '未知网络'
    
    const networks: { [key: number]: string } = {
      1: '以太坊主网',
      5: 'Goerli测试网',
      11155111: 'Sepolia测试网',
      137: 'Polygon',
      56: 'BSC',
      42161: 'Arbitrum',
      43114: 'Avalanche C-Chain',
      43113: 'Avalanche Fuji测试网'
    }
    
    return networks[chainId] || `网络 ${chainId}`
  }

  const isSupportedNetwork = (chainId: number | null) => {
    if (!chainId) return false
    const supportedNetworks = [1, 5, 11155111, 43114, 43113]
    return supportedNetworks.includes(chainId)
  }

  const installMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank')
  }

  const switchToTestnet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) return
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      })
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Test Network',
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            nativeCurrency: {
              name: 'Sepolia ETH',
              symbol: 'ETH',
              decimals: 18
            },
            blockExplorerUrls: ['https://sepolia.etherscan.io']
          }]
        })
      }
    }
  }

  const handleConnect = async () => {
    if (chainId && !isSupportedNetwork(chainId)) {
      setShowNetworkWarning(true)
      return
    }
    
    await connectWallet()
  }

  return (
    <div className="flex items-center space-x-4">
      {/* 错误显示 */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
          {error}
          {error.includes('未检测到 MetaMask') && (
            <button 
              onClick={installMetaMask}
              className="ml-2 text-blue-600 underline"
            >
              安装 MetaMask
            </button>
          )}
        </div>
      )}
      
      {/* 网络警告 */}
      {showNetworkWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                网络不支持
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>当前网络: {getNetworkName(chainId)}</p>
                <p>建议切换到测试网进行体验</p>
              </div>
              <div className="mt-3 space-x-2">
                <button
                  onClick={switchToTestnet}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                >
                  切换到Sepolia测试网
                </button>
                <button
                  onClick={() => setShowNetworkWarning(false)}
                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isConnected ? (
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            <div className="font-medium">{formatAddress(account!)}</div>
            <div className={`text-xs ${isSupportedNetwork(chainId) ? 'text-green-600' : 'text-yellow-600'}`}>
              {getNetworkName(chainId)}
              {!isSupportedNetwork(chainId) && ' (不支持)'}
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
          >
            断开
          </button>
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded text-sm hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                连接中...
              </span>
            ) : (
              '连接钱包'
            )}
          </button>
          
          {/* 只在客户端渲染安装按钮 */}
          {!hasEthereum && (
            <button
              onClick={installMetaMask}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              安装 MetaMask
            </button>
          )}
          
          {chainId && !isSupportedNetwork(chainId) && (
            <div className="text-xs text-yellow-600">
              当前网络不支持，建议切换到测试网
            </div>
          )}
        </div>
      )}
    </div>
  )
}