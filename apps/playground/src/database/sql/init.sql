CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  api_base_url TEXT,
  enable_vim_mode BOOLEAN,
  refresh_interval INTEGER NOT NULL CHECK (refresh_interval > 0)
);
