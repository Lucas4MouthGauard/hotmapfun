// Vercel 特定配置和工具函数

export const vercelConfig = {
  // Vercel 环境变量
  isVercel: process.env.VERCEL === '1',
  isProduction: process.env.NODE_ENV === 'production',
  
  // 域名配置
  domain: process.env.VERCEL_URL || 'localhost:3000',
  
  // API 配置
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  
  // 后端域名（需要配置）
  backendDomain: process.env.NEXT_PUBLIC_BACKEND_DOMAIN || 'your-backend-domain.com'
}

// 获取完整的 URL
export function getFullUrl(path: string = ''): string {
  const protocol = vercelConfig.isProduction ? 'https' : 'http'
  const baseUrl = vercelConfig.isVercel 
    ? `https://${vercelConfig.domain}` 
    : `${protocol}://${vercelConfig.domain}`
  
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

// 获取 API URL
export function getApiUrl(path: string = ''): string {
  if (vercelConfig.isVercel) {
    // 在 Vercel 上，API 请求会被重写到后端
    return getFullUrl(`/api${path.startsWith('/') ? path : `/${path}`}`)
  } else {
    // 本地开发时直接访问后端
    return `${vercelConfig.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`
  }
}

// 检查是否在 Vercel 环境中
export function isVercelEnvironment(): boolean {
  return vercelConfig.isVercel
}

// 获取环境信息
export function getEnvironmentInfo() {
  return {
    isVercel: vercelConfig.isVercel,
    isProduction: vercelConfig.isProduction,
    domain: vercelConfig.domain,
    apiBaseUrl: vercelConfig.apiBaseUrl,
    backendDomain: vercelConfig.backendDomain
  }
} 