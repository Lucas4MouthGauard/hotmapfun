'use client'

import React, { useState, useEffect } from 'react'
import { wordsApi } from '@/lib/api'

export default function TestApi() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiUrl, setApiUrl] = useState<string>('')

  const testApi = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🧪 开始测试API...')
      
      // 测试直接fetch
      const directResponse = await fetch('http://localhost:3001/api/words?limit=5')
      console.log('🧪 直接fetch结果:', directResponse.status, directResponse.ok)
      
      if (directResponse.ok) {
        const directData = await directResponse.json()
        console.log('🧪 直接fetch数据:', directData)
        setApiUrl('http://localhost:3001/api/words?limit=5')
      }
      
      // 测试API函数
      const response = await wordsApi.getWords({
        limit: 5,
        sort: 'total_votes',
        order: 'desc'
      })
      
      console.log('🧪 API函数结果:', response)
      setResult(response)
    } catch (err) {
      console.error('🧪 API测试失败:', err)
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testApi()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">API 测试页面</h1>
      
      <div className="mb-4">
        <p className="text-gray-300">API URL: {apiUrl || '未获取'}</p>
      </div>
      
      <button 
        onClick={testApi}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 mb-4"
      >
        {loading ? '测试中...' : '重新测试'}
      </button>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded p-4 mb-4">
          <h3 className="text-red-400 font-bold">错误:</h3>
          <p className="text-red-300">{error}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-green-500/20 border border-green-500/30 rounded p-4">
          <h3 className="text-green-400 font-bold">API响应:</h3>
          <pre className="text-green-300 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 