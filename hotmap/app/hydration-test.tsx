'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { ClientOnly } from '@/components/ClientOnly'

export default function HydrationTestPage() {
  const { connected, publicKey } = useWallet()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">水合测试页面</h1>
        
        <div className="grid gap-6">
          {/* 客户端状态测试 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">客户端状态</h2>
            <div className="space-y-2 text-white">
                      <p>组件已挂载: {mounted ? '是' : '否'}</p>
        <p>钱包连接状态: {connected ? '已连接' : '未连接'}</p>
              <p>钱包地址: {publicKey ? publicKey.toString() : '无'}</p>
            </div>
          </div>

          {/* ClientOnly 组件测试 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">ClientOnly 组件测试</h2>
            <ClientOnly fallback={<div className="text-white">加载中...</div>}>
              <div className="text-white">
                <p>这个内容只在客户端渲染</p>
                <p>钱包状态: {connected ? '已连接' : '未连接'}</p>
              </div>
            </ClientOnly>
          </div>

          {/* 条件渲染测试 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">条件渲染测试</h2>
            <ClientOnly fallback={<div className="text-white">等待钱包状态...</div>}>
              {connected ? (
                <div className="text-green-400">
                  <p>钱包已连接</p>
                  <p>地址: {publicKey?.toString()}</p>
                </div>
              ) : (
                <div className="text-yellow-400">
                  <p>钱包未连接</p>
                  <p>请连接钱包以继续</p>
                </div>
              )}
            </ClientOnly>
          </div>

          {/* 动态内容测试 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">动态内容测试</h2>
            <ClientOnly fallback={<div className="text-white">计算中...</div>}>
              <div className="text-white">
                <p>当前时间: {new Date().toLocaleString()}</p>
                <p>随机数: {Math.random().toFixed(4)}</p>
                <p>用户代理: {navigator.userAgent.substring(0, 50)}...</p>
              </div>
            </ClientOnly>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-all duration-200"
          >
            返回主页
          </a>
        </div>
      </div>
    </div>
  )
} 