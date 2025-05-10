import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vboqzuiqihrdchlvooku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib3F6dWlxaWhyZGNobHZvb2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5ODU1MjUsImV4cCI6MjA1OTU2MTUyNX0.YYTOC8KVsxMlKpsfCOrkjj56MTlr9hx1mZUY6jTYgTA';
export const supabase = createClient(supabaseUrl, supabaseKey);
export { supabaseKey as supabaseAnonKey }; // Export the anon key for use in fetch requests