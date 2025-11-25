// utils/contract.ts
// utils/contract.ts
import { ethers } from 'ethers'

// 完整的合约 ABI - 根据你的合约代码更新
export const BEGGING_CONTRACT_ABI = [
  // 基础函数
  "function donate() external payable",
  "function withdraw() external",
  "function owner() external view returns (address)",
  
  // 查看函数
  "function getDonation(address) external view returns (uint256)",
  "function getTopDonors() external view returns (tuple(address donorAddress, uint256 amount)[3])",
  "function getContractBalance() external view returns (uint256)",
  "function totalDonations() external view returns (uint256)",
  "function donations(address) external view returns (uint256)",
  
  // 时间管理函数
  "function setDonationPeriod(uint256, uint256) external",
  "function disableTimeRestriction() external",
  "function timeRestrictionEnabled() external view returns (bool)",
  "function startTime() external view returns (uint256)",
  "function endTime() external view returns (uint256)",
  
  // 事件
  "event Donation(address indexed donor, uint256 amount, uint256 timestamp)",
  "event Withdrawal(address indexed owner, uint256 amount, uint256 timestamp)",
  
  // receive 函数
  "receive() external payable"
]

// 部署后替换为你的实际合约地址
export const BEGGING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x34dbA68b642f7fc134d6f523a56063DeBD14D95f"

export class BeggingContract {
  public contract: ethers.Contract
  private signer: ethers.Signer

  constructor(signer: ethers.Signer) {
    this.signer = signer
    this.contract = new ethers.Contract(
      BEGGING_CONTRACT_ADDRESS,
      BEGGING_CONTRACT_ABI,
      signer
    )
  }

  // 添加静态地址属性以便在组件中使用
  static get address() {
    return BEGGING_CONTRACT_ADDRESS
  }

  // 捐赠
  async donate(amount: string) {
    const tx = await this.contract.donate({
      value: ethers.parseEther(amount)
    })
    return await tx.wait()
  }

  // 提款 - 添加这个缺失的方法
  async withdraw() {
    const tx = await this.contract.withdraw()
    return await tx.wait()
  }

  // 获取个人捐赠总额
  async getMyDonation(address: string) {
    return await this.contract.donations(address)
  }

  // 获取总捐赠额
  async getTotalDonations() {
    return await this.contract.totalDonations()
  }

  // 获取合约余额
  async getContractBalance() {
    return await this.contract.getContractBalance()
  }

  // 获取排行榜
  async getTopDonors() {
    return await this.contract.getTopDonors()
  }

  // 获取合约所有者
  async getOwner() {
    return await this.contract.owner()
  }

  // 设置捐赠时间段 (仅所有者)
  async setDonationPeriod(startTime: number, endTime: number) {
    const tx = await this.contract.setDonationPeriod(startTime, endTime)
    return await tx.wait()
  }

  // 禁用时间限制 (仅所有者)
  async disableTimeRestriction() {
    const tx = await this.contract.disableTimeRestriction()
    return await tx.wait()
  }

  // 获取时间限制状态
  async getTimeRestriction() {
    const [enabled, start, end] = await Promise.all([
      this.contract.timeRestrictionEnabled(),
      this.contract.startTime(),
      this.contract.endTime()
    ])
    return { enabled, start, end }
  }
}

// 只读合约实例（用于不需要签名的查询）
export function getReadOnlyContract(provider: ethers.Provider) {
  return new ethers.Contract(
    BEGGING_CONTRACT_ADDRESS,
    BEGGING_CONTRACT_ABI,
    provider
  )
}