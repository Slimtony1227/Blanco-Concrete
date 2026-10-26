-- Each row is one submission. Public visitors only see approved rows.
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL CHECK(length(display_name) BETWEEN 2 AND 60),
  rating INTEGER NOT NULL CHECK(typeof(rating) = 'integer' AND rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL CHECK(length(comment) BETWEEN 10 AND 2000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  moderated_at TEXT
);

-- Helps retrieve one page of reviews in a given status, newest first.
CREATE INDEX reviews_status_id ON reviews(status, id DESC);
