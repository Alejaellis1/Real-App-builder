// Vercel Serverless Function: /api/get-app.js
import { createClient } from '@supabase/supabase-js';

// --- Pre-flight Check for Environment Variables ---
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('FATAL_ERROR: Serverless function is missing required Supabase environment variables. The function cannot start.');
    throw new Error('Server configuration error: Missing required environment variables.');
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Handles fetching the design configuration for a published app.
 * This function is designed for the Vercel Node.js 22.x runtime.
 */
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: 'Method Not Allowed. Please use GET.' });
  }

  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Missing required query parameter: id.' });
    }

    // Fetch the app data from Supabase
    const { data, error } = await supabase
      .from('customer_apps')
      .select('html_data') // This column now stores the JSON config string
      .eq('contact_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // PostgREST error for "exact one row not found"
        return res.status(404).json({ success: false, message: 'App not found.' });
      }
      console.error('Supabase query error:', error.message);
      throw new Error('Failed to retrieve app data from the database.');
    }

    if (!data || !data.html_data) {
      return res.status(404).json({ success: false, message: 'App configuration not found.' });
    }
    
    // Parse the JSON string from the database
    let config;
    try {
        config = JSON.parse(data.html_data);
    } catch (parseError) {
        console.error(`Failed to parse app config for ID ${id}:`, parseError);
        throw new Error('App data is corrupted and could not be loaded.');
    }
    
    // Return the configuration object
    return res.status(200).json({
      success: true,
      config: config
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Unhandled error in /api/get-app function:', errorMessage);
    return res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
  }
}