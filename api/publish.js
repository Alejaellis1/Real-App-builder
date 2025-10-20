// Vercel Serverless Function: /api/publish.js

/**
 * Handles the publishing of a customer's app.
 * 1. Verifies the user's subscription status is 'active' from a Google Sheet.
 * 2. If active, it "upserts" (inserts or updates) the app data into a Supabase table.
 * 3. Returns a unique URL for the published app.
 */
export default async function handler(req, res) {
  // --- 1. Request Validation ---
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed. Please use POST.' });
  }

  try {
    const { contact_id, html_data, app_name } = req.body;

    // Validate that all required fields are present in the request body.
    if (!contact_id || !html_data || !app_name) {
      return res.status(400).json({ success: false, message: 'Missing required fields: contact_id, html_data, and app_name are required.' });
    }

    // --- 2. Google Sheet Authentication & Subscription Check ---
    // The URL for the Google Sheet (published as CSV) is stored in an environment variable.
    // Set this to: https://docs.google.com/spreadsheets/d/e/2PACX-1vTivkgq6nsWC-hRGkNTdyovQKy_afPWA1WevnrVm4lSzlttacFzdCq-KNJybaOQ4oqc9Wdmc43kYKd4/pub?output=csv
    const sheetURL = process.env.GOOGLE_SHEET_URL;
    if (!sheetURL) {
      console.error('Server Configuration Error: GOOGLE_SHEET_URL is not set.');
      return res.status(500).json({ success: false, message: 'Server configuration error.' });
    }
    
    let contactIsActive = false;

    try {
      const sheetResponse = await fetch(sheetURL);
      if (!sheetResponse.ok) {
        throw new Error(`Failed to fetch Google Sheet. Status: ${sheetResponse.status}`);
      }
      
      const csv = await sheetResponse.text();
      // Parse the CSV robustly without external libraries
      const rows = csv.split('\n').map(row => row.trim().split(',').map(cell => cell.trim().replace(/"/g, '')));
      
      if (rows.length < 2) {
          throw new Error("CSV is empty or has no data rows.");
      }

      const headers = rows[0].map(h => h.toLowerCase());
      // Common header variations for flexibility
      const contactIdIndex = headers.indexOf('contact id') > -1 ? headers.indexOf('contact id') : headers.indexOf('contact_id');
      const statusIndex = headers.indexOf('status');

      if (contactIdIndex === -1 || statusIndex === -1) {
          throw new Error("CSV headers are missing 'contact id' or 'status' columns.");
      }

      // Find the user's row and check their status
      for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length > Math.max(contactIdIndex, statusIndex) && row[contactIdIndex] && row[contactIdIndex].toLowerCase() === contact_id.toLowerCase()) {
              if (row[statusIndex] && row[statusIndex].toLowerCase() === 'active') {
                  contactIsActive = true;
              }
              break; // Found the user, no need to continue looping
          }
      }

      if (!contactIsActive) {
        return res.status(403).json({ success: false, message: 'Subscription inactive or payment required' });
      }

    } catch (err) {
      console.error('Error during Google Sheet verification:', err);
      return res.status(500).json({ success: false, message: 'Could not verify your account information.' });
    }
    
    // --- 3. Data Storage in Supabase ---
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Server Configuration Error: Supabase URL or Service Key is not set.');
        return res.status(500).json({ success: false, message: 'Server configuration error.' });
    }
    
    const payload = {
        contact_id, // The email is the primary key for the upsert
        html_data,
        app_name,
        last_updated: new Date().toISOString(),
    };

    // Use the Supabase REST API to upsert the data.
    const response = await fetch(`${supabaseUrl}/rest/v1/customer_apps`, {
        method: 'POST',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates' 
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Supabase Error:', errorData);
        throw new Error(errorData.message || 'Failed to save app data to the database.');
    }
    
    // --- 4. Return Success Response ---
    const appBaseUrl = process.env.APP_BASE_URL || 'https://YOUR-APP-BUILDER-URL.vercel.app';
    const publishedUrl = `${appBaseUrl}/customer-apps/${encodeURIComponent(contact_id)}`;
    
    return res.status(200).json({ 
      success: true, 
      message: 'App published',
      url: publishedUrl
    });

  } catch (err) {
    console.error('Unhandled error in /api/publish:', err);
    return res.status(500).json({ success: false, message: err.message || 'An unexpected server error occurred.' });
  }
}