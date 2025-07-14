'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Search, Grid, List } from 'lucide-react'
import { CustomWalletButton } from './CustomWalletButton'

interface HeaderProps {
  connected: boolean
  viewMode: 'heatmap' | 'list'
  onViewModeChange: (mode: 'heatmap' | 'list') => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function Header({ 
  connected, 
  viewMode, 
  onViewModeChange, 
  searchTerm, 
  onSearchChange 
}: HeaderProps) {
  return (
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

            
            {connected && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center space-x-2"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onViewModeChange('heatmap')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'heatmap' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Grid size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onViewModeChange('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <List size={20} />
                </motion.button>
              </motion.div>
            )}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center space-x-4"
          >
            {connected && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="relative"
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  type="text"
                  placeholder="搜索词条..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <CustomWalletButton />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
} 