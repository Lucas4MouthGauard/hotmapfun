const express = require('express');
const Joi = require('joi');
const router = express.Router();
const db = require('../config/database');

// 投票请求验证
const voteSchema = Joi.object({
  wallet_address: Joi.string().pattern(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/).required(),
  word_id: Joi.number().integer().positive().required(),
  is_paid: Joi.boolean().default(false),
  tx_signature: Joi.string().when('is_paid', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

// 提交投票
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = voteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: '参数验证失败',
        message: error.details[0].message
      });
    }

    const { wallet_address, word_id, is_paid, tx_signature } = value;

    // 使用事务确保数据一致性
    const result = await db.transaction(async (client) => {
      // 1. 获取或创建用户
      let user = await client.query(
        'SELECT * FROM users WHERE wallet_address = $1',
        [wallet_address]
      );

      if (user.rows.length === 0) {
        user = await client.query(
          'INSERT INTO users (wallet_address) VALUES ($1) RETURNING *',
          [wallet_address]
        );
      }

      const userId = user.rows[0].id;
      const today = new Date().toISOString().split('T')[0];

      // 2. 检查词条是否存在
      const word = await client.query(
        'SELECT * FROM meme_words WHERE id = $1 AND is_active = true',
        [word_id]
      );

      if (word.rows.length === 0) {
        throw new Error('词条不存在或已被删除');
      }

      // 3. 检查是否已经投票
      const existingVote = await client.query(
        'SELECT * FROM votes WHERE user_id = $1 AND word_id = $2 AND vote_date = $3',
        [userId, word_id, today]
      );

      if (existingVote.rows.length > 0) {
        throw new Error('今日已对该词条投票，请明天再试');
      }

      // 4. 检查投票限制
      const todayVotes = await client.query(
        'SELECT COUNT(*) as count FROM votes WHERE user_id = $1 AND vote_date = $2',
        [userId, today]
      );

      const todayVoteCount = parseInt(todayVotes.rows[0].count);
      const maxVotesPerDay = 50;

      if (todayVoteCount >= maxVotesPerDay) {
        throw new Error('今日投票次数已达上限');
      }

      // 5. 检查免费投票次数
      const todayFreeVotes = await client.query(
        'SELECT COUNT(*) as count FROM votes WHERE user_id = $1 AND vote_date = $2 AND is_paid = false',
        [userId, today]
      );

      const todayFreeVoteCount = parseInt(todayFreeVotes.rows[0].count);
      const freeVotesPerDay = 3;

      if (!is_paid && todayFreeVoteCount >= freeVotesPerDay) {
        throw new Error('今日免费投票次数已用完，请使用付费投票');
      }

      if (is_paid && todayFreeVoteCount < freeVotesPerDay) {
        throw new Error('还有免费投票次数，请先使用免费投票');
      }

      // 6. 验证付费投票的交易签名
      if (is_paid) {
        if (!tx_signature) {
          throw new Error('付费投票需要提供交易签名');
        }

        // 检查交易是否已存在
        const existingTx = await client.query(
          'SELECT id FROM transactions WHERE tx_signature = $1',
          [tx_signature]
        );

        if (existingTx.rows.length > 0) {
          throw new Error('该交易已被使用');
        }
      }

      // 7. 创建投票记录
      const voteAmount = is_paid ? 0.02 : 0;
      const newVote = await client.query(
        `INSERT INTO votes (user_id, word_id, is_paid, amount_sol, tx_signature, vote_date) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [userId, word_id, is_paid, voteAmount, tx_signature || null, today]
      );

      // 8. 更新词条统计
      const updateWordQuery = `
        UPDATE meme_words 
        SET 
          total_votes = total_votes + 1,
          ${is_paid ? 'paid_votes = paid_votes + 1' : 'free_votes = free_votes + 1'},
          updated_at = NOW()
        WHERE id = $1
      `;
      await client.query(updateWordQuery, [word_id]);

      // 9. 更新用户统计
      const updateUserQuery = `
        UPDATE users 
        SET 
          total_votes = total_votes + 1
          ${is_paid ? ', total_paid_votes = total_paid_votes + 1' : ''}
          ${is_paid ? ', total_spent_sol = total_spent_sol + $2' : ''},
          last_vote_at = NOW()
          ${!user.rows[0].first_vote_at ? ', first_vote_at = NOW()' : ''},
          updated_at = NOW()
        WHERE id = $1
      `;
      await client.query(updateUserQuery, [userId, ...(is_paid ? [voteAmount] : [])]);

      // 10. 如果是付费投票，创建交易记录
      if (is_paid && tx_signature) {
        await client.query(
          `INSERT INTO transactions (user_id, vote_id, tx_signature, from_address, to_address, amount_sol, tx_type) 
           VALUES ($1, $2, $3, $4, $5, $6, 'vote_payment')`,
          [userId, newVote.rows[0].id, tx_signature, wallet_address, process.env.PROJECT_WALLET, voteAmount]
        );
      }

      return {
        vote: newVote.rows[0],
        user: user.rows[0],
        word: word.rows[0],
        todayStats: {
          totalVotes: todayVoteCount + 1,
          freeVotes: todayFreeVoteCount + (is_paid ? 0 : 1),
          paidVotes: todayVoteCount - todayFreeVoteCount + (is_paid ? 1 : 0)
        }
      };
    });

    res.status(201).json({
      success: true,
      message: '投票成功',
      data: result
    });

  } catch (error) {
    next(error);
  }
});

// 获取用户今日投票状态
router.get('/user/:wallet_address/today', async (req, res, next) => {
  try {
    const { wallet_address } = req.params;

    const { error } = Joi.object({
      wallet_address: Joi.string().pattern(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/).required()
    }).validate({ wallet_address });

    if (error) {
      return res.status(400).json({
        error: '参数验证失败',
        message: error.details[0].message
      });
    }

    // 获取用户信息
    const user = await db.query(
      'SELECT id FROM users WHERE wallet_address = $1',
      [wallet_address]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        error: '用户不存在',
        message: '该钱包地址未注册'
      });
    }

    const userId = user.rows[0].id;
    const today = new Date().toISOString().split('T')[0];

    // 获取今日投票统计
    const todayStats = await db.query(
      `SELECT 
        COUNT(*) as total_votes,
        COUNT(CASE WHEN is_paid = false THEN 1 END) as free_votes,
        COUNT(CASE WHEN is_paid = true THEN 1 END) as paid_votes
       FROM votes 
       WHERE user_id = $1 AND vote_date = $2`,
      [userId, today]
    );

    // 获取今日投票的词条列表
    const todayVotes = await db.query(
      `SELECT 
        v.id, v.is_paid, v.amount_sol, v.created_at,
        w.id as word_id, w.word, w.category
       FROM votes v
       JOIN meme_words w ON v.word_id = w.id
       WHERE v.user_id = $1 AND v.vote_date = $2
       ORDER BY v.created_at DESC`,
      [userId, today]
    );

    const stats = todayStats.rows[0];
    const remainingFreeVotes = Math.max(0, 3 - parseInt(stats.free_votes));
    const remainingTotalVotes = Math.max(0, 50 - parseInt(stats.total_votes));

    res.json({
      success: true,
      data: {
        todayStats: {
          totalVotes: parseInt(stats.total_votes),
          freeVotes: parseInt(stats.free_votes),
          paidVotes: parseInt(stats.paid_votes),
          remainingFreeVotes,
          remainingTotalVotes
        },
        todayVotes: todayVotes.rows,
        config: {
          freeVotesPerDay: 3,
          maxVotesPerDay: 50,
          paidVoteCost: 0.02
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router; 