'use client'

import React, { useState } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { OKXWalletButton } from './OKXWalletButton'

export function WalletSelector() {
  const [selectedWallet, setSelectedWallet] = useState<'standard' | 'okx'>('standard')

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 钱包选择标签 */}
      <div className="flex bg-white/10 rounded-lg p-1 mb-6">
        <button
          onClick={() => setSelectedWallet('standard')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedWallet === 'standard'
              ? 'bg-white/20 text-white shadow-lg'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
                      标准钱包
        </button>
        <button
          onClick={() => setSelectedWallet('okx')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedWallet === 'okx'
              ? 'bg-white/20 text-white shadow-lg'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          🟢 OKX钱包
        </button>
      </div>

      {/* 钱包说明 */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <h3 className="text-white font-semibold mb-2">
          {selectedWallet === 'standard' ? '标准钱包适配器' : 'OKX钱包'}
        </h3>
        <p className="text-white/60 text-sm">
          {selectedWallet === 'standard' 
            ? '支持 Phantom、Solflare、Coinbase、Torus 等主流钱包'
            : '专门为 OKX 钱包用户提供的连接方式'
          }
        </p>
      </div>

      {/* 钱包连接组件 */}
      <div className="space-y-4">
        {selectedWallet === 'standard' ? (
          <div className="flex flex-col items-center space-y-4">
            <WalletMultiButton className="!bg-gradient-to-r !from-blue-500 !to-purple-600 !text-white !font-medium !rounded-lg hover:!from-blue-600 hover:!to-purple-700 !transition-all !duration-200 !shadow-lg hover:!shadow-xl !border-0 !px-8 !py-3" />
            
            <div className="text-center text-white/60 text-sm">
              <p className="mb-2">支持的钱包:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-2 py-1 bg-white/10 rounded text-xs">Phantom</span>
                <span className="px-2 py-1 bg-white/10 rounded text-xs">Solflare</span>
                <span className="px-2 py-1 bg-white/10 rounded text-xs">Coinbase</span>
                <span className="px-2 py-1 bg-white/10 rounded text-xs">Torus</span>
              </div>
            </div>
          </div>
        ) : (
          <OKXWalletButton />
        )}
      </div>

      {/* 切换提示 */}
      <div className="mt-6 text-center">
        <p className="text-white/40 text-xs">
          如果遇到连接问题，可以尝试切换钱包类型
        </p>
      </div>
    </div>
  )
} 