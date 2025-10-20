
// Vercel Serverless Function: /api/publish.js

export default async function handler(req, res) {
  // 1. Ensure the request method is POST.
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { contact_id, html_data, app_name } = req.body;

    // 2. Validate incoming data. 'contact_id' is expected to be the user's email.
    if (!contact_id || !html_data || !app_name) {
      return res.status(400).json({ success: false, error: 'Missing required fields: contact_id, html_data, and app_name are required.' });
    }

    // --- Google Sheet Authentication & Subscription Check ---
    const sheetURL = process.env.GOOGLE_SHEET_URL;
    if (!sheetURL) {
      console.error('Server configuration error: GOOGLE_SHEET_URL is not set.');
      return res.status(500).json({ success: false, error: 'Server configuration error.' });
    }
    
    let contactStatus;

    try {
      const sheetResponse = await fetch(sheetURL);
      if (!sheetResponse.ok) {
        throw new Error(`Failed to fetch from Google Sheet. Status: ${sheetResponse.status}`);
      }
      
      const csv = await sheetResponse.text();
      // Split by newline, then by comma, and trim whitespace from each cell.
      const rows = csv.split('\n').map(r => r.split(',').map(c => c.trim()));
      
      // Assumes 'contact_id' is in Column A (index 0) and 'status' is in Column C (index 2).
      const contactData = rows.find(r => r[0] && r[0].toLowerCase() === contact_id.toLowerCase());
      
      if (!contactData) {
        return res.status(404).json({ success: false, error: 'Contact ID not found.' });
      }
      
      contactStatus = contactData[2] ? contactData[2].toLowerCase() : '';

      if (contactStatus !== 'active') {
        // The user is authenticated but does not have an active subscription.
        // The frontend should handle this by redirecting to the payment page.
        return res.status(403).json({ success: false, error: 'Subscription is not active. Please go to your billing page to reactivate.', redirectUrl: '/payment-required.html' });
      }

    } catch (err) {
      console.error('Error during Google Sheet authentication:', err);
      return res.status(500).json({ success: false, error: 'Could not verify your account information.' });
    }
    
    // --- Data Storage in Supabase ---
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Server configuration error: Supabase URL or Service Key is not set.');
        return res.status(500).json({ success: false, error: 'Server configuration error.' });
    }
    
    const payload = {
        contact_id, // The email is the primary key for the upsert
        html_data,
        app_name,
        status: contactStatus,
        last_updated: new Date().toISOString(),
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/customer_apps`, {
        method: 'POST',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates' // This header enables "upsert" behavior
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Supabase error:', errorData);
        throw new Error(errorData.message || 'Failed to save app data.');
    }
    
    // 5. Return the unique URL path for the published app.
    // The contact_id (email) is encoded to handle special characters like '@'.
    const urlPath = `/customer-apps/${encodeURIComponent(contact_id)}`;
    
    return res.status(200).json({ 
      success: true, 
      url: urlPath
    });

  } catch (err) {
    console.error('Unhandled error in /api/publish:', err);
    return res.status(500).json({ success: false, error: err.message || 'An unexpected server error occurred.' });
  }
}
