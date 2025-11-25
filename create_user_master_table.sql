-- Create the user_master table for storing master password
CREATE TABLE IF NOT EXISTS user_master (
  id SERIAL PRIMARY KEY,
  master_password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (adjust as needed)
ALTER TABLE user_master ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access
CREATE POLICY "Allow all operations for anonymous users" ON user_master
  FOR ALL USING (true);

-- Insert default master password (you should change this to your desired password)
INSERT INTO user_master (master_password) VALUES ('password123')
ON CONFLICT DO NOTHING;
