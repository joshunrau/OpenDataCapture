CREATE TABLE IF NOT EXISTS migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  api_base_url TEXT,
  enable_vim_mode BOOLEAN DEFAULT FALSE,
  refresh_interval INTEGER NOT NULL DEFAULT 2000 CHECK (refresh_interval > 0)
);

INSERT INTO settings (api_base_url, enable_vim_mode, refresh_interval)
SELECT * FROM (SELECT null, FALSE, 2000) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM settings);
