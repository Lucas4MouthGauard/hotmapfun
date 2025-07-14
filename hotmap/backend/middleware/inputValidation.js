const Joi = require('joi');
const xss = require('xss');

// 清理HTML和脚本标签
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(input, {
      whiteList: {}, // 不允许任何HTML标签
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  }
  return input;
};

// 递归清理对象中的所有字符串
const sanitizeObject = (obj) => {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  return obj;
};

// 通用输入验证中间件
const validateInput = (schema) => {
  return (req, res, next) => {
    // 清理输入
    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    req.params = sanitizeObject(req.params);

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: '输入验证失败',
        message: error.details[0].message,
        field: error.details[0].path.join('.')
      });
    }

    req.validatedBody = value;
    next();
  };
};

// 查询参数验证中间件
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: '查询参数验证失败',
        message: error.details[0].message
      });
    }

    req.validatedQuery = value;
    next();
  };
};

// 路径参数验证中间件
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        error: '路径参数验证失败',
        message: error.details[0].message
      });
    }

    req.validatedParams = value;
    next();
  };
};

// 通用验证模式
const commonSchemas = {
  walletAddress: Joi.string()
    .pattern(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
    .required()
    .messages({
      'string.pattern.base': '钱包地址格式不正确',
      'any.required': '钱包地址不能为空'
    }),

  wordId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '词条ID必须是数字',
      'number.integer': '词条ID必须是整数',
      'number.positive': '词条ID必须是正数',
      'any.required': '词条ID不能为空'
    }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(1000).default(100)
  }),

  search: Joi.object({
    search: Joi.string().max(100).optional(),
    category: Joi.string().max(50).optional(),
    sort: Joi.string().valid('total_votes', 'current_rank', 'created_at', 'word').default('total_votes'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  })
};

module.exports = {
  sanitizeInput,
  sanitizeObject,
  validateInput,
  validateQuery,
  validateParams,
  commonSchemas
}; 