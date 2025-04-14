// supabaseClient.js
import { supabase } as base from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js';

const SUPABASE_URL = 'https://napmuiqctvbegldujfbb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcG11aXFjdHZiZWdsZHVqZmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MzQ1NzYsImV4cCI6MjA2MDExMDU3Nn0.U4SPKOZNpnhhTUzYdiRP_t8O0cAWKrefFrN_ic7jQ6g';

export const supabase = base.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
