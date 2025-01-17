CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  api_base_url TEXT,
  enable_vim_mode BOOLEAN DEFAULT FALSE,
  refresh_interval INTEGER NOT NULL DEFAULT 2000 CHECK (refresh_interval > 0)
);
