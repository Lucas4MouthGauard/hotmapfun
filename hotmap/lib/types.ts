// 基础类型定义

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface User {
  id: number
  wallet_address: string
  total_votes: number
  total_paid_votes: number
  total_spent_sol: number
  first_vote_at?: string
  last_vote_at?: string
  created_at: string
  updated_at: string
}

export interface Word {
  id: number
  word: string
  category: string
  description?: string
  total_votes: number
  free_votes: number
  paid_votes: number
  current_rank: number
  percentage?: number
  heatValue?: number
  rank?: number
  emoji?: string
}

export interface MemeWord {
  id: number
  word: string
  votes: number
  percentage: number
  category: string
  emoji: string
}

export interface VoteRequest {
  wallet_address: string
  word_id: number
  is_paid: boolean
  tx_signature?: string
}

export interface VoteResponse {
  vote: any
  user: User
  word: Word
  todayStats: {
    totalVotes: number
    freeVotes: number
    paidVotes: number
  }
}

export interface TodayVoteStatus {
  todayStats: {
    totalVotes: number
    freeVotes: number
    paidVotes: number
    remainingFreeVotes: number
    remainingTotalVotes: number
  }
  todayVotes: any[]
  config: {
    freeVotesPerDay: number
    maxVotesPerDay: number
    paidVoteCost: number
  }
}

export interface StatsOverview {
  users: {
    total: number
    active_today: number
    new_today: number
  }
  words: {
    total: number
    voted_today: number
    top_ranked: number
  }
  today: {
    total_votes: number
    free_votes: number
    paid_votes: number
    revenue_sol: number
  }
  revenue: {
    total_sol: number
    today_sol: number
    monthly_sol: number
  }
}

export interface Category {
  category: string
  word_count: number
  total_votes: number
}

export interface Transaction {
  id: number
  wallet_address: string
  tx_signature: string
  amount_sol: number
  status: 'pending' | 'confirmed' | 'failed'
  created_at: string
  updated_at: string
}

// 配置类型
export interface Config {
  FREE_VOTES_PER_DAY: number
  PAID_VOTE_COST: number
  MAX_VOTES_PER_DAY: number
  HEATMAP_TOP_COUNT: number
  PROJECT_WALLET: string
}

// 环境配置类型
export interface EnvironmentConfig {
  isVercel: boolean
  isProduction: boolean
  domain: string
  apiBaseUrl: string
  backendDomain: string
} 