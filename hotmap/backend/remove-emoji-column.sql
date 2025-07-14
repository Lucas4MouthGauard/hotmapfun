-- 移除meme_words表的emoji列
ALTER TABLE meme_words DROP COLUMN IF EXISTS emoji;

-- 更新现有数据，确保没有emoji字段
UPDATE meme_words SET emoji = NULL WHERE emoji IS NOT NULL; 