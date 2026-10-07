require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      realtime: {
        transport: WebSocket
      }
    });
    console.log('⚡ Supabase Client initialized successfully.');
  } catch (err) {
    console.error('⚠️ Failed to initialize Supabase Client:', err.message);
  }
} else {
  console.warn('⚠️ Supabase credentials not configured in .env. Falling back to local in-memory storage.');
}

module.exports = supabase;
