const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取交易记录
router.get('/', async (req, res, next) => {
  try {
    const { wallet_address, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, u.wallet_address, w.word
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN votes v ON t.vote_id = v.id
      LEFT JOIN meme_words w ON v.word_id = w.id
    `;
    
    const queryParams = [];
    let paramIndex = 1;

    if (wallet_address) {
      query += ` WHERE u.wallet_address = $${paramIndex}`;
      queryParams.push(wallet_address);
      paramIndex++;
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(parseInt(limit), offset);

    const transactions = await db.query(query, queryParams);

    res.json({
      success: true,
      data: transactions.rows
    });

  } catch (error) {
    next(error);
  }
});

// 验证交易签名
router.post('/verify', async (req, res, next) => {
  try {
    const { tx_signature, from_address, to_address, amount_sol } = req.body;

    if (!tx_signature || !from_address || !to_address || !amount_sol) {
      return res.status(400).json({
        error: '参数不完整',
        message: '请提供完整的交易信息'
      });
    }

    // 检查交易是否已存在
    const existingTx = await db.query(
      'SELECT * FROM transactions WHERE tx_signature = $1',
      [tx_signature]
    );

    if (existingTx.rows.length > 0) {
      return res.status(409).json({
        error: '交易已存在',
        message: '该交易已被记录'
      });
    }

    // 检查收款地址是否正确
    if (to_address !== process.env.PROJECT_WALLET) {
      return res.status(400).json({
        error: '收款地址错误',
        message: '收款地址不匹配'
      });
    }

    // 检查金额是否正确
    if (parseFloat(amount_sol) !== 0.02) {
      return res.status(400).json({
        error: '金额错误',
        message: '投票费用应为0.02 SOL'
      });
    }

    res.json({
      success: true,
      message: '交易验证通过',
      data: {
        tx_signature,
        from_address,
        to_address,
        amount_sol
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router; 