// contexts/Web3Context.tsx
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ethers } from 'ethers'

interface Web3ContextType {
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  account: string | null
  chainId: number | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isConnected: boolean
  isLoading: boolean
  error: string | null
}

// 在 Web3Context.tsx 中添加这个函数
const getMetaMaskProvider = () => {
  if (typeof window.ethereum === 'undefined') {
    return null
  }
  
  // 如果是多提供商，找到 MetaMask
  if (window.ethereum.providers) {
    return window.ethereum.providers.find((p: any) => p.isMetaMask) || window.ethereum
  }
  
  // 如果是单个提供商，检查是否是 MetaMask
  return window.ethereum.isMetaMask ? window.ethereum : null
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

declare global {
  interface Window {
    ethereum?: any
  }
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const detectMetaMask = () => {
    if (typeof window.ethereum === 'undefined') {
      setError('未检测到 MetaMask，请安装 MetaMask 扩展')
      return false
    }
    
    if (!window.ethereum.isMetaMask) {
      setError('检测到非 MetaMask 钱包，请使用 MetaMask')
      return false
    }
    
    setError(null)
    return true
  }

  const connectWallet = async () => {
      const ethereum = getMetaMaskProvider()
  if (!ethereum) {
    setError('请安装 MetaMask 钱包')
    return
  }
    setIsLoading(true)
    setError(null)
    
    try {
      // 检测 MetaMask
      if (!detectMetaMask()) {
        return
      }

      console.log('开始连接钱包...', window.ethereum)

      // 请求账户连接
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      console.log('获取到账户:', accounts)

      if (!accounts || accounts.length === 0) {
        throw new Error('用户拒绝了连接请求')
      }

      const web3Provider = new ethers.BrowserProvider(window.ethereum)
      const web3Signer = await web3Provider.getSigner()
      const network = await web3Provider.getNetwork()

      console.log('网络信息:', network)
      console.log('签名者:', web3Signer)

      setProvider(web3Provider)
      setSigner(web3Signer)
      setAccount(accounts[0])
      setChainId(Number(network.chainId))

      console.log('钱包连接成功:', accounts[0])

      // 设置事件监听器
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        console.log('账户变化:', accounts)
        setAccount(accounts[0] || null)
        if (!accounts[0]) {
          setProvider(null)
          setSigner(null)
          setChainId(null)
        }
      })

      window.ethereum.on('chainChanged', (chainId: string) => {
        console.log('链变化:', chainId)
        setChainId(Number(chainId))
        window.location.reload()
      })

    } catch (error: any) {
      console.error('连接钱包失败:', error)
      
      let errorMessage = '连接钱包失败'
      
      if (error.code === 4001) {
        errorMessage = '用户拒绝了连接请求'
      } else if (error.code === -32002) {
        errorMessage = '连接请求已发送，请检查 MetaMask 弹窗'
      } else if (error.message.includes('User rejected')) {
        errorMessage = '用户拒绝了连接请求'
      } else {
        errorMessage = `连接失败: ${error.message || '未知错误'}`
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    setProvider(null)
    setSigner(null)
    setAccount(null)
    setChainId(null)
    setError(null)
    console.log('钱包已断开连接')
  }

const checkConnection = async () => {
  if (!detectMetaMask()) {
    return
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    })
    
    console.log('检查已连接账户:', accounts)
    
    if (accounts.length > 0) {
      console.log('检测到已连接的钱包:', accounts[0])
      setAccount(accounts[0])
      
      const web3Provider = new ethers.BrowserProvider(window.ethereum)
      const web3Signer = await web3Provider.getSigner()
      const network = await web3Provider.getNetwork()
      
      setProvider(web3Provider)
      setSigner(web3Signer)
      setChainId(Number(network.chainId))
    } else {
      console.log('钱包已锁定或未选择账户')
      // 重置状态
      setProvider(null)
      setSigner(null)
      setAccount(null)
    }
  } catch (error) {
    console.error('检查连接状态失败:', error)
    // 可能是钱包锁定状态
    setProvider(null)
    setSigner(null)
    setAccount(null)
  }
}

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <Web3Context.Provider value={{
      provider,
      signer,
      account,
      chainId,
      connectWallet,
      disconnectWallet,
      isConnected: !!account && !!signer,
      isLoading,
      error
    }}>
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}