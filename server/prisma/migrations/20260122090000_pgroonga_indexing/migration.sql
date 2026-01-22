CREATE EXTENSION IF NOT EXISTS pgroonga;

DROP INDEX IF EXISTS idx_memo_block_content_pgroonga;
CREATE INDEX idx_memo_block_content_pgroonga
ON "MemoBlock"
USING pgroonga ("content")
WITH (
  tokenizer = 'TokenBigram',
  normalizers = 'NormalizerNFKC100'
);
