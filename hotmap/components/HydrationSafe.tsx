'use client'

import React, { useState, useEffect, useRef } from 'react'

interface HydrationSafeProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  timeout?: number
  onHydrationComplete?: () => void
}

export function HydrationSafe({ 
  children, 
  fallback, 
  timeout = 1000,
  onHydrationComplete 
}: HydrationSafeProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  const [hasError, setHasError] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    // 防止重复执行
    if (mountedRef.current) return
    mountedRef.current = true

    // 设置超时保护
    timeoutRef.current = setTimeout(() => {
      if (!isHydrated) {
        console.warn('HydrationSafe: 水合超时，强制显示内容')
        setIsHydrated(true)
        setHasError(true)
      }
    }, timeout)

    // 检测水合完成
    const checkHydration = () => {
      // 检查DOM是否已经水合
      if (typeof window !== 'undefined' && document.readyState === 'complete') {
        clearTimeout(timeoutRef.current!)
        setIsHydrated(true)
        onHydrationComplete?.()
      }
    }

    // 立即检查一次
    checkHydration()

    // 监听页面加载完成
    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        checkHydration()
      } else {
        window.addEventListener('load', checkHydration)
        return () => window.removeEventListener('load', checkHydration)
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [timeout, onHydrationComplete, isHydrated])

  // 如果还没有水合完成，显示fallback
  if (!isHydrated) {
    return fallback ? <>{fallback}</> : null
  }

  // 如果水合过程中出现错误，显示错误状态
  if (hasError) {
    return (
      <div className="hydration-error-fallback">
        {children}
      </div>
    )
  }

  // 正常渲染
  return <>{children}</>
}

// 专门用于钱包组件的安全包装器
export function WalletSafe({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <HydrationSafe 
      fallback={fallback || <div className="text-white">加载钱包组件...</div>}
      timeout={2000}
      onHydrationComplete={() => console.log('钱包组件水合完成')}
    >
      {children}
    </HydrationSafe>
  )
}

// 专门用于动态内容的包装器
export function DynamicSafe({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <HydrationSafe 
      fallback={fallback || <div className="text-white">加载中...</div>}
      timeout={1500}
    >
      {children}
    </HydrationSafe>
  )
} 