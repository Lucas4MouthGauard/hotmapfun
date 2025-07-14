'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Word } from '@/lib/api'
import { getHeatColor } from '@/lib/utils'
import { Heart, TrendingUp } from 'lucide-react'

interface WordListProps {
  words: Word[]
  onVote: (word: Word) => void
  connected: boolean
}

export function WordList({ words, onVote, connected }: WordListProps) {
  const maxVotes = Math.max(...words.map(w => w.total_votes), 1)

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 border border-white/10">
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
          <span className="text-gray-300 text-sm font-medium">
            实时热度排行 · 智能搜索 · 一键投票
          </span>
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="space-y-2">
        {words.map((word, index) => {
          const heatColor = getHeatColor(word.total_votes, maxVotes)
          
          return (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className="group"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-400 w-8">
                        #{word.current_rank || index + 1}
                      </span>
      
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold meme-text ${heatColor}`}>
                        {word.word}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center space-x-1">
                          <TrendingUp size={14} />
                          <span>{word.total_votes} 票</span>
                        </span>
                        <span>{word.percentage !== undefined && !isNaN(Number(word.percentage)) ? Number(word.percentage).toFixed(1) : '0.0'}%</span>
                        <span className="bg-white/10 px-2 py-1 rounded text-xs">
                          {word.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {connected && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onVote(word)}
                        className="vote-button bg-primary-500 hover:bg-primary-600 text-white"
                      >
                        <Heart size={16} />
                      </motion.button>
                    )}
                  </div>
                </div>
                
                {word.total_votes > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(word.total_votes / maxVotes) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-600`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {words.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl">没有找到匹配的词条</p>
        </div>
      )}
    </div>
  )
} 