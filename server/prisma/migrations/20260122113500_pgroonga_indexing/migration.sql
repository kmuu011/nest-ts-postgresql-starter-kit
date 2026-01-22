CREATE EXTENSION IF NOT EXISTS pgroonga;

DROP INDEX IF EXISTS idx_memo_text_pgroonga;
CREATE INDEX idx_memo_text_pgroonga
ON "Memo"
USING pgroonga ("text")
WITH (
  tokenizer = 'TokenBigram',
  normalizers = 'NormalizerNFKC100'
);
