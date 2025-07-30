import { getApiUrl, isVercelEnvironment } from './vercel'

// API 基础配置
const API_CONFIG = {
  baseUrl: getApiUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
}

// 请求拦截器
const request = async (url: string, options: RequestInit = {}) => {
  const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.baseUrl}${url}`
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
    signal: AbortSignal.timeout(API_CONFIG.timeout),
  }

  try {
    const response = await fetch(fullUrl, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// API 客户端
export const apiClient = {
  // GET 请求
  async get<T>(url: string): Promise<T> {
    const response = await request(url, { method: 'GET' })
    return response.json()
  },

  // POST 请求
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await request(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
    return response.json()
  },

  // PUT 请求
  async put<T>(url: string, data?: any): Promise<T> {
    const response = await request(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
    return response.json()
  },

  // DELETE 请求
  async delete<T>(url: string): Promise<T> {
    const response = await request(url, { method: 'DELETE' })
    return response.json()
  },
}

// 健康检查
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health')
    return response
  } catch (error) {
    console.error('Health check failed:', error)
    return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 词条相关 API
export const wordsApi = {
  // 获取所有词条
  getAll: () => apiClient.get('/api/words'),
  
  // 获取热力图数据
  getHeatmap: () => apiClient.get('/api/words/heatmap/top'),
  
  // 获取分类列表
  getCategories: () => apiClient.get('/api/words/categories/list'),
  
  // 按分类获取词条
  getByCategory: (category: string) => apiClient.get(`/api/words/category/${category}`),
}

// 投票相关 API
export const votesApi = {
  // 获取用户今日投票状态
  getUserVotes: (walletAddress: string) => 
    apiClient.get(`/api/votes/user/${walletAddress}/today`),
  
  // 提交投票
  submitVote: (data: { wordId: number; walletAddress: string; voteType: 'free' | 'paid' }) =>
    apiClient.post('/api/votes', data),
  
  // 获取投票统计
  getStats: () => apiClient.get('/api/stats/overview'),
}

// 用户相关 API
export const authApi = {
  // 用户登录
  login: (walletAddress: string) => 
    apiClient.post('/api/auth/login', { walletAddress }),
  
  // 获取用户信息
  getUser: (walletAddress: string) => 
    apiClient.get(`/api/auth/user/${walletAddress}`),
}

// 统计相关 API
export const statsApi = {
  // 获取概览统计
  getOverview: () => apiClient.get('/api/stats/overview'),
  
  // 获取趋势数据
  getTrends: () => apiClient.get('/api/stats/trends'),
  
  // 获取排行榜
  getLeaderboard: () => apiClient.get('/api/stats/leaderboard'),
}

// 导出所有 API
export const api = {
  healthCheck,
  words: wordsApi,
  votes: votesApi,
  auth: authApi,
  stats: statsApi,
}

// 环境信息
export const getApiInfo = () => ({
  baseUrl: API_CONFIG.baseUrl,
  isVercel: isVercelEnvironment(),
  environment: process.env.NODE_ENV,
}) 