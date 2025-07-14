'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Wordcloud } from '@visx/wordcloud'
import { Group } from '@visx/group'
import { scaleLog } from '@visx/scale'
import { motion, AnimatePresence } from 'framer-motion'
import { Word } from '@/lib/api'

interface ProfessionalWordCloudProps {
  words: Word[]
  width?: number
  height?: number
  className?: string
}

interface WordData {
  text: string
  value: number
  category: string
  rank: number
}

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
]

const ProfessionalWordCloud: React.FC<ProfessionalWordCloudProps> = ({
  words,
  width = 800,
  height = 600,
  className = ''
}) => {
  const [hoveredWord, setHoveredWord] = useState<WordData | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // 数据转换和过滤 - 确保rank字段始终有值
  const wordData: WordData[] = useMemo(() => {
    if (!words || !Array.isArray(words)) {
      console.warn('words数据无效:', words)
      return []
    }

    console.log('开始处理词条数据，原始数据:', words)

    return words
      .filter(word => {
        // 确保word对象存在且有效
        if (!word || typeof word !== 'object') {
          console.warn('无效的word对象:', word)
          return false
        }
        return selectedCategory === 'all' || word.category === selectedCategory
      })
      .map((word, index) => {
        // 安全地提取rank值，优先使用current_rank，然后是rank，最后是index+1
        const safeRank = word.current_rank ?? word.rank ?? (index + 1)
        
        console.log(`处理词条 "${word.word}":`, {
          original: { current_rank: word.current_rank, rank: word.rank },
          safeRank,
          index: index + 1
        })
        
        return {
          text: word.word || '未知词条',
          value: word.total_votes || 0,
          category: word.category || '未分类',
          rank: safeRank
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 50) // 限制词条数量以保证性能
  }, [words, selectedCategory])

  // 获取唯一分类
  const categories = useMemo(() => {
    if (!words || !Array.isArray(words)) return ['all']
    
    const uniqueCategories = Array.from(
      new Set(
        words
          .filter(word => word && word.category)
          .map(word => word.category)
      )
    )
    return ['all', ...uniqueCategories]
  }, [words])

  // 字体大小计算
  const fontScale = useMemo(() => {
    if (wordData.length === 0) {
      return () => 20 // 默认字体大小
    }
    const minValue = Math.min(...wordData.map(d => d.value))
    const maxValue = Math.max(...wordData.map(d => d.value))
    return scaleLog({
      domain: [minValue, maxValue],
      range: [12, 60]
    })
  }, [wordData])

  // 颜色分配 - 确保rank值安全
  const getColor = useCallback((word: WordData) => {
    // 确保word对象和rank属性存在
    if (!word || typeof word.rank !== 'number') {
      console.warn('getColor: 无效的word或rank:', word)
      return colors[0] // 返回默认颜色
    }
    
    const colorIndex = word.rank % colors.length
    return colors[colorIndex]
  }, [])

  // 词云配置
  const wordCloudProps = {
    width,
    height,
    font: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: (d: WordData) => fontScale(d.value),
    fontStyle: 'normal',
    fontWeight: 'bold',
    padding: 2,
    rotate: 0,
    spiral: 'archimedean' as const,
    random: () => 0.5, // 固定随机种子以获得一致布局
  }

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.05
      }
    }
  }

  const wordVariants = {
    hidden: { opacity: 0, scale: 0, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 }
    }
  }

  // 如果没有数据，显示空状态
  if (!words || words.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <motion.div 
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            热门词云
          </h2>
          <p className="text-gray-500 text-lg">暂无数据</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* 标题 */}
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          热门词云
        </h2>
        <p className="text-gray-600 text-sm">
          发现最受关注的热门话题
        </p>
      </motion.div>

      {/* 分类筛选器 */}
      <motion.div 
        className="flex flex-wrap justify-center gap-2 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {categories.map((category) => (
          <motion.button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category === 'all' ? '全部' : category}
          </motion.button>
        ))}
      </motion.div>

      {/* 词云容器 */}
      <motion.div 
        className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl overflow-hidden"
        style={{ width, height }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 bg-purple-400 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-pink-400 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-400 rounded-full blur-xl"></div>
        </div>

        {/* 词云 */}
        <Wordcloud {...wordCloudProps} words={wordData}>
          {(cloudWords: any[]) => (
            <Group>
              <AnimatePresence>
                {cloudWords.map((w: any, i: number) => (
                  <motion.text
                    key={`word-${i}`}
                    textAnchor="middle"
                    transform={`translate(${w.x}, ${w.y})rotate(${w.rotate})`}
                    fontSize={w.size}
                    fontFamily={w.font}
                    fill={getColor(w.data)}
                    style={{
                      cursor: 'pointer',
                      filter: hoveredWord === w.data ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none'
                    }}
                    variants={wordVariants}
                    whileHover="hover"
                    onMouseEnter={() => setHoveredWord(w.data)}
                    onMouseLeave={() => setHoveredWord(null)}
                  >
                    {w.text}
                  </motion.text>
                ))}
              </AnimatePresence>
            </Group>
          )}
        </Wordcloud>

        {/* 悬停提示 */}
        <AnimatePresence>
          {hoveredWord && (
            <motion.div
              className="absolute bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 z-10"
              style={{
                left: Math.min(width - 200, 20),
                top: Math.min(height - 100, 20)
              }}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-sm">
                <div className="font-bold text-gray-800">{hoveredWord.text}</div>
                <div className="text-gray-600">投票数: {hoveredWord.value.toLocaleString()}</div>
                <div className="text-gray-600">排名: #{hoveredWord.rank}</div>
                <div className="text-gray-600">分类: {hoveredWord.category}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 图例 */}
      <motion.div 
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>字体大小 = 投票数量</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
            <span>颜色 = 排名分组</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>悬停查看详情</span>
          </div>
        </div>
      </motion.div>

      {/* 统计信息 */}
      <motion.div 
        className="mt-4 grid grid-cols-3 gap-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            {wordData.length}
          </div>
          <div className="text-xs text-gray-500">显示词条</div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-pink-600">
            {wordData.reduce((sum, word) => sum + word.value, 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">总投票数</div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {categories.length - 1}
          </div>
          <div className="text-xs text-gray-500">分类数量</div>
        </div>
      </motion.div>
    </div>
  )
}

export default ProfessionalWordCloud 