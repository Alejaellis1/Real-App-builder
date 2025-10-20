// Vercel Serverless Function: /api/publish.js
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';

/**
 * Handles publishing an app by verifying a subscription and saving data to Supabase.
 * This endpoint is compatible with the Vercel Node.js 22.x runtime.
 */
export default async function handler(req, res) {
  // 1. Only accept POST requests.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Please use POST` });
  }

  try {
    // 2. Read and validate required fields from the request body.
    const { contact_id, app_name, html_data } = req.body;
    if (!contact_id || !app_name || !html_data) {
      return res.status(400).json({ success: false, message: 'Missing required fields: contact_id, app_name, and html_data are required.' });
    }

    // 3. Fetch and parse the Google Sheet to verify the subscription.
    const sheetURL = process.env.GOOGLE_SHEET_URL;
    if (!sheetURL) {
      console.error('Server Configuration Error: GOOGLE_SHEET_URL is not set.');
      // Never expose internal configuration details in the response.
      return res.status(500).json({ success: false, message: 'Server configuration error.' });
    }

    let contactIsActive = false;
    try {
      const sheetResponse = await fetch(sheetURL);
      if (!sheetResponse.ok) throw new Error(`Failed to fetch Google Sheet. Status: ${sheetResponse.status}`);
      
      const csvText = await sheetResponse.text();
      const parsedData = Papa.parse(csvText, { header: true, skipEmptyLines: true });

      const userRecord = parsedData.data.find(row => 
        (row['contact id'] || row['contact_id'])?.trim().toLowerCase() === contact_id.trim().toLowerCase()
      );

      if (userRecord && userRecord.status?.trim().toLowerCase() === 'active') {
        contactIsActive = true;
      }
    } catch (err) {
      console.error('Error during Google Sheet verification:', err.message);
      return res.status(500).json({ success: false, message: 'Could not verify your subscription status.' });
    }
    
    if (!contactIsActive) {
      return res.status(403).json({ success: false, message: 'Subscription inactive or contact not found' });
    }

    // 4. Connect to Supabase and upsert the app data.
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Server Configuration Error: Supabase URL or Service Key is not set.');
      return res.status(500).json({ success: false, message: 'Server configuration error.' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 5. Generate the unique published URL.
    const published_app_url = `/customer-apps/${encodeURIComponent(contact_id)}`;

    const { error: upsertError } = await supabase
      .from('customer_apps')
      .upsert({
        contact_id,
        app_name,
        html_data,
        last_updated: new Date().toISOString(),
        published_app_url,
      }, {
        onConflict: 'contact_id' // Assumes 'contact_id' is the primary key or has a UNIQUE constraint.
      });

    if (upsertError) {
      // Let the generic catch block handle this for consistent error logging.
      throw upsertError;
    }

    // 6. Return a clean success JSON response.
    return res.status(200).json({
      success: true,
      message: 'App published successfully',
      url: published_app_url
    });

  } catch (err) {
    // 7. Robust error handling for any unexpected issues.
    console.error('Unhandled error in /api/publish:', err.message);
    // Avoid exposing detailed Supabase or other internal errors to the client.
    return res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
  }
}