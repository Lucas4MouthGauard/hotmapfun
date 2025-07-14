const express = require('express');
const Joi = require('joi');
const router = express.Router();
const db = require('../config/database');
const { generateToken } = require('../middleware/auth');
const { validateInput, sanitizeObject } = require('../middleware/inputValidation');

// 验证钱包地址格式
const walletAddressSchema = Joi.object({
  wallet_address: Joi.string()
    .pattern(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
    .required()
    .messages({
      'string.pattern.base': '钱包地址格式不正确',
      'any.required': '钱包地址不能为空'
    })
});

// 用户注册/登录
router.post('/login', validateInput(walletAddressSchema), async (req, res, next) => {
  try {
    const { wallet_address } = req.validatedBody;

    // 清理输入
    const sanitizedAddress = sanitizeObject(wallet_address);

    // 检查用户是否已存在
    const existingUser = await db.query(
      'SELECT * FROM users WHERE wallet_address = $1',
      [sanitizedAddress]
    );

    let user;
    let isNewUser = false;

    if (existingUser.rows.length > 0) {
      // 用户已存在，更新最后登录时间
      user = existingUser.rows[0];
      await db.query(
        'UPDATE users SET updated_at = NOW() WHERE wallet_address = $1',
        [sanitizedAddress]
      );
    } else {
      // 新用户注册
      const newUser = await db.query(
        `INSERT INTO users (wallet_address) 
         VALUES ($1) 
         RETURNING *`,
        [sanitizedAddress]
      );
      user = newUser.rows[0];
      isNewUser = true;
    }

    // 生成JWT令牌
    const token = generateToken(user);

    res.status(isNewUser ? 201 : 200).json({
      success: true,
      message: isNewUser ? '注册成功' : '登录成功',
      data: {
        user: {
          id: user.id,
          wallet_address: user.wallet_address,
          total_votes: user.total_votes,
          total_paid_votes: user.total_paid_votes,
          total_spent_sol: user.total_spent_sol,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        token,
        expires_in: 24 * 60 * 60 // 24小时
      }
    });

  } catch (error) {
    next(error);
  }
});

// 获取用户信息
router.get('/user/:wallet_address', async (req, res, next) => {
  try {
    const { wallet_address } = req.params;

    // 清理和验证输入
    const sanitizedAddress = sanitizeObject(wallet_address);
    
    const { error } = walletAddressSchema.validate({ wallet_address: sanitizedAddress });
    if (error) {
      return res.status(400).json({
        error: '参数验证失败',
        message: error.details[0].message
      });
    }

    const user = await db.query(
      'SELECT * FROM users WHERE wallet_address = $1',
      [sanitizedAddress]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        error: '用户不存在',
        message: '该钱包地址未注册'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.rows[0].id,
          wallet_address: user.rows[0].wallet_address,
          total_votes: user.rows[0].total_votes,
          total_paid_votes: user.rows[0].total_paid_votes,
          total_spent_sol: user.rows[0].total_spent_sol,
          created_at: user.rows[0].created_at,
          updated_at: user.rows[0].updated_at
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// 获取用户投票统计
router.get('/user/:wallet_address/stats', async (req, res, next) => {
  try {
    const { wallet_address } = req.params;
    const { date } = req.query;

    // 清理和验证输入
    const sanitizedAddress = sanitizeObject(wallet_address);
    
    const { error } = walletAddressSchema.validate({ wallet_address: sanitizedAddress });
    if (error) {
      return res.status(400).json({
        error: '参数验证失败',
        message: error.details[0].message
      });
    }

    // 验证日期格式
    let targetDate = date;
    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          error: '日期格式错误',
          message: '日期格式应为 YYYY-MM-DD'
        });
      }
      targetDate = sanitizeObject(date);
    } else {
      targetDate = new Date().toISOString().split('T')[0];
    }

    // 获取用户基本信息
    const user = await db.query(
      'SELECT id, wallet_address, total_votes, total_paid_votes, total_spent_sol FROM users WHERE wallet_address = $1',
      [sanitizedAddress]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        error: '用户不存在',
        message: '该钱包地址未注册'
      });
    }

    const userId = user.rows[0].id;

    // 获取今日投票统计
    const todayStats = await db.query(
      `SELECT 
        COUNT(*) as total_votes_today,
        COUNT(CASE WHEN is_paid = true THEN 1 END) as paid_votes_today,
        COUNT(CASE WHEN is_paid = false THEN 1 END) as free_votes_today,
        COALESCE(SUM(CASE WHEN is_paid = true THEN amount_sol ELSE 0 END), 0) as spent_sol_today
       FROM votes 
       WHERE user_id = $1 AND vote_date = $2`,
      [userId, targetDate]
    );

    // 获取投票历史
    const voteHistory = await db.query(
      `SELECT 
        v.vote_date,
        COUNT(*) as daily_votes,
        COUNT(CASE WHEN v.is_paid = true THEN 1 END) as daily_paid_votes,
        COALESCE(SUM(CASE WHEN v.is_paid = true THEN v.amount_sol ELSE 0 END), 0) as daily_spent_sol
       FROM votes v
       WHERE v.user_id = $1
       GROUP BY v.vote_date
       ORDER BY v.vote_date DESC
       LIMIT 30`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.rows[0].id,
          wallet_address: user.rows[0].wallet_address,
          total_votes: user.rows[0].total_votes,
          total_paid_votes: user.rows[0].total_paid_votes,
          total_spent_sol: user.rows[0].total_spent_sol
        },
        todayStats: todayStats.rows[0],
        voteHistory: voteHistory.rows
      }
    });

  } catch (error) {
    next(error);
  }
});

// 刷新令牌
router.post('/refresh', validateInput(Joi.object({
  token: Joi.string().required()
})), async (req, res, next) => {
  try {
    const { token } = req.validatedBody;
    
    // 这里应该验证令牌的有效性并生成新令牌
    // 为了简化，这里只是示例
    res.json({
      success: true,
      message: '令牌刷新成功',
      data: {
        token: 'new_token_here',
        expires_in: 24 * 60 * 60
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 