'use client'

import React from 'react'
import { TrendingUp, Award, Users } from 'lucide-react'
import { Word } from '@/lib/types'

interface StatsProps {
  words: Word[]
  walletAddress?: string
}

export function Stats({ words }: StatsProps) {
  // 核心数据计算
  const totalVotes = (words || []).reduce((sum, word) => sum + word.total_votes, 0)
  const topWord = (words || []).length > 0 
    ? (words || []).reduce((max, word) => word.total_votes > max.total_votes ? word : max, words[0])
    : null
  const wordCount = (words || []).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* 总投票数 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <div className="flex items-center space-x-3">
          <TrendingUp className="text-blue-400" size={20} />
          <div>
            <p className="text-gray-400 text-sm">总投票数</p>
            <p className="text-xl font-bold text-white">
              {totalVotes.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      
      {/* 最热词条 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <div className="flex items-center space-x-3">
          <Award className="text-yellow-400" size={20} />
          <div>
            <p className="text-gray-400 text-sm">最热词条</p>
            <p className="text-lg font-semibold text-white truncate">
              {topWord ? topWord.word : '暂无'}
            </p>
            <p className="text-sm text-gray-400">{topWord?.total_votes || 0} 票</p>
          </div>
        </div>
      </div>
      
      {/* 词条总数 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <div className="flex items-center space-x-3">
          <Users className="text-green-400" size={20} />
          <div>
            <p className="text-gray-400 text-sm">词条总数</p>
            <p className="text-xl font-bold text-white">
              {wordCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 