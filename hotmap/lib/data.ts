import { MemeWord, Config } from './types'

export const MEME_WORDS: MemeWord[] = [
  // 网络热词
  { id: 1, word: '梗', votes: 0, percentage: 0, category: '网络', emoji: '🔥' },
  { id: 2, word: '内卷', votes: 0, percentage: 0, category: '网络', emoji: '🔥' },
  { id: 3, word: '摆烂', votes: 0, percentage: 0, category: '网络', emoji: '🔥' },
  { id: 4, word: 'YYDS', votes: 0, percentage: 0, category: '网络', emoji: '🔥' },
  { id: 5, word: 'emo', votes: 0, percentage: 0, category: '网络', emoji: '🔥' },
  { id: 6, word: '社恐', votes: 0, percentage: 0, category: '网络', emoji: '🔥' },
  { id: 7, word: '打工人', votes: 0, percentage: 0, category: '网络', emoji: '🔥' },
  { id: 8, word: '躺平', votes: 0, percentage: 0, category: '网络', emoji: '🔥' },
  { id: 9, word: '双减', votes: 0, percentage: 0, category: '网络', emoji: '🔥' },
  { id: 10, word: '元宇宙', votes: 0, percentage: 0, category: '网络', emoji: '🔥' },
  // 投资相关
  { id: 11, word: '比特币', votes: 0, percentage: 0, category: '投资', emoji: '🔥' },
  { id: 12, word: '以太坊', votes: 0, percentage: 0, category: '投资', emoji: '🔥' },
  { id: 13, word: '牛市', votes: 0, percentage: 0, category: '投资', emoji: '🔥' },
  { id: 14, word: '熊市', votes: 0, percentage: 0, category: '投资', emoji: '🔥' },
  { id: 15, word: '梭哈', votes: 0, percentage: 0, category: '投资', emoji: '🔥' },
  { id: 16, word: 'FOMO', votes: 0, percentage: 0, category: '投资', emoji: '🔥' },
  { id: 17, word: 'DAO', votes: 0, percentage: 0, category: '投资', emoji: '🔥' },
  { id: 18, word: 'NFT', votes: 0, percentage: 0, category: '投资', emoji: '🔥' },
  { id: 19, word: '链游', votes: 0, percentage: 0, category: '投资', emoji: '🔥' },
  { id: 20, word: '空投', votes: 0, percentage: 0, category: '投资', emoji: '🔥' },
  // 生活
  { id: 21, word: '早C晚A', votes: 0, percentage: 0, category: '生活', emoji: '🔥' },
  { id: 22, word: '养生', votes: 0, percentage: 0, category: '生活', emoji: '🔥' },
  { id: 23, word: '断舍离', votes: 0, percentage: 0, category: '生活', emoji: '🔥' },
  { id: 24, word: '极简', votes: 0, percentage: 0, category: '生活', emoji: '🔥' },
  { id: 25, word: '佛系', votes: 0, percentage: 0, category: '生活', emoji: '🔥' },
  { id: 26, word: '朋克养生', votes: 0, percentage: 0, category: '生活', emoji: '🔥' },
  { id: 27, word: '自律', votes: 0, percentage: 0, category: '生活', emoji: '🔥' },
  { id: 28, word: '摸鱼', votes: 0, percentage: 0, category: '生活', emoji: '🔥' },
  { id: 29, word: '打卡', votes: 0, percentage: 0, category: '生活', emoji: '🔥' },
  { id: 30, word: '早睡', votes: 0, percentage: 0, category: '生活', emoji: '🔥' },
]

export const CONFIG: Config = {
  FREE_VOTES_PER_DAY: 3,
  PAID_VOTE_COST: 0.02,
  MAX_VOTES_PER_DAY: 50,
  HEATMAP_TOP_COUNT: 100,
  PROJECT_WALLET: 'YOUR_ADDRESS'
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