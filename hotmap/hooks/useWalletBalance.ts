'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { createConnection, getWalletBalance } from '@/lib/solana'

export function useWalletBalance() {
  const { connected, publicKey } = useWallet()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastFetchRef = useRef<number>(0)

  const fetchBalance = useCallback(async () => {
    if (!connected || !publicKey) {
      setBalance(null)
      setError(null)
      return
    }

    // 防止频繁请求（至少间隔5秒）
    const now = Date.now()
    if (now - lastFetchRef.current < 5000) {
      return
    }
    lastFetchRef.current = now

    setLoading(true)
    setError(null)

    try {
      console.log('正在获取钱包余额...', publicKey.toString())
      const connection = createConnection()
      
      // 增加超时和重试机制
      const walletBalance = await Promise.race([
        getWalletBalance(connection, publicKey),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('余额查询超时')), 10000)
        )
      ])
      
      console.log('获取到余额:', walletBalance, 'SOL')
      setBalance(walletBalance)
      setError(null) // 清除之前的错误
    } catch (err) {
      console.error('获取钱包余额失败:', err)
      let errorMessage = '获取余额失败'
      
      if (err instanceof Error) {
        if (err.message.includes('fetch failed') || err.message.includes('network')) {
          errorMessage = '网络连接失败，请检查网络'
        } else if (err.message.includes('timeout') || err.message.includes('超时')) {
          errorMessage = '查询超时，请稍后重试'
        } else if (err.message.includes('rate limit') || err.message.includes('限制')) {
          errorMessage = '请求过于频繁，请稍后重试'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      setBalance(null)
    } finally {
      setLoading(false)
    }
  }, [connected, publicKey?.toString()]) // 只依赖publicKey的字符串表示

  // 初始获取余额
  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  // 定期更新余额（每60秒，而不是30秒）
  useEffect(() => {
    if (!connected) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // 清除之前的定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(fetchBalance, 60000)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [connected, fetchBalance])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance
  }
} 