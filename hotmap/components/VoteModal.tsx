'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MemeWord } from '@/lib/types'
import { CONFIG } from '@/lib/data'
import { getVoteStatus, getVoteStatusDescription, canVoteFree, canVotePaid, getRemainingFreeVotes } from '@/lib/utils'
import { 
  createConnection, 
  createVoteTransaction, 
  sendVoteTransaction, 
  checkWalletBalance 
} from '@/lib/solana'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletBalance } from '@/hooks/useWalletBalance'
import { X, Heart, Coins, AlertCircle, CheckCircle, Loader, Wallet } from 'lucide-react'

interface VoteModalProps {
  word: MemeWord
  onConfirm: (isPaid: boolean, transactionSignature?: string) => void
  onClose: () => void
  walletAddress?: string
}

export function VoteModal({ word, onConfirm, onClose, walletAddress }: VoteModalProps) {
  const { signTransaction } = useWallet()
  const { balance, loading } = useWalletBalance()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactionStep, setTransactionStep] = useState<string>('')

  const voteStatus = walletAddress ? getVoteStatus(walletAddress) : null
  const canFree = walletAddress ? canVoteFree(walletAddress) : false
  const canPaid = walletAddress ? canVotePaid(walletAddress) : false
  const hasEnoughBalance = balance !== null && balance >= CONFIG.paidVoteCost
  const remainingFreeVotes = walletAddress ? getRemainingFreeVotes(walletAddress) : 0

  const handleVote = async (isPaid: boolean) => {
    if (!walletAddress) {
      setError('请先连接钱包')
      return
    }

    if (isPaid && !hasEnoughBalance) {
      setError(`余额不足，需要 ${CONFIG.paidVoteCost} SOL，当前余额 ${balance !== null ? balance.toFixed(4) : '未知'} SOL`)
      return
    }

    console.log('开始投票流程:', { isPaid, balance, hasEnoughBalance, walletAddress })

    setIsLoading(true)
    setError(null)

    try {
      if (isPaid) {
        // 付费投票流程
        setTransactionStep('检查钱包余额...')
        
        const connection = createConnection()
        const publicKey = new (await import('@solana/web3.js')).PublicKey(walletAddress)
        
        // 再次检查余额（双重保险）
        const hasEnoughBalance = await checkWalletBalance(connection, publicKey)
        if (!hasEnoughBalance) {
          throw new Error(`余额不足，需要 ${CONFIG.paidVoteCost} SOL`)
        }

        setTransactionStep('创建交易...')
        
        console.log('创建交易，项目方钱包:', CONFIG.projectWallet)
        
        // 创建交易
        const transaction = await createVoteTransaction(publicKey)
        
        console.log('交易创建成功:', transaction)
        
        setTransactionStep('等待钱包签名...')
        
        // 签名交易
        if (!signTransaction) {
          throw new Error('钱包不支持签名交易')
        }
        
        console.log('开始签名交易...')
        const signedTransaction = await signTransaction(transaction)
        console.log('交易签名成功:', signedTransaction)
        console.log('签名交易详情:', {
          signatures: signedTransaction.signatures,
          instructions: signedTransaction.instructions.length,
          feePayer: signedTransaction.feePayer?.toString(),
          recentBlockhash: signedTransaction.recentBlockhash
        })
        
        // 验证签名是否成功
        if (!signedTransaction.signatures || signedTransaction.signatures.length === 0) {
          throw new Error('交易签名失败，请重试')
        }
        
        console.log('签名验证成功，签名数量:', signedTransaction.signatures.length)
        
        setTransactionStep('发送交易...')
        
        // 发送已签名的交易
        const signature = await sendVoteTransaction(connection, signedTransaction)
        
        console.log('交易发送成功，签名:', signature)
        setTransactionStep('投票成功！')
        
        // 调用回调函数，传递交易签名
        onConfirm(isPaid, signature)
      } else {
        // 免费投票
        onConfirm(isPaid)
      }
    } catch (err) {
      console.error('投票失败:', err)
      let errorMessage = '投票失败，请重试'
      
      if (err instanceof Error) {
        errorMessage = err.message
        // 如果是网络相关错误，给出更友好的提示
        if (errorMessage.includes('fetch failed') || errorMessage.includes('network')) {
          errorMessage = '网络连接失败，请检查网络连接后重试'
        } else if (errorMessage.includes('User rejected')) {
          errorMessage = '用户取消了交易'
        } else if (errorMessage.includes('insufficient funds')) {
          errorMessage = '余额不足，请确保钱包有足够的 SOL'
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      setTransactionStep('')
    }
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
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white meme-text">
              投票确认
            </h3>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          <div className="text-center space-y-4">
            
            <h4 className="text-2xl font-bold text-white meme-text">
              {word.word}
            </h4>
            <p className="text-gray-300">
              当前票数: {word.votes} 票 ({Number(word.percentage || 0).toFixed(1)}%)
            </p>
          </div>

          {/* 钱包余额显示 */}
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Wallet className="text-primary-400" size={16} />
              <span className="text-gray-300">钱包余额:</span>
              <span className={`font-semibold ${hasEnoughBalance ? 'text-green-400' : 'text-red-400'}`}>
                {loading ? '加载中...' : (balance !== null && !isNaN(balance)) ? `${balance.toFixed(4)} SOL` : '获取失败'}
              </span>
            </div>
          </div>

          {/* 投票状态显示 */}
          {walletAddress && voteStatus && (
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                {voteStatus === 'free_available' && <CheckCircle className="text-green-400" size={16} />}
                {voteStatus === 'paid_required' && <AlertCircle className="text-yellow-400" size={16} />}
                {voteStatus === 'daily_limit_reached' && <AlertCircle className="text-red-400" size={16} />}
                <span className="text-gray-300">
                  {getVoteStatusDescription(voteStatus, walletAddress)}
                </span>
              </div>
            </div>
          )}

          {/* 交易进度显示 */}
          {isLoading && transactionStep && (
            <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader className="text-blue-400 animate-spin" size={16} />
                <span className="text-blue-400 text-sm">{transactionStep}</span>
              </div>
            </div>
          )}

          {/* 错误信息 */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {canFree && !isLoading ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleVote(false)}
                disabled={isLoading}
                className="w-full vote-button bg-green-500 hover:bg-green-600 text-white flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Heart size={20} />
                <span>免费投票 (剩余 {remainingFreeVotes} 次)</span>
              </motion.button>
            ) : null}

            {canPaid && !isLoading ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleVote(true)}
                disabled={isLoading || !hasEnoughBalance}
                className={`w-full vote-button flex items-center justify-center space-x-2 disabled:opacity-50 ${
                  hasEnoughBalance 
                    ? 'bg-primary-500 hover:bg-primary-600 text-white' 
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                <Coins size={20} />
                <span>付费投票 ({CONFIG.paidVoteCost} SOL)</span>
              </motion.button>
            ) : null}

            {voteStatus === 'daily_limit_reached' && (
              <div className="text-center text-red-400 text-sm">
                今日投票次数已达上限 ({CONFIG.maxVotesPerDay} 次)
              </div>
            )}

            <div className="text-center text-xs text-gray-400 mt-4 space-y-1">
              <p>• 每个钱包每天最多投票 {CONFIG.maxVotesPerDay} 次</p>
              <p>• 免费投票每天 {CONFIG.freeVotesPerDay} 次</p>
              <p>• 付费投票 {CONFIG.paidVoteCost} SOL/次</p>
              <p>• 付费投票将转账到项目方钱包</p>
              <p>• 投票后无法撤销</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 