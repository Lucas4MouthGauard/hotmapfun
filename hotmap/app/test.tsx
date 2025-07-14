'use client'

import React, { useState, useEffect } from 'react'
import { wordsApi } from '@/lib/api'

export default function TestPage() {
  const [words, setWords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testApi = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await wordsApi.getWords({ limit: 10 })
      
      if (response && response.success && response.data && Array.isArray(response.data)) {
        setWords(response.data)
        console.log('API测试成功:', response.data)
      } else {
        setError(response?.error || 'API请求失败')
        setWords([])
        console.error('API测试失败:', response?.error)
      }
    } catch (err) {
      setError('网络请求失败')
      console.error('网络错误:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testApi()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          API 连接测试
        </h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">测试状态</h2>
          
          {loading && (
            <div className="text-yellow-400 text-lg">正在测试API连接...</div>
          )}
          
          {error && (
            <div className="text-red-400 text-lg mb-4">错误: {error}</div>
          )}
          
          {!loading && !error && words.length > 0 && (
            <div className="text-green-400 text-lg mb-4">API连接成功！</div>
          )}
          
          <button 
            onClick={testApi}
            disabled={loading}
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {loading ? '测试中...' : '重新测试'}
          </button>
        </div>
        
        {words.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">词条数据</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {words.map((word) => (
                <div key={word.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
  
                  <div className="text-white font-semibold">{word.word}</div>
                  <div className="text-gray-300 text-sm">分类: {word.category}</div>
                  <div className="text-gray-300 text-sm">投票: {word.total_votes}</div>
                  <div className="text-gray-300 text-sm">排名: {word.current_rank}</div>
                  <div className="text-gray-300 text-sm">占比: {word.percentage || '0.0'}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">API 端点</h2>
          <div className="space-y-2 text-gray-300">
            <div>基础URL: <code className="bg-black/20 px-2 py-1 rounded">http://localhost:3001/api</code></div>
            <div>健康检查: <code className="bg-black/20 px-2 py-1 rounded">GET /health</code></div>
            <div>词条列表: <code className="bg-black/20 px-2 py-1 rounded">GET /words</code></div>
            <div>热力图数据: <code className="bg-black/20 px-2 py-1 rounded">GET /words/heatmap/top</code></div>
            <div>分类列表: <code className="bg-black/20 px-2 py-1 rounded">GET /words/categories/list</code></div>
            <div>投票状态: <code className="bg-black/20 px-2 py-1 rounded">GET /votes/user/:walletAddress/today</code></div>
            <div>提交投票: <code className="bg-black/20 px-2 py-1 rounded">POST /votes</code></div>
          </div>
        </div>
      </div>
    </div>
  )
} 