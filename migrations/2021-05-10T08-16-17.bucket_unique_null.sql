--bucket_indexes (up)

-- Deduplicate rows prior to adding index
DELETE FROM buckets b1
USING buckets b0
WHERE
  b0.uid = b1.uid
  AND b0.page = b1.page
  AND b0.id < b1.id
  AND b0.filter_category IS NULL
  AND b1.filter_category IS NULL;

CREATE UNIQUE INDEX buckets_single_null ON buckets (uid, page, (filter_category IS NULL)) WHERE filter_category IS NULL;
