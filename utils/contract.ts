// utils/contract.ts
import { ethers } from 'ethers'

// 合约 ABI
export const BEGGING_CONTRACT_ABI = [
  "function donate() external payable",
  "function withdraw() external",
  "function getDonation(address) external view returns (uint256)",
  "function getTopDonors() external view returns (tuple(address donorAddress, uint256 amount)[3])",
  "function getContractBalance() external view returns (uint256)",
  "function totalDonations() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function donations(address) external view returns (uint256)",
  "function setDonationPeriod(uint256, uint256) external",
  "function disableTimeRestriction() external",
  "function timeRestrictionEnabled() external view returns (bool)",
  "function startTime() external view returns (uint256)",
  "function endTime() external view returns (uint256)",
  "event Donation(address indexed donor, uint256 amount, uint256 timestamp)",
  "event Withdrawal(address indexed owner, uint256 amount, uint256 timestamp)"
]

// 合约地址 (部署后替换这个地址)
export const BEGGING_CONTRACT_ADDRESS = "0x34dbA68b642f7fc134d6f523a56063DeBD14D95f"

export class BeggingContract {
  private contract: ethers.Contract
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