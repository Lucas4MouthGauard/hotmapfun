const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js')

async function testConnection(endpoint) {
  console.log(`测试连接: ${endpoint}`)
  try {
    const connection = new Connection(endpoint, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000
    })
    
    const { blockhash } = await connection.getLatestBlockhash()
    console.log(`连接成功，blockhash: ${blockhash}`)
    return connection
  } catch (error) {
    console.log(`连接失败: ${error.message}`)
    return null
  }
}

async function debugVoteTransaction() {
  console.log('🔍 开始调试投票交易流程...')
  
  // 测试多个RPC端点
  const endpoints = [
    'https://api.devnet.solana.com',
    'https://solana-devnet.g.alchemy.com/v2/demo',
    'https://devnet.genesysgo.net',
    'https://api.mainnet-beta.solana.com'
  ]
  
  let connection = null
  for (const endpoint of endpoints) {
    connection = await testConnection(endpoint)
    if (connection) {
      console.log(`使用RPC端点: ${endpoint}`)
      break
    }
  }
  
  if (!connection) {
    console.error('所有RPC端点都连接失败，请检查网络连接')
    return
  }
  
  // 2. 测试项目方钱包地址
  const projectWallet = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1'
  const toPublicKey = new PublicKey(projectWallet)
  console.log('项目方钱包地址有效:', toPublicKey.toString())
  
  // 3. 测试一个示例钱包地址
  const testWallet = '11111111111111111111111111111112' // 系统程序地址作为测试
  const fromPublicKey = new PublicKey(testWallet)
  console.log('测试钱包地址有效:', fromPublicKey.toString())
  
  // 4. 创建交易
  console.log('\n创建投票交易...')
  const { blockhash } = await connection.getLatestBlockhash()
      console.log('获取到最新 blockhash:', blockhash)
  
  const transaction = new Transaction()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = fromPublicKey
  
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: fromPublicKey,
    toPubkey: toPublicKey,
    lamports: 0.02 * LAMPORTS_PER_SOL,
  })
  
  transaction.add(transferInstruction)
  
      console.log('交易创建成功')
  console.log('交易详情:', {
    instructions: transaction.instructions.length,
    feePayer: transaction.feePayer?.toString(),
    recentBlockhash: transaction.recentBlockhash,
    signatures: transaction.signatures.length
  })
  
  // 5. 测试交易序列化
  try {
    const serialized = transaction.serialize({ requireAllSignatures: false })
    console.log('交易序列化成功，长度:', serialized.length)
  } catch (error) {
          console.error('交易序列化失败:', error.message)
  }
  
  // 6. 测试余额查询
  try {
    const balance = await connection.getBalance(fromPublicKey)
    console.log('余额查询成功:', balance / LAMPORTS_PER_SOL, 'SOL')
  } catch (error) {
          console.log('余额查询失败（预期，因为是测试地址）:', error.message)
  }
  
  console.log('\n调试完成！')
  console.log('如果以上都显示成功，说明基础配置正确')
  console.log('"No signers" 错误可能出现在钱包签名环节')
}

debugVoteTransaction().catch(console.error) 