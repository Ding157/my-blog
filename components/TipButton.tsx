// components/TipButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { useWeb3 } from '@/contexts/Web3Context'
import { ethers } from 'ethers'
import { BeggingContract } from '@/utils/contract'

interface TipButtonProps {
  postId: string
  authorAddress: string
  postTitle: string
}

export default function TipButton({ postId, authorAddress, postTitle }: TipButtonProps) {
  const { isConnected, signer, account, chainId } = useWeb3()
  const [isTipping, setIsTipping] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [amount, setAmount] = useState('0.001')
  const [message, setMessage] = useState('')
  const [contractInfo, setContractInfo] = useState({
    totalDonations: '0',
    myDonation: '0',
    contractBalance: '0'
  })
  const [topDonors, setTopDonors] = useState<any[]>([])
  const [timeRestriction, setTimeRestriction] = useState({
    enabled: false,
    start: 0,
    end: 0
  })

  const isSupportedNetwork = chainId === 11155111 // Sepolia 测试网

  // 加载合约数据
  const loadContractData = async () => {
    if (!signer || !account) return

    try {
      const contract = new BeggingContract(signer)
      const [totalDonations, myDonation, contractBalance, topDonors, timeInfo] = await Promise.all([
        contract.getTotalDonations(),
        contract.getMyDonation(account),
        contract.getContractBalance(),
        contract.getTopDonors(),
        contract.getTimeRestriction()
      ])

      setContractInfo({
        totalDonations: ethers.formatEther(totalDonations),
        myDonation: ethers.formatEther(myDonation),
        contractBalance: ethers.formatEther(contractBalance)
      })

      setTopDonors(topDonors.filter((donor: any) => donor.donorAddress !== ethers.ZeroAddress))
      setTimeRestriction(timeInfo)
    } catch (error) {
      console.error('加载合约数据失败:', error)
    }
  }

  useEffect(() => {
    if (isConnected) {
      loadContractData()
    }
  }, [isConnected, account])

  const handleTip = async () => {
    if (!isConnected || !signer || !account) {
      alert('请先连接钱包')
      return
    }

    if (!isSupportedNetwork) {
      alert('请切换到 Sepolia 测试网')
      return
    }

    // 检查时间限制
    if (timeRestriction.enabled) {
      const now = Math.floor(Date.now() / 1000)
      if (now < timeRestriction.start || now > timeRestriction.end) {
        alert('当前不在可捐赠时间段内')
        return
      }
    }

    setIsTipping(true)
    try {
      const contract = new BeggingContract(signer)
      
      // 调用合约的 donate 函数
      const tx = await contract.donate(amount)
      
      console.log('捐赠交易:', tx)

      // 记录打赏到数据库（可选）
      const response = await fetch('/api/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          from_address: account,
          to_address: authorAddress,
          amount,
          currency: 'ETH',
          transaction_hash: tx.hash,
          message: message || `打赏文章: ${postTitle}`
        }),
      })

      if (!response.ok) {
        console.warn('记录打赏到数据库失败，但链上交易已成功')
      }

      // 重新加载数据
      await loadContractData()

      alert(`打赏成功！\n交易哈希: ${tx.hash}`)
      setShowModal(false)
      setAmount('0.001')
      setMessage('')

    } catch (error: any) {
      console.error('打赏失败:', error)
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        alert('打赏失败: 余额不足')
      } else if (error.code === 'ACTION_REJECTED') {
        alert('打赏失败: 用户取消了交易')
      } else if (error.reason) {
        alert(`打赏失败: ${error.reason}`)
      } else {
        alert(`打赏失败: ${error.message || '未知错误'}`)
      }
    } finally {
      setIsTipping(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

// 修复 formatTime 函数
    const formatTime = (timestamp: bigint | number) => {
    if (timestamp === 0 || timestamp === 0) return '未设置'

      // 将 BigInt 转换为 Number
  const timestampNumber = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp
  return new Date(timestampNumber * 1000).toLocaleString('zh-CN')
}

const isInDonationPeriod = (timeRestriction: any) => {
  if (!timeRestriction.enabled) return true
  
  const now = Math.floor(Date.now() / 1000)
  const start = typeof timeRestriction.start === 'bigint' ? Number(timeRestriction.start) : timeRestriction.start
  const end = typeof timeRestriction.end === 'bigint' ? Number(timeRestriction.end) : timeRestriction.end
  
  return now >= start && now <= end
}

    const donationPeriodValid = isInDonationPeriod(timeRestriction)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
      >
        💝 打赏作者
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-auto shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">支持作者</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {!isConnected ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🔒</div>
                <p className="text-gray-600 mb-4">请先连接钱包</p>
              </div>
            ) : !isSupportedNetwork ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🌐</div>
                <p className="text-gray-600 mb-2">请切换到 Sepolia 测试网</p>
              </div>
            ) : (
              <>
                {/* 合约统计信息 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">总打赏</div>
                      <div className="font-semibold">{contractInfo.totalDonations} ETH</div>
                    </div>
                    <div>
                      <div className="text-gray-600">我的打赏</div>
                      <div className="font-semibold">{contractInfo.myDonation} ETH</div>
                    </div>
                  </div>
                  
                  {/* 时间限制提示 */}
                 {timeRestriction.enabled && (
    <div className={`mt-3 p-2 rounded text-xs ${
      donationPeriodValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {donationPeriodValid ? '✅ 可打赏' : '❌ 不可打赏'}
      <div>开始: {formatTime(timeRestriction.start)}</div>
      <div>结束: {formatTime(timeRestriction.end)}</div>
    </div>
                  )}
                </div>

                {/* 打赏表单 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      打赏金额 (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      留言 (可选)
                    </label>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="说点什么鼓励作者..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* 排行榜 */}
                  {topDonors.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">打赏排行榜</h4>
                      <div className="space-y-2">
                        {topDonors.map((donor, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="flex items-center">
                              <span className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs mr-2">
                                {index + 1}
                              </span>
                              {formatAddress(donor.donorAddress)}
                            </span>
                            <span className="font-medium">
                              {ethers.formatEther(donor.amount)} ETH
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={isTipping}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 disabled:opacity-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleTip}
                    disabled={isTipping || (timeRestriction.enabled && !donationPeriodValid)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all flex items-center justify-center"
                  >
                    {isTipping ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        处理中...
                      </>
                    ) : (
                      '确认打赏'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}