'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface NoSSRProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onClientOnly?: boolean
}

export function NoSSR({ children, fallback, onClientOnly = false }: NoSSRProps) {
  const [mounted, setMounted] = useState(false)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setMounted(true)
    
    // 创建一个容器用于客户端渲染
    if (onClientOnly) {
      const container = document.createElement('div')
      container.style.display = 'contents'
      document.body.appendChild(container)
      setPortalContainer(container)
    }
  }, [onClientOnly])

  useEffect(() => {
    return () => {
      // 清理容器
      if (portalContainer && portalContainer.parentNode) {
        portalContainer.parentNode.removeChild(portalContainer)
      }
    }
  }, [portalContainer])

  // 服务器端渲染时显示fallback或null
  if (!mounted) {
    return fallback ? <>{fallback}</> : null
  }

  // 如果指定了onClientOnly，使用Portal渲染
  if (onClientOnly && portalContainer) {
    return createPortal(children, portalContainer)
  }

  // 正常客户端渲染
  return <>{children}</>
}

// 便捷的客户端专用组件
export function ClientOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <NoSSR fallback={fallback}>{children}</NoSSR>
}

// 动态内容组件
export function DynamicContent({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <NoSSR fallback={fallback} onClientOnly={true}>{children}</NoSSR>
} 