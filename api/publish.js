// Vercel Serverless Function: /api/publish.js

/**
 * Handles the publishing of a customer's app.
 * - GET: Returns a status message indicating the API is running.
 * - POST: Verifies a user's subscription, upserts app data, and returns a URL.
 */
export default async function handler(req, res) {
  // --- Handle GET request for status check ---
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: "Publish API is running correctly. Use POST to publish an app."
    });
  }

  // --- Handle POST request for publishing ---
  if (req.method === 'POST') {
    try {
      const { contact_id, html_data, app_name } = req.body;

      // 1. Validate required fields in the request body.
      if (!contact_id || !html_data || !app_name) {
        return res.status(400).json({ success: false, message: 'Missing required fields: contact_id, html_data, and app_name are required.' });
      }

      // --- 2. Google Sheet Authentication & Subscription Check ---
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
        const rows = csv.split('\n').map(row => row.trim().split(',').map(cell => cell.trim().replace(/"/g, '')));
        
        if (rows.length < 2) {
          throw new Error("CSV is empty or has no data rows.");
        }

        const headers = rows[0].map(h => h.toLowerCase());
        const contactIdIndex = headers.indexOf('contact id') > -1 ? headers.indexOf('contact id') : headers.indexOf('contact_id');
        const statusIndex = headers.indexOf('status');

        if (contactIdIndex === -1 || statusIndex === -1) {
          throw new Error("CSV headers are missing 'contact id' or 'status' columns.");
        }
        
        // Find the user's row and check their status
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            // Ensure the row has enough columns before accessing indices
            if (row.length > Math.max(contactIdIndex, statusIndex) && row[contactIdIndex] && row[contactIdIndex].toLowerCase() === contact_id.toLowerCase()) {
                if (row[statusIndex] && row[statusIndex].toLowerCase() === 'active') {
                    contactIsActive = true;
                }
                break; // Found the user, exit loop
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
      // Use a fallback URL to prevent errors if the env var isn't set.
      const appBaseUrl = process.env.APP_BASE_URL || 'https://YOUR-APP-BUILDER-URL.vercel.app';

      if (!supabaseUrl || !supabaseKey) {
        console.error('Server Configuration Error: Supabase URL or Service Key is not set.');
        return res.status(500).json({ success: false, message: 'Server configuration error.' });
      }
      
      const publishedUrl = `${appBaseUrl}/customer-apps/${encodeURIComponent(contact_id)}`;

      const payload = {
        contact_id,
        html_data,
        app_name,
        last_updated: new Date().toISOString(),
        published_app_url: publishedUrl,
      };

      const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/customer_apps`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });

      if (!supabaseResponse.ok) {
        const errorData = await supabaseResponse.json();
        console.error('Supabase Error:', errorData);
        throw new Error(errorData.message || 'Failed to save app data to the database.');
      }

      // --- 4. Return Success Response ---
      return res.status(200).json({
        success: true,
        message: 'App published successfully',
        url: publishedUrl
      });

    } catch (err) {
      console.error('Unhandled error in /api/publish (POST):', err);
      return res.status(500).json({ success: false, message: err.message || 'An unexpected server error occurred.' });
    }
  }

  // --- Handle other methods ---
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed.` });
}
