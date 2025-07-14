'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class HydrationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // 检查是否是水合错误
    const isHydrationError = error.message.includes('Hydration failed') || 
                            error.message.includes('hydration') ||
                            error.message.includes('server') ||
                            error.message.includes('client')

    if (isHydrationError) {
      console.warn('检测到水合错误，正在恢复...', error)
      return { hasError: true, error }
    }

    // 其他错误继续抛出
    throw error
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('HydrationErrorBoundary 捕获到错误:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  componentDidMount() {
    // 在组件挂载后，如果之前有水合错误，尝试恢复
    if (this.state.hasError) {
      console.log('尝试恢复水合错误...')
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined })
      }, 100)
    }
  }

  render() {
    if (this.state.hasError) {
      // 显示fallback或默认错误UI
      return this.props.fallback || (
        <div className="hydration-error-recovery">
          <div className="text-center py-8">
            <div className="text-white text-lg mb-4">正在恢复页面...</div>
            <button 
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
            >
              重新加载
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 便捷的HOC
export function withHydrationErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <HydrationErrorBoundary fallback={fallback}>
        <Component {...props} />
      </HydrationErrorBoundary>
    )
  }
} 