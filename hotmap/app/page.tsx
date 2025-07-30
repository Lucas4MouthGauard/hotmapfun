'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { Word } from '@/lib/types'
import { wordsApi, votesApi } from '@/lib/api'
import { VoteModal } from '@/components/VoteModal'
import { TransactionHistory } from '@/components/TransactionHistory'
import { CustomWalletButton } from '@/components/CustomWalletButton'
import { MemeWord } from '@/lib/types'
import { recordVote } from '@/lib/utils'
import { TrendingUp, Users, Award, BarChart3, Search, Filter, Grid, List, Eye, Heart, Zap } from 'lucide-react'

export default function HomePage() {
  const { connected, publicKey } = useWallet()
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedWord, setSelectedWord] = useState<MemeWord | null>(null)
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [showTransactionHistory, setShowTransactionHistory] = useState(false)

  // 加载词条数据
  const loadWords = async () => {
    console.log('开始加载词条数据...')
    setLoading(true)
    setError(null)
    
    try {
      const response = await wordsApi.getAll()
      
      console.log('🔍 API响应详情:', {
        hasData: !!response,
        dataType: typeof response,
        isArray: Array.isArray(response),
        dataLength: Array.isArray(response) ? response.length : 0
      })
      
      if (response && Array.isArray(response)) {
        console.log('✅ 成功加载词条数据，数量:', response.length)
        setWords(response)
      } else {
        console.error('❌ 加载词条失败:', {
          response,
          dataType: typeof response
        })
        setError('加载词条失败')
        setWords([])
      }
    } catch (err) {
      console.error('❌ 网络请求失败:', err)
      setError('网络请求失败')
      setWords([])
    } finally {
      setLoading(false)
    }
  }

  // 处理投票
  const handleVote = (word: Word) => {
    if (!connected) {
      alert('请先连接钱包')
      return
    }
    const memeWord: MemeWord = {
      id: word.id,
      word: word.word,
      votes: word.total_votes || 0,
      percentage: word.percentage || 0,
      category: word.category,
      emoji: word.emoji || '🔥'
    }
    setSelectedWord(memeWord)
    setShowVoteModal(true)
  }

  // 确认投票
  const handleConfirmVote = async (isPaid: boolean, transactionSignature?: string) => {
    if (!selectedWord || !publicKey) return

    try {
      console.log('投票确认:', { 
        word: selectedWord.word, 
        isPaid, 
        walletAddress: publicKey.toString(),
        transactionSignature 
      })
      
      // 调用投票API
      const voteResponse = await votesApi.submitVote({
        wordId: selectedWord.id,
        walletAddress: publicKey.toString(),
        voteType: isPaid ? 'paid' : 'free'
      })
      
      if (voteResponse) {
        console.log('投票成功:', voteResponse)
        
        // 更新本地投票统计
        recordVote(publicKey.toString(), isPaid, transactionSignature)
        
        // 重新加载词条数据以显示更新后的投票数
        await loadWords()
        alert('投票成功！')
      } else {
        console.error('投票失败')
        alert('投票失败，请重试')
      }
      
      setShowVoteModal(false)
      setSelectedWord(null)
    } catch (err) {
      console.error('投票失败:', err)
      alert('投票失败，请重试')
    }
  }

  // 获取唯一分类
  const categories = ['all', ...Array.from(new Set(words.map(word => word.category)))]

  // 过滤词条
  const filteredWords = words.filter(word => {
    // 搜索过滤 - 只有当searchTerm不为空时才进行搜索
    const matchesSearch = !searchTerm || 
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    // 分类过滤
    const matchesCategory = selectedCategory === 'all' || word.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // 调试信息
  console.log('🔍 过滤状态:', {
    totalWords: words.length,
    filteredWords: filteredWords.length,
    searchTerm,
    selectedCategory,
    hasWords: words.length > 0,
    hasFilteredWords: filteredWords.length > 0
  })

  // 统计数据
  const stats = {
    totalWords: words.length,
    totalVotes: words.reduce((sum, word) => sum + (word.total_votes || 0), 0),
    topWord: words.length > 0 ? words.reduce((max, word) => 
      (word.total_votes || 0) > (max.total_votes || 0) ? word : max, words[0]) : null,
    categories: categories.length - 1
  }

  // 初始加载
  useEffect(() => {
    loadWords()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 头部导航 */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              <h1 className="text-xl font-bold text-white">热门词云</h1>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center space-x-4"
            >
              <CustomWalletButton />
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* 页面标题和统计卡片 */}
        <div className="mb-8">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              热门词云
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              发现最受关注的热门话题，参与社区共创，为你的最爱投票
            </p>
          </motion.div>

          {/* 统计卡片 */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">总投票数</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalVotes.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Users className="text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">词条总数</p>
                  <p className="text-2xl font-bold text-white">{stats.totalWords}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Award className="text-yellow-400" size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">最热词条</p>
                  <p className="text-lg font-semibold text-white truncate">
                    {stats.topWord ? stats.topWord.word : '暂无'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <BarChart3 className="text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">分类数量</p>
                  <p className="text-2xl font-bold text-white">{stats.categories}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 钱包连接提示 */}
        {!connected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 mb-8 text-center"
          >
            <div className="text-3xl mb-3">连接</div>
            <h3 className="text-xl font-semibold text-white mb-2">连接钱包开始投票</h3>
            <p className="text-blue-200 mb-4">
              连接 Solana 钱包后，你可以为喜欢的热词投票，参与社区共创！
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-blue-100">
              <span>支持的钱包:</span>
              <span className="px-3 py-1 bg-blue-500/20 rounded-full">Phantom</span>
              <span className="px-3 py-1 bg-blue-500/20 rounded-full">Solflare</span>
              <span className="px-3 py-1 bg-blue-500/20 rounded-full">OKX</span>
              <span className="px-3 py-1 bg-blue-500/20 rounded-full">Coinbase</span>
            </div>
          </motion.div>
        )}

        {/* 搜索和筛选 */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* 搜索框 */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="搜索词条或分类..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 分类筛选 */}
              <div className="flex items-center space-x-2">
                <Filter className="text-gray-400" size={20} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'all' ? '全部分类' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* 视图切换 */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 错误提示 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 text-center"
            >
              <p className="text-red-400 text-lg mb-2">错误: {error}</p>
              <button 
                onClick={loadWords}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                重新加载
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 词条展示区域 */}
        <div className="space-y-6">
          {(() => {
            console.log('🎭 渲染状态:', {
              loading,
              wordsLength: words.length,
              filteredWordsLength: filteredWords.length,
              searchTerm,
              selectedCategory,
              shouldShowWords: !loading && filteredWords.length > 0,
              shouldShowEmpty: !loading && filteredWords.length === 0
            })
            
            if (loading) {
              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-400 text-lg">加载中...</p>
                </motion.div>
              )
            }
            
            if (filteredWords.length > 0) {
              return (
                <>
                  {/* 网格视图 */}
                  {viewMode === 'grid' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                      {filteredWords.map((word, index) => (
                        <motion.div
                          key={word.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -4 }}
                          className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-blue-500/50 transition-all duration-300"
                        >
                          {/* 排名徽章 */}
                          <div className="flex items-center justify-between mb-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              index < 3 
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                                : 'bg-white/20 text-gray-300'
                            }`}>
                              #{index + 1}
                            </div>
                            <div className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">
                              {word.category}
                            </div>
                          </div>

                          {/* 词条内容 */}
                          <div className="text-center mb-4">
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                              {word.word}
                            </h3>
                            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                              <span className="flex items-center space-x-1">
                                <Heart size={14} />
                                <span>{word.total_votes?.toLocaleString() || 0}</span>
                              </span>
                              {word.percentage !== undefined && (
                                <span className="flex items-center space-x-1">
                                  <Zap size={14} />
                                  <span>{Number(word.percentage).toFixed(1)}%</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 投票按钮 */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleVote(word)}
                            disabled={!connected}
                            className={`w-full py-3 rounded-lg font-medium transition-all ${
                              connected
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                            }`}
                          >
                            {connected ? '投票支持' : '连接钱包投票'}
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* 列表视图 */}
                  {viewMode === 'list' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="space-y-4"
                    >
                      {filteredWords.map((word, index) => (
                        <motion.div
                          key={word.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 4 }}
                          className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-blue-500/50 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                index < 3 
                                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                                  : 'bg-white/20 text-gray-300'
                              }`}>
                                #{index + 1}
                              </div>
                              
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                                  {word.word}
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                                  <span className="bg-white/10 px-3 py-1 rounded-full">
                                    {word.category}
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <Heart size={14} />
                                    <span>{word.total_votes?.toLocaleString() || 0} 票</span>
                                  </span>
                                  {word.percentage !== undefined && (
                                    <span className="flex items-center space-x-1">
                                      <Zap size={14} />
                                      <span>{Number(word.percentage).toFixed(1)}% 热度</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleVote(word)}
                              disabled={!connected}
                              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                                connected
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                                  : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                              }`}
                            >
                              {connected ? '投票' : '连接钱包'}
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </>
              )
            }
            
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">搜索</div>
                <h3 className="text-2xl font-bold text-white mb-2">没有找到相关词条</h3>
                <p className="text-gray-400 mb-6">尝试调整搜索条件或查看所有词条</p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  查看所有词条
                </button>
              </motion.div>
            )
          })()}
        </div>

        {/* 快速操作按钮 */}
        {connected && (
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTransactionHistory(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                查看交易历史
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadWords}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? '加载中...' : '刷新数据'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </main>

      {/* 投票模态框 */}
      <AnimatePresence>
        {showVoteModal && selectedWord && (
          <VoteModal
            word={selectedWord}
            onConfirm={handleConfirmVote}
            onClose={() => {
              setShowVoteModal(false)
              setSelectedWord(null)
            }}
            walletAddress={publicKey?.toString()}
          />
        )}
      </AnimatePresence>

      {/* 交易历史模态框 */}
      <AnimatePresence>
        {showTransactionHistory && connected && publicKey && (
          <TransactionHistory 
            walletAddress={publicKey.toString()}
            onClose={() => setShowTransactionHistory(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
} 