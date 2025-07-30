import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction
} from '@solana/web3.js'
import { CONFIG } from './data'

// 创建 Solana 连接
export function createConnection(): Connection {
  // 根据配置选择网络
  let endpoint: string
  
  if (process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta') {
    endpoint = 'https://api.mainnet-beta.solana.com'
  } else {
    // 使用更可靠的 devnet 端点，增加备用端点
    const devnetEndpoints = [
      'https://api.devnet.solana.com',
      'https://solana-devnet.g.alchemy.com/v2/demo',
      'https://devnet.genesysgo.net'
    ]
    endpoint = devnetEndpoints[0] // 使用第一个作为默认
  }
  
  console.log('使用 Solana 网络:', process.env.NEXT_PUBLIC_SOLANA_NETWORK, '端点:', endpoint)
  
  return new Connection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
    wsEndpoint: endpoint.replace('https://', 'wss://'),
    httpHeaders: {
      'User-Agent': 'MemeHotmap/1.0'
    }
  })
}

// 验证项目方钱包地址
export function validateProjectWallet(): boolean {
  try {
    new PublicKey(CONFIG.PROJECT_WALLET)
    return true
  } catch {
    return false
  }
}

// 创建付费投票交易
export async function createVoteTransaction(
  fromPublicKey: PublicKey,
  amount: number = CONFIG.PAID_VOTE_COST
): Promise<Transaction> {
  // 验证项目方钱包地址
  if (!validateProjectWallet()) {
    throw new Error('项目方钱包地址无效，请检查配置')
  }

  const toPublicKey = new PublicKey(CONFIG.PROJECT_WALLET)
  const connection = createConnection()
  
  // 获取最新的 blockhash
  const { blockhash } = await connection.getLatestBlockhash()
  
  const transaction = new Transaction()
  
  // 设置 blockhash 和 feePayer
  transaction.recentBlockhash = blockhash
  transaction.feePayer = fromPublicKey
  
  // 添加转账指令
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: fromPublicKey,
    toPubkey: toPublicKey,
    lamports: amount * LAMPORTS_PER_SOL,
  })
  
  transaction.add(transferInstruction)
  
  return transaction
}

// 发送投票交易
export async function sendVoteTransaction(
  connection: Connection,
  signedTransaction: Transaction
): Promise<string> {
  try {
    // 直接发送已签名的交易
    const signature = await connection.sendTransaction(signedTransaction, [], {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    })
    
    // 等待交易确认
    const confirmation = await connection.confirmTransaction(signature, 'confirmed')
    
    if (confirmation.value.err) {
      throw new Error('交易确认失败')
    }
    
    return signature
  } catch (error) {
    console.error('投票交易失败:', error)
    throw new Error(`投票交易失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

// 获取钱包余额
export async function getWalletBalance(
  connection: Connection,
  publicKey: PublicKey
): Promise<number> {
  try {
    console.log('正在查询钱包余额:', publicKey.toString())
    
    // 先检查连接是否正常
    const slot = await connection.getSlot()
    console.log('当前区块高度:', slot)
    
    const balance = await connection.getBalance(publicKey)
    const solBalance = balance / LAMPORTS_PER_SOL
    console.log('钱包余额查询结果:', balance, 'lamports =', solBalance, 'SOL')
    return solBalance
  } catch (error) {
    console.error('获取余额失败:', error)
    
    // 更详细的错误信息
    let errorMessage = '获取钱包余额失败'
    if (error instanceof Error) {
      if (error.message.includes('fetch failed')) {
        errorMessage = '网络连接失败，请检查网络连接'
      } else if (error.message.includes('rate limit')) {
        errorMessage = '请求频率过高，请稍后重试'
      } else if (error.message.includes('timeout')) {
        errorMessage = '请求超时，请稍后重试'
      } else {
        errorMessage = `获取钱包余额失败: ${error.message}`
      }
    }
    
    throw new Error(errorMessage)
  }
}

// 验证交易签名
export async function verifyTransaction(
  connection: Connection,
  signature: string
): Promise<boolean> {
  try {
    const status = await connection.getSignatureStatus(signature)
    return status.value?.confirmationStatus === 'confirmed'
  } catch (error) {
    console.error('验证交易失败:', error)
    return false
  }
}

// 检查钱包余额是否足够
export async function checkWalletBalance(
  connection: Connection,
  publicKey: PublicKey,
  requiredAmount: number = CONFIG.PAID_VOTE_COST
): Promise<boolean> {
  try {
    const balance = await getWalletBalance(connection, publicKey)
    return balance >= requiredAmount
  } catch (error) {
    console.error('检查余额失败:', error)
    return false
  }
}

// 获取交易详情
export async function getTransactionDetails(
  connection: Connection,
  signature: string
): Promise<any> {
  try {
    const transaction = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    })
    return transaction
  } catch (error) {
    console.error('获取交易详情失败:', error)
    return null
  }
} 