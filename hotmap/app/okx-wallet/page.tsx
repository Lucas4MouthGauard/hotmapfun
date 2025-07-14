'use client'

import React from 'react'
import { OKXWalletButton } from '@/components/OKXWalletButton'
import Link from 'next/link'

export default function OKXWalletPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* 头部导航 */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-white font-bold text-xl hover:text-blue-300 transition-colors">
              返回主页
            </Link>
            <Link 
              href="/" 
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              返回主页
            </Link>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* 标题 */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              🟢 OKX 钱包连接
            </h1>
            <p className="text-xl text-white/80">
              专门为 OKX 钱包用户提供的连接页面
            </p>
          </div>

          {/* OKX钱包连接组件 */}
          <div className="mb-12">
            <OKXWalletButton />
          </div>

          {/* 说明信息 */}
          <div className="bg-white/5 rounded-xl p-8 border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-6">使用说明</h2>
            
            <div className="space-y-6 text-left">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">安装 OKX 钱包</h3>
                  <p className="text-white/70 text-sm">
                    如果您还没有安装 OKX 钱包，请访问 
                    <a href="https://www.okx.com/web3" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">
                      OKX Web3
                    </a> 
                    下载并安装浏览器扩展。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">连接钱包</h3>
                  <p className="text-white/70 text-sm">
                    安装完成后，刷新页面，点击"连接OKX钱包"按钮进行连接。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">开始投票</h3>
                  <p className="text-white/70 text-sm">
                    连接成功后，您可以返回主页参与 meme 热词投票活动。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 其他选项 */}
          <div className="mt-12">
            <p className="text-white/60 mb-4">如果遇到连接问题，您也可以尝试：</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/" 
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                使用标准钱包
              </Link>
              <a 
                href="https://www.okx.com/web3" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                安装 OKX 钱包
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white/5 border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white/60 text-sm">
            <p>© 2024 支持 OKX 钱包连接.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 