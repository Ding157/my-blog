// components/ContractAdmin.tsx
'use client'

import { useState, useEffect } from 'react'
import { useWeb3 } from '@/contexts/Web3Context'
import { BeggingContract } from '@/utils/contract'
import { ethers } from 'ethers'

export default function ContractAdmin() {
  const { signer, account, chainId } = useWeb3()
  const [isOwner, setIsOwner] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [timeSettings, setTimeSettings] = useState({
    startTime: '',
    endTime: ''
  })
  const [contractBalance, setContractBalance] = useState('0')
  const [totalDonations, setTotalDonations] = useState('0')
  const [timeRestriction, setTimeRestriction] = useState({
    enabled: false,
    start: 0,
    end: 0
  })
  const [topDonors, setTopDonors] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 确保只在客户端渲染
  useEffect(() => {
    setMounted(true)
  }, [])

  const checkOwnership = async () => {
    if (!signer || !account) return

    try {
      const contract = new BeggingContract(signer)
      const owner = await contract.getOwner()
      setIsOwner(owner.toLowerCase() === account.toLowerCase())
    } catch (error) {
      console.error('检查所有权失败:', error)
    }
  }

  const loadContractData = async () => {
    if (!signer) return

    try {
      setIsLoading(true)
      const contract = new BeggingContract(signer)
      
      const [balance, donations, timeInfo, donors] = await Promise.all([
        contract.getContractBalance(),
        contract.getTotalDonations(),
        contract.getTimeRestriction(),
        contract.getTopDonors()
      ])

      setContractBalance(ethers.formatEther(balance))
      setTotalDonations(ethers.formatEther(donations))
      
      // 处理 BigInt 转换
      setTimeRestriction({
        enabled: timeInfo.enabled,
        start: Number(timeInfo.start),
        end: Number(timeInfo.end)
      })

      // 过滤掉零地址的捐赠者
      setTopDonors(donors.filter((donor: any) => 
        donor.donorAddress !== ethers.ZeroAddress && donor.amount > 0
      ))

    } catch (error) {
      console.error('加载合约数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 在 useEffect 中调用异步函数
  useEffect(() => {
    if (mounted && signer && account) {
      checkOwnership()
      loadContractData()
    }
  }, [mounted, signer, account])

  const handleSetDonationPeriod = async () => {
    if (!signer) return

    try {
      if (!timeSettings.startTime || !timeSettings.endTime) {
        alert('请填写开始和结束时间')
        return
      }

      const startTimestamp = Math.floor(new Date(timeSettings.startTime).getTime() / 1000)
      const endTimestamp = Math.floor(new Date(timeSettings.endTime).getTime() / 1000)

      if (startTimestamp >= endTimestamp) {
        alert('开始时间必须早于结束时间')
        return
      }

      const contract = new BeggingContract(signer)
      const tx = await contract.setDonationPeriod(startTimestamp, endTimestamp)
      await tx.wait()

      alert('时间设置成功！')
      setTimeSettings({ startTime: '', endTime: '' })
      await loadContractData() // 重新加载数据
    } catch (error: any) {
      console.error('设置时间失败:', error)
      alert(`设置失败: ${error.reason || error.message || '未知错误'}`)
    }
  }

  const handleWithdraw = async () => {
    if (!signer) return

    if (!confirm('确定要提取合约中的所有资金吗？')) {
      return
    }

    try {
      const contract = new BeggingContract(signer)
      const tx = await contract.withdraw()
      await tx.wait()

      alert('提款成功！')
      await loadContractData() // 重新加载数据
    } catch (error: any) {
      console.error('提款失败:', error)
      alert(`提款失败: ${error.reason || error.message || '未知错误'}`)
    }
  }

  const handleDisableTimeRestriction = async () => {
    if (!signer) return

    try {
      const contract = new BeggingContract(signer)
      const tx = await contract.disableTimeRestriction()
      await tx.wait()

      alert('时间限制已禁用！')
      await loadContractData() // 重新加载数据
    } catch (error: any) {
      console.error('禁用时间限制失败:', error)
      alert(`操作失败: ${error.reason || error.message || '未知错误'}`)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTime = (timestamp: number) => {
    if (timestamp === 0) return '未设置'
    return new Date(timestamp * 1000).toLocaleString('zh-CN')
  }

  const isInDonationPeriod = () => {
    if (!timeRestriction.enabled) return true
    const now = Math.floor(Date.now() / 1000)
    return now >= timeRestriction.start && now <= timeRestriction.end
  }

  // 服务器端不渲染任何内容
  if (!mounted) return null
  if (!isOwner) return null

  return (
    <>
      <button
        onClick={() => setShowAdmin(true)}
        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
      >
        合约管理
      </button>

      {showAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">合约管理面板</h3>
              <button
                onClick={() => setShowAdmin(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600 mt-2">加载中...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 合约统计信息 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">合约统计</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-blue-600">合约余额</div>
                      <div className="font-semibold text-blue-800">{contractBalance} ETH</div>
                    </div>
                    <div>
                      <div className="text-blue-600">总打赏额</div>
                      <div className="font-semibold text-blue-800">{totalDonations} ETH</div>
                    </div>
                  </div>
                  
                  {/* 时间限制状态 */}
                  <div className={`mt-3 p-2 rounded text-xs ${
                    timeRestriction.enabled 
                      ? (isInDonationPeriod() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {timeRestriction.enabled ? (
                      <>
                        <div>{isInDonationPeriod() ? '✅ 可打赏' : '❌ 不可打赏'}</div>
                        <div>开始: {formatTime(timeRestriction.start)}</div>
                        <div>结束: {formatTime(timeRestriction.end)}</div>
                      </>
                    ) : (
                      '⏰ 时间限制已禁用'
                    )}
                  </div>
                </div>

                {/* 时间设置 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-3">设置捐赠时间段</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">开始时间</label>
                      <input
                        type="datetime-local"
                        value={timeSettings.startTime}
                        onChange={(e) => setTimeSettings(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">结束时间</label>
                      <input
                        type="datetime-local"
                        value={timeSettings.endTime}
                        onChange={(e) => setTimeSettings(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={handleSetDonationPeriod}
                      disabled={!timeSettings.startTime || !timeSettings.endTime}
                      className="w-full bg-blue-500 text-white py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      设置时间段
                    </button>
                  </div>
                </div>

                {/* 管理操作 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-3">管理操作</h4>
                  <div className="space-y-2">
                    <button
                      onClick={handleDisableTimeRestriction}
                      disabled={!timeRestriction.enabled}
                      className="w-full bg-gray-500 text-white py-2 rounded text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      禁用时间限制
                    </button>
                    <button
                      onClick={handleWithdraw}
                      disabled={parseFloat(contractBalance) === 0}
                      className="w-full bg-green-500 text-white py-2 rounded text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      提取资金 ({contractBalance} ETH)
                    </button>
                  </div>
                </div>

                {/* 排行榜 */}
                {topDonors.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-3">打赏排行榜</h4>
                    <div className="space-y-2">
                      {topDonors.map((donor, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="flex items-center">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 ${
                              index === 0 ? 'bg-yellow-500 text-white' :
                              index === 1 ? 'bg-gray-400 text-white' :
                              'bg-orange-500 text-white'
                            }`}>
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

                {/* 网络信息 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600">
                    <div>当前网络: {chainId || '未知'}</div>
                    <div>合约地址: {formatAddress(BeggingContract.address)}</div>
                    <div>所有者: {formatAddress(account || '')}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}