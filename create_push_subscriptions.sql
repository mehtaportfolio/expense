-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  endpoint TEXT UNIQUE NOT NULL,
  subscription_json JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for internal use (or anonymous for simplicity if needed by backend)
CREATE POLICY "Allow all operations for everyone" ON push_subscriptions
  FOR ALL USING (true);
