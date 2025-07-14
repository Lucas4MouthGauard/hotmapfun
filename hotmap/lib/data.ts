import { MemeWord, ProjectConfig } from './types'

export const MEME_WORDS: MemeWord[] = [
  // 网络热词
  { id: 1, word: "火箭", votes: 150, percentage: 15, category: "网络" },
  { id: 2, word: "热词", votes: 120, percentage: 12, category: "网络" },
  { id: 3, word: "钻石手", votes: 100, percentage: 10, category: "网络" },
  { id: 4, word: "月亮", votes: 90, percentage: 9, category: "网络" },
  { id: 5, word: "狗狗", votes: 80, percentage: 8, category: "网络" },
  { id: 6, word: "猫咪", votes: 70, percentage: 7, category: "网络" },
  { id: 7, word: "披萨", votes: 60, percentage: 6, category: "网络" },
  { id: 8, word: "咖啡", votes: 50, percentage: 5, category: "网络" },
  { id: 9, word: "音乐", votes: 40, percentage: 4, category: "网络" },
  { id: 10, word: "游戏", votes: 35, percentage: 3.5, category: "网络" },
  
  // 投资相关
  { id: 11, word: "牛市", votes: 95, percentage: 9.5, category: "投资" },
  { id: 12, word: "熊市", votes: 85, percentage: 8.5, category: "投资" },
  { id: 13, word: "财富", votes: 75, percentage: 7.5, category: "投资" },
  { id: 14, word: "银行", votes: 65, percentage: 6.5, category: "投资" },
  { id: 15, word: "信用卡", votes: 55, percentage: 5.5, category: "投资" },
  
  // 生活日常
  { id: 16, word: "睡觉", votes: 45, percentage: 4.5, category: "生活" },
  { id: 17, word: "汉堡", votes: 42, percentage: 4.2, category: "生活" },
  { id: 18, word: "房子", votes: 38, percentage: 3.8, category: "生活" },
  { id: 19, word: "汽车", votes: 35, percentage: 3.5, category: "生活" },
  { id: 20, word: "手机", votes: 32, percentage: 3.2, category: "生活" },
  
  // 娱乐休闲
  { id: 21, word: "电影", votes: 30, percentage: 3, category: "娱乐" },
  { id: 22, word: "电视", votes: 28, percentage: 2.8, category: "娱乐" },
  { id: 23, word: "艺术", votes: 25, percentage: 2.5, category: "娱乐" },
  { id: 24, word: "书籍", votes: 22, percentage: 2.2, category: "娱乐" },
  { id: 25, word: "戏剧", votes: 20, percentage: 2, category: "娱乐" },
  
  // 科技数码
  { id: 26, word: "电脑", votes: 18, percentage: 1.8, category: "科技" },
  { id: 27, word: "机器人", votes: 16, percentage: 1.6, category: "科技" },
  { id: 28, word: "无人机", votes: 14, percentage: 1.4, category: "科技" },
  { id: 29, word: "电池", votes: 12, percentage: 1.2, category: "科技" },
  { id: 30, word: "卫星", votes: 10, percentage: 1, category: "科技" }
]

// 项目配置 - 请根据实际情况修改
export const CONFIG: ProjectConfig = {
  freeVotesPerDay: 3,        // 每日免费投票次数
  paidVoteCost: 0.02,         // 付费投票费用 (SOL)
  maxVotesPerDay: 50,        // 每日最大投票次数（免费+付费）
  heatmapTopCount: 100,       // 热力图显示数量
  projectWallet: process.env.NEXT_PUBLIC_PROJECT_WALLET || "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1", // 项目方钱包地址
  network: (process.env.NEXT_PUBLIC_SOLANA_NETWORK as 'devnet' | 'mainnet-beta') || 'devnet'
}

// 本地存储键名
export const STORAGE_KEYS = {
  USER_VOTES: 'meme_hotmap_user_votes',
  VOTE_STATS: 'meme_hotmap_vote_stats',
  LAST_VOTE_DATE: 'meme_hotmap_last_vote_date',
  VOTE_TRANSACTIONS: 'meme_hotmap_vote_transactions',
}

// 投票状态常量
export const VOTE_STATUS = {
  FREE_AVAILABLE: 'free_available',     // 免费投票可用
  FREE_USED: 'free_used',              // 免费投票已用完
  PAID_REQUIRED: 'paid_required',      // 需要付费投票
  DAILY_LIMIT_REACHED: 'daily_limit_reached', // 达到每日上限
  WALLET_NOT_CONNECTED: 'wallet_not_connected' // 钱包未连接
} as const

export type VoteStatus = typeof VOTE_STATUS[keyof typeof VOTE_STATUS] 