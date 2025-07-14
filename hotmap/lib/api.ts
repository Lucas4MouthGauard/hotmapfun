const API_BASE_URL = 'http://localhost:3001/api'

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

// API 请求工具函数
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`
  console.log('🌐 API请求:', url, options)
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    console.log('📡 API响应状态:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API错误响应:', errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ API成功响应:', data)
    
    return data
  } catch (error) {
    console.error('❌ API请求失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络请求失败'
    }
  }
}

// 用户认证API
export const authApi = {
  // 用户登录/注册
  login: (walletAddress: string): Promise<ApiResponse<{ user: User }>> => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ wallet_address: walletAddress })
    })
  },

  // 获取用户信息
  getUser: (walletAddress: string): Promise<ApiResponse<{ user: User }>> => {
    return apiRequest(`/auth/user/${walletAddress}`)
  },

  // 获取用户投票统计
  getUserStats: (walletAddress: string, date?: string): Promise<ApiResponse<{
    user: User
    todayStats: any
    voteHistory: any[]
  }>> => {
    const params = date ? `?date=${date}` : ''
    return apiRequest(`/auth/user/${walletAddress}/stats${params}`)
  }
}

// 词条API
export const wordsApi = {
  // 获取所有词条
  getWords: (params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    sort?: string
    order?: 'asc' | 'desc'
  }): Promise<ApiResponse<Word[]>> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    return apiRequest(`/words?${searchParams.toString()}`).then(response => {
      // 处理后端返回的嵌套数据结构
      if (response.success && response.data && typeof response.data === 'object' && 'data' in response.data) {
        return {
          ...response,
          data: (response.data as any).data // 提取实际的词条数组
        } as ApiResponse<Word[]>
      }
      return response as ApiResponse<Word[]>
    })
  },

  // 获取单个词条
  getWord: (id: number): Promise<ApiResponse<{ word: Word; voteHistory: any[] }>> => {
    return apiRequest(`/words/${id}`)
  },

  // 获取热力图数据
  getHeatmapData: (limit: number = 100): Promise<ApiResponse<Word[]>> => {
    return apiRequest(`/words/heatmap/top?limit=${limit}`)
  },

  // 获取分类列表
  getCategories: (): Promise<ApiResponse<{
    categories: Array<{
      category: string
      word_count: number
      total_votes: number
    }>
  }>> => {
    return apiRequest('/words/categories/list')
  }
}

// 投票API
export const votesApi = {
  // 提交投票
  submitVote: (voteData: VoteRequest): Promise<ApiResponse<VoteResponse>> => {
    return apiRequest('/votes', {
      method: 'POST',
      body: JSON.stringify(voteData)
    })
  },

  // 获取用户今日投票状态
  getTodayVoteStatus: (walletAddress: string): Promise<ApiResponse<TodayVoteStatus>> => {
    return apiRequest(`/votes/user/${walletAddress}/today`)
  }
}

// 统计API
export const statsApi = {
  // 获取总体统计
  getOverview: (): Promise<ApiResponse<{
    users: any
    words: any
    today: any
    revenue: any
  }>> => {
    return apiRequest('/stats/overview')
  },

  // 获取每日统计
  getDailyStats: (days: number = 30): Promise<ApiResponse<any[]>> => {
    return apiRequest(`/stats/daily?days=${days}`)
  },

  // 获取热门词条排行
  getTopWords: (limit: number = 20, days: number = 7): Promise<ApiResponse<Word[]>> => {
    return apiRequest(`/stats/top-words?limit=${limit}&days=${days}`)
  },

  // 获取用户活跃度排行
  getTopUsers: (limit: number = 20, days: number = 30): Promise<ApiResponse<any[]>> => {
    return apiRequest(`/stats/top-users?limit=${limit}&days=${days}`)
  }
}

// 交易API
export const transactionsApi = {
  // 获取交易记录
  getTransactions: (params?: {
    wallet_address?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<any[]>> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    return apiRequest(`/transactions?${searchParams.toString()}`)
  },

  // 验证交易签名
  verifyTransaction: (txData: {
    tx_signature: string
    from_address: string
    to_address: string
    amount_sol: number
  }): Promise<ApiResponse<any>> => {
    return apiRequest('/transactions/verify', {
      method: 'POST',
      body: JSON.stringify(txData)
    })
  }
} 