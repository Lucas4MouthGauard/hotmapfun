'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VoteTransaction } from '@/lib/types'
import { getUserVoteTransactions } from '@/lib/utils'
import { History, ExternalLink, Copy, Check } from 'lucide-react'

interface TransactionHistoryProps {
  walletAddress: string
  onClose: () => void
}

export function TransactionHistory({ walletAddress, onClose }: TransactionHistoryProps) {
  const [copiedSignature, setCopiedSignature] = useState<string | null>(null)
  const transactions = getUserVoteTransactions(walletAddress)

  const handleCopySignature = async (signature: string) => {
    await navigator.clipboard.writeText(signature)
    setCopiedSignature(signature)
    setTimeout(() => setCopiedSignature(null), 2000)
  }

  const openExplorer = (signature: string) => {
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'
    const explorerUrl = network === 'mainnet-beta' 
      ? `https://solscan.io/tx/${signature}`
      : `https://solscan.io/tx/${signature}?cluster=devnet`
    window.open(explorerUrl, '_blank')
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <History className="text-primary-400" size={24} />
              <h3 className="text-xl font-bold text-white">
                投票交易历史
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="overflow-y-auto max-h-[60vh] space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">暂无付费投票记录</p>
              </div>
            ) : (
              transactions.map((tx, index) => (
                <motion.div
                  key={tx.signature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-400">交易签名:</span>
                        <span className="text-sm text-white font-mono">
                          {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>金额: {tx.amount} SOL</span>
                        <span>状态: {tx.status}</span>
                        <span>时间: {new Date(tx.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopySignature(tx.signature)}
                        className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                        title="复制签名"
                      >
                        {copiedSignature === tx.signature ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                      
                      <button
                        onClick={() => openExplorer(tx.signature)}
                        className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                        title="在浏览器中查看"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            <p>共 {transactions.length} 笔付费投票交易</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 