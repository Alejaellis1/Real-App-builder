// Vercel Serverless Function: /api/publish.js
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';

/**
 * Handles publishing an app by verifying a subscription and saving data to Supabase.
 * This function is designed to be robust and always return a JSON response
 * to avoid Vercel 502 errors on unhandled exceptions.
 * Compatible with the Vercel Node.js 22.x runtime.
 */
export default async function handler(req, res) {
  // 1. Only accept POST requests.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method Not Allowed. Please use POST.` });
  }

  try {
    // 2. Validate required fields from the request body.
    console.log('Publish request received. Validating body...');
    const { contact_id, app_name, html_data } = req.body;
    if (!contact_id || !app_name || !html_data) {
      console.warn('Validation failed: Missing required fields.');
      return res.status(400).json({ success: false, message: 'Missing required fields: contact_id, app_name, and html_data are required.' });
    }
    console.log(`Request validated for contact_id: ${contact_id}`);

    // 3. Verify existence of all necessary environment variables first.
    console.log('Checking for necessary environment variables...');
    const { GOOGLE_SHEET_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

    if (!GOOGLE_SHEET_URL || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error('Server Configuration Error: One or more required environment variables are not set (GOOGLE_SHEET_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY).');
        return res.status(500).json({ success: false, message: "Server configuration error" });
    }
    console.log('Environment variables check passed.');

    // 4. Fetch and parse the Google Sheet to verify the subscription.
    console.log('Verifying subscription status from Google Sheet...');
    const sheetResponse = await fetch(GOOGLE_SHEET_URL);
    if (!sheetResponse.ok) {
        console.error(`Failed to fetch Google Sheet. Status: ${sheetResponse.status} ${sheetResponse.statusText}`);
        throw new Error('Could not connect to the subscription service.');
    }
    
    const csvText = await sheetResponse.text();
    const parsedData = Papa.parse(csvText, { header: true, skipEmptyLines: true });

    const userRecord = parsedData.data.find(row => 
        (row['contact id'] || row['contact_id'])?.trim().toLowerCase() === contact_id.trim().toLowerCase()
    );

    let isSubscribedAndActive = false;
    if (userRecord && userRecord.status?.trim().toLowerCase() === 'active') {
        isSubscribedAndActive = true;
        console.log(`Subscription for ${contact_id} is active.`);
    } else {
        console.log(`Subscription for ${contact_id} is inactive or not found.`);
    }
    
    // 5. If not active, return the specific failure message.
    if (!isSubscribedAndActive) {
      return res.status(403).json({ success: false, message: "Subscription inactive" });
    }

    // 6. Connect to Supabase and upsert the app data.
    console.log('Connecting to Supabase to save app data...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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
        onConflict: 'contact_id'
      });

    if (upsertError) {
      console.error('Supabase upsert error:', upsertError.message);
      throw upsertError;
    }

    console.log(`Successfully saved app data for ${contact_id}.`);

    // 7. Return the success JSON response.
    return res.status(200).json({
      success: true,
      message: 'App published successfully',
      url: published_app_url
    });

  } catch (err) {
    // 8. Robust generic error handling for any unexpected issues.
    console.error('Unhandled error in /api/publish function:', err.message);
    return res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
  }
}
