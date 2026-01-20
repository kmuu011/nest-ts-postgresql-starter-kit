CREATE EXTENSION pgroonga;

CREATE INDEX idx_memo_content_pgroonga
ON "Memo"
USING pgroonga ("memo")
WITH (
  tokenizer = 'TokenBigram',
  normalizers = 'NormalizerNFKC100'
);