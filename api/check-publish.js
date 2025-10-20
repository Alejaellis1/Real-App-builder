// Vercel Serverless Function: /api/check-publish.js

export default async function handler(req, res) {
  // 1. Ensure the request method is GET, as this is an idempotent check.
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { contact_id } = req.query;

    // 2. Validate that contact_id is provided.
    if (!contact_id) {
      return res.status(400).json({ success: false, message: 'Missing required parameter: contact_id.' });
    }

    // --- Supabase Verification ---
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        // Return a generic error to the client for security.
        return res.status(500).json({ success: false, message: 'Server error' });
    }
    
    // 3. Query Supabase to find the app data for the given contact_id.
    const queryUrl = `${supabaseUrl}/rest/v1/customer_apps?contact_id=eq.${encodeURIComponent(contact_id)}&select=*`;
    
    const response = await fetch(queryUrl, {
        method: 'GET',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
        },
    });

    if (!response.ok) {
        // Throwing will be caught and handled by the generic error handler below.
        throw new Error('Failed to query database.');
    }
    
    const data = await response.json();

    // 4. Perform checks on the retrieved data.
    if (data.length === 0) {
      // No record found for this contact_id.
      return res.status(200).json({ success: false, message: 'App is not published or incomplete' });
    }

    const appData = data[0];

    // Check if essential data fields are present and not empty.
    if (!appData.html_data || !appData.app_name) {
      return res.status(200).json({ success: false, message: 'App is not published or incomplete' });
    }

    // 5. If all checks pass, construct the URL and return success.
    // The frontend expects a relative path to construct the full URL. This is more
    // flexible than a hardcoded URL and works correctly with the existing UI.
    const publishedUrl = `/customer-apps/${encodeURIComponent(contact_id)}`;
    
    return res.status(200).json({ 
      success: true, 
      message: 'App is published successfully',
      url: publishedUrl
    });

  } catch (err) {
    // Return a generic server error as requested for any unexpected issues.
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
