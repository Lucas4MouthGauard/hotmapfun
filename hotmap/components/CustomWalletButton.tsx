'use client'

import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Wallet, LogOut, Copy, Check, RefreshCw } from 'lucide-react'
import { formatSol } from '@/lib/utils'
import { useWalletBalance } from '@/hooks/useWalletBalance'

export function CustomWalletButton() {
  const { connected, publicKey, disconnect } = useWallet()
  const { balance, loading, refetch } = useWalletBalance()
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  const handleRefreshBalance = () => {
    refetch()
  }

  if (!connected) {
    return (
      <div className="relative z-50">
        <WalletMultiButton className="wallet-button flex items-center space-x-2">
          <Wallet size={20} />
          <span>连接钱包</span>
        </WalletMultiButton>
      </div>
    )
  }

  return (
    <div className="relative z-50">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3">
        <div className="flex items-center space-x-3">
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-300">钱包地址</div>
            <div className="text-white font-mono text-sm truncate">
              {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>余额: {loading ? '加载中...' : (balance !== null && !isNaN(balance)) ? `${balance.toFixed(4)} SOL` : '获取失败'}</span>
              <button
                onClick={handleRefreshBalance}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                title="刷新余额"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={handleCopyAddress}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              title="复制地址"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            
            <button
              onClick={handleDisconnect}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/10"
              title="断开连接"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 