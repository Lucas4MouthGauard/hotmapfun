'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Word } from '@/lib/types'

interface HeatmapViewProps {
  words: Word[]
  onVote: (word: Word) => void
  connected: boolean
}

export function HeatmapView({ words, onVote, connected }: HeatmapViewProps) {
  const [viewMode, setViewMode] = useState<'ranking' | 'trends'>('ranking')

  // 获取字体大小函数
  const getFontSize = (votes: number, maxVotes: number) => {
    const safeVotes = votes || 0
    const safeMaxVotes = maxVotes || 1
    const ratio = safeVotes / safeMaxVotes
    return Math.max(16, Math.min(48, 16 + ratio * 32))
  }

  // 获取云图位置函数
  const getCloudPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI
    const radius = 30 + Math.random() * 20
    const x = Math.cos(angle) * radius + 50 + Math.random() * 20
    const y = Math.sin(angle) * radius + 50 + Math.random() * 20
    return { x, y }
  }

  const maxVotes = Math.max(...words.map(w => w.total_votes || 0), 1)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-between items-center mb-6"
      >
        <h2 className="text-2xl font-bold text-white flex items-center">
          热门词条分析
        </h2>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('ranking')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'ranking'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            热度排行
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('trends')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'trends'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            趋势分析
          </motion.button>
      </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* 热度排行 */}
        {viewMode === 'ranking' && (
          <motion.div
            key="ranking"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-white/80 text-sm mb-4"
            >
              查看当前最热门的词条排行，激发你的参与热情！
            </motion.div>
            <div className="grid gap-4">
              {words
                .sort((a, b) => (b.total_votes || 0) - (a.total_votes || 0))
                .slice(0, 20)
                .map((word, index) => {
                  const isTop3 = index < 3
                  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''
          
          return (
            <motion.div
              key={word.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        scale: 1.02, 
                        y: -2,
                        transition: { duration: 0.2 }
                      }}
                      className={`relative bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-4 border border-white/20 hover:border-primary-400/50 transition-all group ${
                        isTop3 ? 'shadow-lg shadow-primary-500/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                            className={`text-2xl font-bold ${
                              index === 0 ? 'text-yellow-400' : 
                              index === 1 ? 'text-gray-300' : 
                              index === 2 ? 'text-amber-600' : 'text-white/60'
                            }`}
                          >
                            {medal} #{index + 1}
                          </motion.div>
                          <div>
                            <div className="text-white font-bold text-lg">{word.word}</div>
                            <div className="text-white/60 text-sm">{word.category}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.05 + 0.3 }}
                            className="text-white font-bold text-xl"
                          >
                            {(word.total_votes || 0).toLocaleString()}
                          </motion.div>
                          <div className="text-white/60 text-sm">票数</div>
                          {word.percentage !== undefined && !isNaN(Number(word.percentage)) && (
                            <div className="text-primary-400 text-sm font-medium">
                              {Number(word.percentage).toFixed(1)}% 热度
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 投票按钮 */}
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.4 }}
                        className="mt-3 flex justify-end"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onVote(word)}
                          disabled={!connected}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            connected
                              ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl'
                              : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          {connected ? '投票' : '连接钱包投票'}
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  )
                })}
            </div>
          </motion.div>
        )}

        {/* 趋势分析 */}
        {viewMode === 'trends' && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-white/80 text-sm mb-4"
            >
              通过多维度数据分析发现热门趋势，字体大小代表热度强度！
            </motion.div>
            
            {/* 趋势统计卡片 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30"
              >
                <div className="text-blue-300 text-sm font-medium">总词条数</div>
                <div className="text-white text-2xl font-bold">{words.length}</div>
                <div className="text-blue-300/60 text-xs">活跃词条</div>
              </motion.div>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30"
              >
                <div className="text-green-300 text-sm font-medium">总投票数</div>
                <div className="text-white text-2xl font-bold">{words.reduce((sum, word) => sum + (word.total_votes || 0), 0).toLocaleString()}</div>
                <div className="text-green-300/60 text-xs">累计投票</div>
              </motion.div>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30"
              >
                <div className="text-purple-300 text-sm font-medium">平均热度</div>
                <div className="text-white text-2xl font-bold">
                  {words.length > 0 ? (words.reduce((sum, word) => sum + (word.percentage || 0), 0) / words.length).toFixed(1) : '0.0'}%
                </div>
                <div className="text-purple-300/60 text-xs">热度均值</div>
              </motion.div>
            </motion.div>

            {/* 分类趋势 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/5 rounded-xl p-4 mb-6"
            >
              <h3 className="text-white font-bold text-lg mb-4">分类热度分布</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(() => {
                  const categories = words.reduce((acc, word) => {
                    const category = word.category || '未分类'
                    if (!acc[category]) {
                      acc[category] = { count: 0, totalVotes: 0, avgPercentage: 0 }
                    }
                    acc[category].count++
                    acc[category].totalVotes += word.total_votes || 0
                    acc[category].avgPercentage += word.percentage || 0
                    return acc
                  }, {} as Record<string, { count: number, totalVotes: number, avgPercentage: number }>)

                  return Object.entries(categories)
                    .sort(([,a], [,b]) => b.totalVotes - a.totalVotes)
                    .slice(0, 8)
                    .map(([category, stats], index) => (
                      <motion.div 
                        key={category} 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="bg-white/10 rounded-lg p-3 border border-white/20"
                      >
                        <div className="text-white font-medium text-sm truncate">{category}</div>
                        <div className="text-white/60 text-xs mt-1">{stats.count} 个词条</div>
                        <div className="text-primary-400 text-xs mt-1">
                          {(stats.avgPercentage / stats.count).toFixed(1)}% 平均热度
                        </div>
                      </motion.div>
                    ))
                })()}
              </div>
            </motion.div>

            {/* 词云展示 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/5 rounded-xl p-4"
            >
              <motion.h3 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-white font-bold text-lg mb-4 flex items-center space-x-2"
              >
                <motion.span
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  ⭐
                </motion.span>
                <span>热门词云</span>
                <motion.span
                  animate={{
                    rotate: [0, -360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  ✨
                </motion.span>
              </motion.h3>
              
              {/* 专业级词云容器 */}
              <div className="relative w-full h-96 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-pink-900/30 rounded-xl overflow-hidden border border-white/10">
                {/* 高级背景效果 */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(255,255,255,0.05),transparent_25%,rgba(255,255,255,0.05),transparent_50%)] animate-spin" style={{animationDuration: '20s'}}></div>
                
                {/* 动态光晕系统 - 优化内存使用 */}
                <motion.div 
                  animate={{
                    x: [0, 20, 0],
                    y: [0, -15, 0],
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-4 left-4 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
                ></motion.div>
                
                <motion.div 
                  animate={{
                    x: [0, -25, 0],
                    y: [0, 20, 0],
                    scale: [1, 0.8, 1],
                    opacity: [0.4, 0.7, 0.4]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                  className="absolute bottom-4 right-4 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-red-400/20 rounded-full blur-xl"
                ></motion.div>
                
                {/* 云朵包围的词云布局 */}
                {words
                  .sort((a, b) => (b.total_votes || 0) - (a.total_votes || 0))
                  .slice(0, 25) // 减少数量以优化性能
                  .map((word, index) => {
                    const voteRatio = (word.total_votes || 0) / maxVotes
                    
                    // 优化的字体大小算法
                    const fontSize = Math.max(14, Math.min(48, 14 + Math.pow(voteRatio, 0.7) * 34))
                    
                    // 简化的颜色系统
                    const hue = voteRatio > 0.8 ? 340 + Math.random() * 20 :
                               voteRatio > 0.6 ? 280 + Math.random() * 30 :
                               voteRatio > 0.4 ? 200 + Math.random() * 40 :
                               voteRatio > 0.2 ? 160 + Math.random() * 30 :
                                               60 + Math.random() * 40
                    
                    const saturation = 75 + voteRatio * 20
                    const lightness = 65 + voteRatio * 20
                    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`
                    
                    // 云朵形状布局 - 使用极坐标系统
                    const angle = (index / 25) * 2 * Math.PI
                    const radius = 25 + Math.random() * 20 + (1 - voteRatio) * 25
                    const x = Math.cos(angle) * radius + 50 + (Math.random() - 0.5) * 15
                    const y = Math.sin(angle) * radius + 50 + (Math.random() - 0.5) * 15
                    
                    const opacity = 0.8 + voteRatio * 0.2
                    const fontWeight = voteRatio > 0.7 ? 'bold' : voteRatio > 0.4 ? 'semibold' : 'normal'
                    const zIndex = Math.floor(voteRatio * 15)
                    
                    // 简化的文字阴影
                    const textShadow = `0 2px 8px rgba(0,0,0,0.4), 0 0 20px ${color}40`
                    
                    return (
                <motion.div
                        key={word.id}
                        initial={{ 
                          opacity: 0, 
                          scale: 0,
                          x: Math.random() * 150 - 75,
                          y: Math.random() * 150 - 75,
                          rotate: Math.random() * 360
                        }}
                        animate={{ 
                          opacity: opacity, 
                          scale: 1,
                          x: 0,
                          y: 0,
                          rotate: 0
                        }}
                        transition={{ 
                          duration: 1.2 + Math.random() * 0.6,
                          delay: index * 0.03,
                          type: "spring",
                          stiffness: 40,
                          damping: 10
                        }}
                        whileHover={{ 
                          scale: 1.3, 
                          zIndex: 100,
                          rotate: [0, -5, 5, 0],
                          transition: { 
                            duration: 0.3,
                            scale: { duration: 0.2 },
                            rotate: { duration: 0.6, repeat: Infinity, repeatType: "reverse" }
                          }
                        }}
                        className="absolute group cursor-pointer select-none"
                        style={{
                          left: `${Math.max(5, Math.min(95, x))}%`,
                          top: `${Math.max(5, Math.min(95, y))}%`,
                          fontSize: `${fontSize}px`,
                          color: color,
                          fontWeight: fontWeight,
                          textShadow: textShadow,
                          zIndex: zIndex,
                          transform: 'translate(-50%, -50%)',
                          filter: `drop-shadow(0 4px 12px rgba(0,0,0,0.4))`,
                          letterSpacing: '0.5px',
                          textRendering: 'optimizeLegibility'
                        }}
                  onClick={() => onVote(word)}
                      >
                        {/* 云朵背景 */}
                        <div className="relative">
                          <svg
                            width={fontSize * 1.8}
                            height={fontSize * 1.2}
                            viewBox="0 0 100 60"
                            className="absolute inset-0 -z-10"
                            style={{
                              filter: `drop-shadow(0 2px 8px ${color}30)`
                            }}
                          >
                            <defs>
                              <radialGradient id={`cloudGradient${word.id}`} cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor={`${color}20`} />
                                <stop offset="100%" stopColor={`${color}05`} />
                              </radialGradient>
                            </defs>
                            <path
                              d="M10,30 Q10,15 25,15 Q35,5 50,5 Q65,5 75,15 Q90,15 90,30 Q90,45 75,45 Q65,55 50,55 Q35,55 25,45 Q10,45 10,30 Z"
                              fill={`url(#cloudGradient${word.id})`}
                              stroke={`${color}40`}
                              strokeWidth="1"
                              opacity="0.8"
                            />
                          </svg>
                          
                          {/* 文字内容 */}
                          <span className="block whitespace-nowrap font-sans tracking-wide relative z-10">
                            {word.word}
                          </span>
                        </div>
                        
                        {/* 优化的悬停提示 */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          whileHover={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 px-3 py-2 bg-black/95 backdrop-blur-sm text-white text-xs rounded-lg whitespace-nowrap z-50 border border-white/20 shadow-2xl"
                          style={{
                            boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${color}30`
                          }}
                        >
                          <div className="font-bold text-sm mb-1">{word.word}</div>
                          <div className="text-blue-300 text-xs mb-1">{word.category}</div>
                          <div className="text-yellow-300 font-semibold">{(word.total_votes || 0).toLocaleString()} 票</div>
                          <div className="text-green-300 text-xs">
                            {word.percentage !== undefined && !isNaN(Number(word.percentage)) ? Number(word.percentage).toFixed(1) : '0.0'}% 热度
                          </div>
                          <div className="text-purple-300 text-xs mt-1 font-medium">点击投票</div>
                          
                          {/* 箭头 */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-black/95"></div>
                        </motion.div>
                      </motion.div>
                    )
                  })}
              </div>
              
                              {/* 优化的图例说明 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="space-y-3 mt-4"
                >
                  {/* 简化的交互提示 */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-2 border border-blue-500/20">
                    <div className="text-blue-300 text-xs font-medium">💡 云朵词云</div>
                    <div className="text-white/70 text-xs">
                      每个词条都被云朵包围 • 悬停查看详情 • 点击投票
                    </div>
                  </div>
                  
                  {/* 简化的颜色图例 */}
                  <div className="flex items-center justify-center space-x-4 text-white/80 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span>超热门</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>很热门</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>热门</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>较热门</span>
                    </div>
                  </div>
                  
                  {/* 简化的字体说明 */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-2 border border-purple-500/20">
                    <div className="text-purple-300 text-xs font-medium mb-2">📏 云朵大小</div>
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <div className="flex items-center space-x-2">
                        <span style={{ fontSize: '10px' }} className="text-white">小云朵</span>
                        <span>→</span>
                        <span style={{ fontSize: '24px' }} className="text-white font-bold">大云朵</span>
                      </div>
                      <div className="text-center">
                        <div className="text-white/80">热度越高云朵越大</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
            </motion.div>

            {/* 趋势洞察 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20"
            >
              <h3 className="text-yellow-300 font-bold text-lg mb-3">💡 趋势洞察</h3>
              <div className="space-y-2 text-white/80 text-sm">
                    <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center space-x-2"
                >
                  <span className="text-yellow-400">热门</span>
                  <span>最热门分类：{(() => {
                    const categories = words.reduce((acc, word) => {
                      const category = word.category || '未分类'
                      if (!acc[category]) acc[category] = 0
                      acc[category] += word.total_votes || 0
                      return acc
                    }, {} as Record<string, number>)
                    const topCategory = Object.entries(categories).sort(([,a], [,b]) => b - a)[0]
                    return topCategory ? `${topCategory[0]} (${topCategory[1].toLocaleString()} 票)` : '暂无数据'
                  })()}</span>
                    </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center space-x-2"
                >
                  <span className="text-green-400">📈</span>
                  <span>平均投票数：{(words.reduce((sum, word) => sum + (word.total_votes || 0), 0) / words.length).toFixed(0)} 票/词条</span>
                </motion.div>
                  <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center space-x-2"
                >
                  <span className="text-blue-400">目标</span>
                  <span>热度分布：{words.filter(w => (w.percentage || 0) > 5).length} 个高热度词条，{words.filter(w => (w.percentage || 0) <= 1).length} 个低热度词条</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 