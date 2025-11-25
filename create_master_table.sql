-- Create the master table for category-expense_type mapping
CREATE TABLE IF NOT EXISTS master (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL UNIQUE,
  expense_type TEXT NOT NULL
);

-- Insert default categories
INSERT INTO master (category, expense_type) VALUES
  ('Food', 'expense'),
  ('Transport', 'expense'),
  ('Shopping', 'expense'),
  ('Bills', 'expense'),
  ('Entertainment', 'expense'),
  ('Health', 'expense'),
  ('Other', 'expense')
ON CONFLICT (category) DO NOTHING;

-- Enable Row Level Security (optional, adjust as needed)
ALTER TABLE master ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations for anonymous users" ON master
  FOR ALL USING (true);