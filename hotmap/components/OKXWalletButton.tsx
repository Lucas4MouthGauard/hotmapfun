'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'

interface OKXWallet {
  isOKXWallet?: boolean
  publicKey?: { toBytes(): Uint8Array }
  isConnected?: boolean
  connect?: () => Promise<void>
  disconnect?: () => Promise<void>
  signTransaction?: (transaction: any) => Promise<any>
  signAllTransactions?: (transactions: any[]) => Promise<any[]>
  signMessage?: (message: Uint8Array) => Promise<{ signature: Uint8Array }>
}

export function OKXWalletButton() {
  const { connected, publicKey, connect, disconnect } = useWallet()
  const [okxWallet, setOkxWallet] = useState<OKXWallet | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 检查OKX钱包是否已安装
  useEffect(() => {
    const checkOKXWallet = () => {
      if (typeof window !== 'undefined') {
        const wallet = (window as any).okxwallet
        if (wallet && wallet.isOKXWallet) {
          setOkxWallet(wallet)
          console.log('OKX钱包已检测到')
        } else {
          console.log('OKX钱包未安装')
        }
      }
    }

    checkOKXWallet()
    
    // 监听钱包状态变化
    const handleWalletChange = () => {
      checkOKXWallet()
    }

    window.addEventListener('load', handleWalletChange)
    return () => window.removeEventListener('load', handleWalletChange)
  }, [])

  const handleConnect = async () => {
    if (!okxWallet) {
      setError('请先安装OKX钱包扩展')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      if (okxWallet.connect) {
        await okxWallet.connect()
        console.log('OKX钱包连接成功')
        
        // 如果连接成功，更新钱包状态
        if (okxWallet.publicKey) {
          const publicKey = new PublicKey(okxWallet.publicKey.toBytes())
          console.log('钱包地址:', publicKey.toString())
        }
      } else {
        throw new Error('OKX钱包连接方法不可用')
      }
    } catch (err: any) {
      console.error('OKX钱包连接失败:', err)
      setError(err.message || '连接失败，请重试')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (okxWallet && okxWallet.disconnect) {
      try {
        await okxWallet.disconnect()
        console.log('OKX钱包已断开连接')
      } catch (err) {
        console.error('断开连接失败:', err)
      }
    }
  }

  if (!okxWallet) {
    return (
      <div className="flex flex-col items-center space-y-4 p-6 bg-white/5 rounded-xl border border-white/10">
        <div className="text-center">
          <div className="text-2xl mb-2">连接</div>
          <h3 className="text-white font-semibold mb-2">连接OKX钱包</h3>
          <p className="text-white/60 text-sm mb-4">
            请先安装OKX钱包浏览器扩展
          </p>
        </div>
        
        <div className="space-y-2 text-sm text-white/80">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>访问 <a href="https://www.okx.com/web3" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">OKX Web3</a></span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>下载并安装OKX钱包扩展</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span>刷新页面后重新连接</span>
          </div>
        </div>

        <button
          onClick={() => window.open('https://www.okx.com/web3', '_blank')}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
                      安装OKX钱包
        </button>
      </div>
    )
  }

  const isOKXConnected = okxWallet.isConnected && okxWallet.publicKey

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white/5 rounded-xl border border-white/10">
      <div className="text-center">
        <div className="text-2xl mb-2">🟢</div>
        <h3 className="text-white font-semibold mb-2">OKX钱包</h3>
        <p className="text-white/60 text-sm">
          {isOKXConnected ? '已连接' : '未连接'}
        </p>
      </div>

      {isOKXConnected && okxWallet.publicKey && (
        <div className="text-center">
          <p className="text-white/80 text-sm mb-2">钱包地址:</p>
          <p className="text-white font-mono text-xs bg-white/10 px-3 py-2 rounded-lg break-all">
            {new PublicKey(okxWallet.publicKey.toBytes()).toString().slice(0, 8)}...
            {new PublicKey(okxWallet.publicKey.toBytes()).toString().slice(-8)}
          </p>
        </div>
      )}

      {error && (
        <div className="text-red-400 text-sm text-center bg-red-500/10 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex space-x-3">
        {!isOKXConnected ? (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? '连接中...' : '连接OKX钱包'}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            断开连接
          </button>
        )}
      </div>

      <div className="text-xs text-white/40 text-center">
        OKX钱包已检测到，可以正常使用
      </div>
    </div>
  )
} 