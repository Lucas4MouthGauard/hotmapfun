'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Hash, 
  Vote, 
  Settings, 
  TrendingUp, 
  Database,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react'

interface User {
  id: number
  wallet_address: string
  nickname?: string
  total_votes: number
  total_paid_votes: number
  total_spent_sol: number
  created_at: string
}

interface Word {
  id: number
  word: string
  category: string
  description?: string
  total_votes: number
  free_votes: number
  paid_votes: number
  current_rank: number
  is_active: boolean
}

interface Vote {
  id: number
  user_id: number
  word_id: number
  is_paid: boolean
  amount_sol: number
  tx_signature?: string
  tx_status: string
  vote_date: string
  created_at: string
}

interface Config {
  id: number
  config_key: string
  config_value: string
  description: string
}

interface Stats {
  total_users: number
  total_words: number
  total_votes: number
  total_revenue: number
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState<User[]>([])
  const [words, setWords] = useState<Word[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [configs, setConfigs] = useState<Config[]>([])
  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    total_words: 0,
    total_votes: 0,
    total_revenue: 0
  })
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddWordModal, setShowAddWordModal] = useState(false)
  const [showBatchAddModal, setShowBatchAddModal] = useState(false)
  const [editingWord, setEditingWord] = useState<Word | null>(null)
  const [newWord, setNewWord] = useState({
    word: '',
    category: '',
    description: ''
  })
  const [batchWords, setBatchWords] = useState('')

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/stats/overview')
      if (!response.ok) throw new Error('网络请求失败')
      const data = await response.json()
      if (data && data.success && data.data) {
        setStats({
          total_users: data.data.users?.total_users || 0,
          total_words: data.data.words?.total_words || 0,
          total_votes: data.data.words?.total_votes || 0,
          total_revenue: data.data.revenue?.total_revenue || 0
        })
      } else {
        setStats({ total_users: 0, total_words: 0, total_votes: 0, total_revenue: 0 })
      }
    } catch (error) {
      setStats({ total_users: 0, total_words: 0, total_votes: 0, total_revenue: 0 })
      console.error('获取统计数据失败:', error)
    }
  }

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/admin/users')
      if (!response.ok) throw new Error('网络请求失败')
      const data = await response.json()
      if (data && data.success && data.data) {
        setUsers(data.data)
      } else {
        setUsers([])
      }
    } catch (error) {
      setUsers([])
      console.error('获取用户列表失败:', error)
    }
    setLoading(false)
  }

  // 获取词汇列表
  const fetchWords = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/admin/words')
      if (!response.ok) throw new Error('网络请求失败')
      const data = await response.json()
      if (data && data.success && data.data) {
        setWords(data.data)
      } else {
        setWords([])
      }
    } catch (error) {
      setWords([])
      console.error('获取词汇列表失败:', error)
    }
    setLoading(false)
  }

  // 获取投票记录
  const fetchVotes = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/admin/votes')
      if (!response.ok) throw new Error('网络请求失败')
      const data = await response.json()
      if (data && data.success && data.data) {
        setVotes(data.data)
      } else {
        setVotes([])
      }
    } catch (error) {
      setVotes([])
      console.error('获取投票记录失败:', error)
    }
    setLoading(false)
  }

  // 获取系统配置
  const fetchConfigs = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/admin/configs')
      if (!response.ok) throw new Error('网络请求失败')
      const data = await response.json()
      if (data && data.success && data.data) {
        setConfigs(data.data)
      } else {
        setConfigs([])
      }
    } catch (error) {
      setConfigs([])
      console.error('获取系统配置失败:', error)
    }
    setLoading(false)
  }

  // 删除用户
  const deleteUser = async (userId: number) => {
    if (!confirm('确定要删除这个用户吗？')) return
    
    try {
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('网络请求失败')
      const data = await response.json()
      if (data && data.success) {
        fetchUsers()
        fetchStats()
      }
    } catch (error) {
      console.error('删除用户失败:', error)
    }
  }

  // 删除词汇
  const deleteWord = async (wordId: number) => {
    if (!confirm('确定要删除这个词汇吗？')) return
    
    try {
      const response = await fetch(`http://localhost:3001/api/admin/words/${wordId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('网络请求失败')
      const data = await response.json()
      if (data && data.success) {
        fetchWords()
        fetchStats()
      }
    } catch (error) {
      console.error('删除词汇失败:', error)
    }
  }

  // 切换词汇状态
  const toggleWordStatus = async (wordId: number, isActive: boolean) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/words/${wordId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !isActive })
      })
      if (!response.ok) throw new Error('网络请求失败')
      const data = await response.json()
      if (data && data.success) {
        fetchWords()
      }
    } catch (error) {
      console.error('更新词汇状态失败:', error)
    }
  }

  // 更新系统配置
  const updateConfig = async (configId: number, value: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/configs/${configId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ config_value: value })
      })
      if (!response.ok) throw new Error('网络请求失败')
      const data = await response.json()
      if (data && data.success) {
        fetchConfigs()
      }
    } catch (error) {
      console.error('更新配置失败:', error)
    }
  }

  // 添加新词汇
  const addWord = async () => {
    if (!newWord.word || !newWord.category) {
      alert('请填写词汇和分类')
      return
    }
    
    try {
      const response = await fetch('http://localhost:3001/api/admin/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newWord)
      })
      if (!response.ok) throw new Error('网络请求失败')
      const data = await response.json()
      if (data && data.success) {
        setShowAddWordModal(false)
        setNewWord({ word: '', category: '', description: '' })
        fetchWords()
        fetchStats()
        alert('词汇添加成功')
      } else {
        alert('添加失败: ' + (data.error || '未知错误'))
      }
    } catch (error) {
      console.error('添加词汇失败:', error)
      alert('添加失败: 网络错误')
    }
  }

  // 编辑词汇
  const editWord = async () => {
    if (!editingWord || !editingWord.word || !editingWord.category) {
      alert('请填写词汇和分类')
      return
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/admin/words/${editingWord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingWord)
      })
      if (!response.ok) throw new Error('网络请求失败')
      const data = await response.json()
      if (data && data.success) {
        setEditingWord(null)
        fetchWords()
        alert('词汇更新成功')
      } else {
        alert('更新失败: ' + (data.error || '未知错误'))
      }
    } catch (error) {
      console.error('更新词汇失败:', error)
      alert('更新失败: 网络错误')
    }
  }

  // 批量添加词汇
  const addBatchWords = async () => {
    if (!batchWords.trim()) {
      alert('请输入要添加的词汇')
      return
    }
    
    const lines = batchWords.trim().split('\n').filter(line => line.trim())
    if (lines.length === 0) {
      alert('请输入有效的词汇')
      return
    }
    
    try {
      const wordsToAdd = lines.map(line => {
        const parts = line.split(',').map(part => part.trim())
        return {
          word: parts[0] || '',
          category: parts[1] || '默认',
          description: parts[2] || ''
        }
      })
      
      // 逐个添加词汇
      let successCount = 0
      let failCount = 0
      let errorMessages = []
      
      for (const word of wordsToAdd) {
        if (!word.word) continue
        
        try {
          const response = await fetch('http://localhost:3001/api/admin/words', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(word)
          })
          if (!response.ok) throw new Error('网络请求失败')
          const data = await response.json()
          if (data && data.success) {
            successCount++
          } else {
            failCount++
            errorMessages.push(`${word.word}: ${data.error || '未知错误'}`)
          }
        } catch (error) {
          failCount++
          errorMessages.push(`${word.word}: 网络错误`)
        }
      }
      
      setShowBatchAddModal(false)
      setBatchWords('')
      fetchWords()
      fetchStats()
      
      let message = `批量添加完成：成功 ${successCount} 个，失败 ${failCount} 个`
      if (errorMessages.length > 0) {
        message += '\n\n失败详情：\n' + errorMessages.slice(0, 5).join('\n')
        if (errorMessages.length > 5) {
          message += `\n... 还有 ${errorMessages.length - 5} 个错误`
        }
      }
      alert(message)
    } catch (error) {
      console.error('批量添加词汇失败:', error)
      alert('批量添加失败')
    }
  }

  useEffect(() => {
    fetchStats()
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'words') fetchWords()
    if (activeTab === 'votes') fetchVotes()
    if (activeTab === 'configs') fetchConfigs()
  }, [activeTab])

  // 新增：首次加载自动拉取词汇
  useEffect(() => {
    fetchWords()
  }, [])

  const filteredUsers = users.filter(user => 
    user.wallet_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredWords = words.filter(word => 
    word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">后台管理系统</h1>
              <p className="text-sm text-gray-500">Meme热词排行系统管理后台</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">总用户数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_users || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Hash className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">总词汇数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_words || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Vote className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">总投票数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_votes || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">总收入(SOL)</p>
                  <p className="text-2xl font-bold text-gray-900">{Number(stats.total_revenue || 0).toFixed(4)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 标签页 */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'dashboard', name: '仪表盘', icon: Database },
                { id: 'users', name: '用户管理', icon: Users },
                { id: 'words', name: '词汇管理', icon: Hash },
                { id: 'votes', name: '投票记录', icon: Vote },
                { id: 'configs', name: '系统配置', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* 搜索栏和操作按钮 */}
            {(activeTab === 'users' || activeTab === 'words') && (
              <div className="mb-6 flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={`搜索${activeTab === 'users' ? '用户' : '词汇'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {activeTab === 'words' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowAddWordModal(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      新增词汇
                    </button>
                    <button
                      onClick={() => setShowBatchAddModal(true)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      批量添加
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 内容区域 */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* 空数据提示 */}
                {activeTab === 'users' && users.length === 0 && (
                  <div className="text-center py-8 text-gray-500">暂无用户数据</div>
                )}
                {activeTab === 'words' && words.length === 0 && (
                  <div className="text-center py-8 text-gray-500">暂无词汇数据</div>
                )}
                {activeTab === 'votes' && votes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">暂无投票记录</div>
                )}
                {activeTab === 'configs' && configs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">暂无系统配置</div>
                )}

                {/* 用户管理 */}
                {activeTab === 'users' && users.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">钱包地址</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">昵称</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总投票</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">付费投票</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">花费(SOL)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注册时间</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                              {user.wallet_address ? `${user.wallet_address.slice(0, 8)}...${user.wallet_address.slice(-8)}` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.nickname || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.total_votes || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.total_paid_votes || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Number(user.total_spent_sol || 0).toFixed(4)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 词汇管理 */}
                {activeTab === 'words' && words.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">词汇</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总投票</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">免费投票</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">付费投票</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排名</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredWords.map((word) => (
                          <tr key={word.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{word.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{word.word || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{word.category || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate" title={word.description || ''}>{word.description || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{word.total_votes || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{word.free_votes || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{word.paid_votes || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{word.current_rank || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                word.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {word.is_active ? '激活' : '禁用'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => setEditingWord(word)}
                                className="text-blue-600 hover:text-blue-900"
                                title="编辑"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => toggleWordStatus(word.id, word.is_active)}
                                className="text-green-600 hover:text-green-900"
                                title={word.is_active ? '禁用' : '激活'}
                              >
                                {word.is_active ? '🟢' : '🔴'}
                              </button>
                              <button
                                onClick={() => deleteWord(word.id)}
                                className="text-red-600 hover:text-red-900"
                                title="删除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 投票记录 */}
                {activeTab === 'votes' && votes.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">词汇ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">投票日期</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {votes.map((vote) => (
                          <tr key={vote.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vote.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vote.user_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vote.word_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                vote.is_paid 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {vote.is_paid ? '付费' : '免费'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Number(vote.amount_sol || 0).toFixed(4)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  vote.tx_status === 'confirmed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {vote.tx_status || 'pending'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vote.vote_date || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {vote.created_at ? new Date(vote.created_at).toLocaleString() : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 系统配置 */}
                {activeTab === 'configs' && configs.length > 0 && (
                  <div className="space-y-6">
                    {configs.map((config) => (
                      <div key={config.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{config.config_key}</h3>
                            <p className="text-sm text-gray-500">{config.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={config.config_value}
                              onChange={(e) => {
                                const newConfigs = configs.map(c => 
                                  c.id === config.id ? { ...c, config_value: e.target.value } : c
                                )
                                setConfigs(newConfigs)
                              }}
                              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                            />
                            <button
                              onClick={() => updateConfig(config.id, config.config_value)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                            >
                              保存
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 新增词汇模态框 */}
      {showAddWordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">新增词汇</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">词汇</label>
                <input
                  type="text"
                  value={newWord.word}
                  onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="输入词汇"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <input
                  type="text"
                  value={newWord.category}
                  onChange={(e) => setNewWord({ ...newWord, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="输入分类"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={newWord.description}
                  onChange={(e) => setNewWord({ ...newWord, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="输入描述（可选）"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddWordModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={addWord}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 批量添加词汇模态框 */}
      {showBatchAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">批量添加词汇</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">词汇列表</label>
                <textarea
                  value={batchWords}
                  onChange={(e) => setBatchWords(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="每行一个词汇，格式：词汇,分类,描述&#10;例如：&#10;HODL,投资,持有不卖&#10;MOON,投资,价格暴涨&#10;FUD,情绪,恐惧不确定怀疑"
                  rows={10}
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>格式说明：</strong><br/>
                  每行一个词汇，用逗号分隔：词汇,分类,描述<br/>
                  分类、描述为可选，默认为 默认,空
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBatchAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={addBatchWords}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                批量添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑词汇模态框 */}
      {editingWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">编辑词汇</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">词汇</label>
                <input
                  type="text"
                  value={editingWord.word}
                  onChange={(e) => setEditingWord({ ...editingWord, word: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="输入词汇"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <input
                  type="text"
                  value={editingWord.category}
                  onChange={(e) => setEditingWord({ ...editingWord, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="输入分类"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={editingWord.description || ''}
                  onChange={(e) => setEditingWord({ ...editingWord, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="输入描述（可选）"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingWord(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={editWord}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 