import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
const supabaseUrl = 'https://shpmwwyrsrvvbbqaqkgw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocG13d3lyc3J2dmJicWFxa2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4OTA5NjAsImV4cCI6MjA3OTQ2Njk2MH0.IE0cqS6HIlLqJ7LXRU01QTK8rA8GuLwM4AeEwrU2OdU';
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);