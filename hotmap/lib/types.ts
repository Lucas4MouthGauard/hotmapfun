export interface MemeWord {
  id: number
  word: string
  votes: number
  percentage: number
  category: string
}

export interface UserVote {
  walletAddress: string
  wordId: number
  timestamp: number
  isPaid: boolean
  transactionSignature?: string
  amount?: number
}

export interface VoteStats {
  totalVotes: number
  freeVotesUsed: number
  paidVotesUsed: number
  lastVoteTime: number
  lastVoteDate: string // YYYY-MM-DD 格式
}

export interface WalletState {
  connected: boolean
  address: string | null
  balance: number
  voteStats: VoteStats
}

export interface VoteTransaction {
  signature: string
  amount: number
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
}

export interface ProjectConfig {
  freeVotesPerDay: number
  paidVoteCost: number
  maxVotesPerDay: number
  heatmapTopCount: number
  projectWallet: string
  network: 'devnet' | 'mainnet-beta'
} 