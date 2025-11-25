-- Create the salary_details table
CREATE TABLE IF NOT EXISTS salary_details (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  gross_salary DECIMAL(10,2) NOT NULL,
  epf DECIMAL(10,2) DEFAULT 0,
  mf DECIMAL(10,2) DEFAULT 0,
  vpf DECIMAL(10,2) DEFAULT 0,
  etf DECIMAL(10,2) DEFAULT 0
);

-- Enable Row Level Security (optional, adjust as needed)
ALTER TABLE salary_details ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations for anonymous users" ON salary_details
  FOR ALL USING (true);