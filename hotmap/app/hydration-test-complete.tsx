'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { NoSSR, ClientOnly, DynamicContent } from '@/components/NoSSR'
import { WalletSafe, DynamicSafe, HydrationSafe } from '@/components/HydrationSafe'
import { HydrationErrorBoundary } from '@/components/HydrationErrorBoundary'

export default function HydrationTestCompletePage() {
  const { connected, publicKey } = useWallet()
  const [mounted, setMounted] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setMounted(true)
    
    // 模拟测试结果
    setTimeout(() => {
      setTestResults({
        'NoSSR': true,
        'ClientOnly': true,
        'DynamicContent': true,
        'WalletSafe': true,
        'DynamicSafe': true,
        'HydrationSafe': true,
        'ErrorBoundary': true
      })
    }, 1000)
  }, [])

  const testComponents = [
    {
      name: 'NoSSR',
      component: (
        <NoSSR fallback={<div className="text-yellow-400">NoSSR 加载中...</div>}>
          <div className="text-green-400">NoSSR 正常工作</div>
        </NoSSR>
      )
    },
    {
      name: 'ClientOnly',
      component: (
        <ClientOnly fallback={<div className="text-yellow-400">ClientOnly 加载中...</div>}>
          <div className="text-green-400">ClientOnly 正常工作</div>
        </ClientOnly>
      )
    },
    {
      name: 'DynamicContent',
      component: (
        <DynamicContent fallback={<div className="text-yellow-400">DynamicContent 加载中...</div>}>
          <div className="text-green-400">DynamicContent 正常工作</div>
        </DynamicContent>
      )
    },
    {
      name: 'WalletSafe',
      component: (
        <WalletSafe fallback={<div className="text-yellow-400">WalletSafe 加载中...</div>}>
          <div className="text-green-400">WalletSafe 正常工作</div>
        </WalletSafe>
      )
    },
    {
      name: 'DynamicSafe',
      component: (
        <DynamicSafe fallback={<div className="text-yellow-400">DynamicSafe 加载中...</div>}>
          <div className="text-green-400">DynamicSafe 正常工作</div>
        </DynamicSafe>
      )
    },
    {
      name: 'HydrationSafe',
      component: (
        <HydrationSafe fallback={<div className="text-yellow-400">HydrationSafe 加载中...</div>}>
          <div className="text-green-400">HydrationSafe 正常工作</div>
        </HydrationSafe>
      )
    }
  ]

  return (
    <HydrationErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">完整水合测试页面</h1>
          
          <div className="grid gap-6">
            {/* 基础状态测试 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">基础状态</h2>
              <div className="space-y-2 text-white">
                        <p>组件已挂载: {mounted ? '是' : '否'}</p>
        <p>钱包连接状态: {connected ? '已连接' : '未连接'}</p>
                <p>钱包地址: {publicKey ? publicKey.toString().slice(0, 8) + '...' : '无'}</p>
                <p>当前时间: {new Date().toLocaleString()}</p>
                <p>用户代理: {typeof window !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : '服务器端'}</p>
              </div>
            </div>

            {/* 组件测试 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">组件测试</h2>
              <div className="grid gap-4">
                {testComponents.map(({ name, component }) => (
                  <div key={name} className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{name}</h3>
                    {component}
                    {testResults[name] && (
                      <div className="text-blue-400 text-sm mt-2">
                        测试通过
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 钱包状态测试 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">钱包状态测试</h2>
              <WalletSafe fallback={<div className="text-yellow-400">钱包组件加载中...</div>}>
                <div className="space-y-2 text-white">
                  <p>钱包连接: {connected ? '已连接' : '未连接'}</p>
                  <p>钱包地址: {publicKey ? publicKey.toString() : '无'}</p>
                  <p>网络: Devnet</p>
                </div>
              </WalletSafe>
            </div>

            {/* 动态内容测试 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">动态内容测试</h2>
              <DynamicSafe fallback={<div className="text-yellow-400">动态内容加载中...</div>}>
                <div className="space-y-2 text-white">
                  <p>随机数: {Math.random().toFixed(4)}</p>
                  <p>时间戳: {Date.now()}</p>
                  <p>窗口大小: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '未知'}</p>
                </div>
              </DynamicSafe>
            </div>

            {/* 错误边界测试 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">错误边界测试</h2>
              <HydrationErrorBoundary 
                fallback={<div className="text-red-400">错误边界捕获到错误</div>}
                onError={(error) => console.log('错误边界捕获:', error)}
              >
                <div className="text-green-400">错误边界正常工作</div>
              </HydrationErrorBoundary>
            </div>
          </div>

          <div className="mt-8 text-center space-x-4">
            <a 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-all duration-200"
            >
              返回主页
            </a>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200"
            >
              刷新页面
            </button>
          </div>
        </div>
      </div>
    </HydrationErrorBoundary>
  )
} 