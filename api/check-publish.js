// Vercel Serverless Function: /api/check-publish.js

export default async function handler(req, res) {
  // 1. Ensure the request method is GET.
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
        console.error('Server configuration error: Supabase URL or Service Key is not set.');
        return res.status(500).json({ success: false, message: 'Server configuration error.' });
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
        const errorData = await response.json();
        console.error('Supabase query error:', errorData);
        throw new Error(errorData.message || 'Failed to connect to the database.');
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

    // Optional: Check if the last_updated timestamp is recent.
    // const lastUpdated = new Date(appData.last_updated);
    // const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // if (lastUpdated < oneDayAgo) {
    //   return res.status(200).json({ success: false, message: "App has not been published recently." });
    // }

    // 5. If all checks pass, construct the URL and return success.
    const publishedUrl = `/customer-apps/${encodeURIComponent(contact_id)}`;
    
    return res.status(200).json({ 
      success: true, 
      message: 'App is published successfully',
      url: publishedUrl
    });

  } catch (err) {
    console.error('Unhandled error in /api/check-publish:', err);
    return res.status(500).json({ success: false, message: err.message || 'An unexpected server error occurred.' });
  }
}