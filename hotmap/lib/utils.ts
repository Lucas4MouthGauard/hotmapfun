import { MemeWord, VoteStats, VoteTransaction } from './types'
import { CONFIG, STORAGE_KEYS, VOTE_STATUS, VoteStatus } from './data'

// 计算热度颜色
export function getHeatColor(votes: number, maxVotes: number): string {
  if (maxVotes === 0) return 'text-gray-400'
  
  const ratio = votes / maxVotes
  
  if (ratio >= 0.8) return 'text-meme-hot'
  if (ratio >= 0.6) return 'text-meme-warm'
  if (ratio >= 0.4) return 'text-meme-cool'
  if (ratio >= 0.2) return 'text-meme-cold'
  return 'text-gray-400'
}

// 计算字体大小
export function getFontSize(votes: number, maxVotes: number): string {
  if (maxVotes === 0) return 'text-sm'
  
  const ratio = votes / maxVotes
  
  if (ratio >= 0.8) return 'text-4xl md:text-6xl'
  if (ratio >= 0.6) return 'text-3xl md:text-5xl'
  if (ratio >= 0.4) return 'text-2xl md:text-4xl'
  if (ratio >= 0.2) return 'text-xl md:text-3xl'
  return 'text-lg md:text-2xl'
}

// 更新词条百分比
export function updatePercentages(words: MemeWord[]): MemeWord[] {
  const totalVotes = words.reduce((sum, word) => sum + word.votes, 0)
  
  return words.map(word => ({
    ...word,
    percentage: totalVotes > 0 ? (word.votes / totalVotes) * 100 : 0
  }))
}

// 获取当前日期字符串 (YYYY-MM-DD)
export function getCurrentDateString(): string {
  return new Date().toISOString().split('T')[0]
}

// 获取用户投票统计
export function getUserVoteStats(walletAddress: string): VoteStats {
  if (typeof window === 'undefined') {
    return {
      totalVotes: 0,
      freeVotesUsed: 0,
      paidVotesUsed: 0,
      lastVoteTime: 0,
      lastVoteDate: getCurrentDateString()
    }
  }
  
  const stored = localStorage.getItem(`${STORAGE_KEYS.VOTE_STATS}_${walletAddress}`)
  if (stored) {
    const stats = JSON.parse(stored)
    // 检查是否需要重置每日统计
    const currentDate = getCurrentDateString()
    if (stats.lastVoteDate !== currentDate) {
      return {
        ...stats,
        freeVotesUsed: 0,
        paidVotesUsed: 0,
        totalVotes: 0,
        lastVoteDate: currentDate
      }
    }
    return stats
  }
  
  return {
    totalVotes: 0,
    freeVotesUsed: 0,
    paidVotesUsed: 0,
    lastVoteTime: 0,
    lastVoteDate: getCurrentDateString()
  }
}

// 保存用户投票统计
export function saveUserVoteStats(walletAddress: string, stats: VoteStats): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(`${STORAGE_KEYS.VOTE_STATS}_${walletAddress}`, JSON.stringify(stats))
}

// 检查投票状态
export function getVoteStatus(walletAddress: string): VoteStatus {
  if (!walletAddress) {
    return VOTE_STATUS.WALLET_NOT_CONNECTED
  }

  const stats = getUserVoteStats(walletAddress)
  const currentDate = getCurrentDateString()
  
  // 如果是新的一天，重置统计
  if (stats.lastVoteDate !== currentDate) {
    return VOTE_STATUS.FREE_AVAILABLE
  }
  
  // 检查是否达到每日上限
  if (stats.totalVotes >= CONFIG.maxVotesPerDay) {
    return VOTE_STATUS.DAILY_LIMIT_REACHED
  }
  
  // 检查免费投票是否可用
  if (stats.freeVotesUsed < CONFIG.freeVotesPerDay) {
    return VOTE_STATUS.FREE_AVAILABLE
  }
  
  // 免费投票已用完，需要付费
  return VOTE_STATUS.PAID_REQUIRED
}

// 检查是否可以免费投票
export function canVoteFree(walletAddress: string): boolean {
  return getVoteStatus(walletAddress) === VOTE_STATUS.FREE_AVAILABLE
}

// 检查是否可以付费投票
export function canVotePaid(walletAddress: string): boolean {
  const status = getVoteStatus(walletAddress)
  return status === VOTE_STATUS.PAID_REQUIRED || status === VOTE_STATUS.FREE_AVAILABLE
}

// 检查是否达到每日投票上限
export function canVoteToday(walletAddress: string): boolean {
  const status = getVoteStatus(walletAddress)
  return status !== VOTE_STATUS.DAILY_LIMIT_REACHED && status !== VOTE_STATUS.WALLET_NOT_CONNECTED
}

// 记录投票
export function recordVote(walletAddress: string, isPaid: boolean = false, transactionSignature?: string): void {
  const stats = getUserVoteStats(walletAddress)
  const currentTime = Date.now()
  const currentDate = getCurrentDateString()
  
  const newStats: VoteStats = {
    totalVotes: stats.totalVotes + 1,
    freeVotesUsed: isPaid ? stats.freeVotesUsed : stats.freeVotesUsed + 1,
    paidVotesUsed: isPaid ? stats.paidVotesUsed + 1 : stats.paidVotesUsed,
    lastVoteTime: currentTime,
    lastVoteDate: currentDate
  }
  
  saveUserVoteStats(walletAddress, newStats)
  
  // 记录交易信息（如果是付费投票）
  if (isPaid && transactionSignature) {
    const transaction: VoteTransaction = {
      signature: transactionSignature,
      amount: CONFIG.paidVoteCost,
      status: 'confirmed',
      timestamp: currentTime
    }
    
    const transactions = getUserVoteTransactions(walletAddress)
    transactions.push(transaction)
    saveUserVoteTransactions(walletAddress, transactions)
  }
}

// 获取用户投票交易记录
export function getUserVoteTransactions(walletAddress: string): VoteTransaction[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(`${STORAGE_KEYS.VOTE_TRANSACTIONS}_${walletAddress}`)
  return stored ? JSON.parse(stored) : []
}

// 保存用户投票交易记录
export function saveUserVoteTransactions(walletAddress: string, transactions: VoteTransaction[]): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(`${STORAGE_KEYS.VOTE_TRANSACTIONS}_${walletAddress}`, JSON.stringify(transactions))
}

// 格式化 SOL 余额
export function formatSol(balance: number): string {
  return (balance / 1e9).toFixed(4)
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 获取投票状态描述
export function getVoteStatusDescription(status: VoteStatus): string {
  switch (status) {
    case VOTE_STATUS.FREE_AVAILABLE:
      return '可以免费投票'
    case VOTE_STATUS.FREE_USED:
      return '免费投票已用完'
    case VOTE_STATUS.PAID_REQUIRED:
      return '需要付费投票'
    case VOTE_STATUS.DAILY_LIMIT_REACHED:
      return '今日投票次数已达上限'
    case VOTE_STATUS.WALLET_NOT_CONNECTED:
      return '请先连接钱包'
    default:
      return '未知状态'
  }
} 