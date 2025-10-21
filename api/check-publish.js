// Vercel Serverless Function: /api/check-publish.js
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';

/**
 * Checks if a user has an active subscription and a published app.
 * This function is designed to be robust, always returning a JSON response
 * to prevent Vercel from issuing 502 Gateway Errors.
 * Compatible with the Vercel Node.js 22.x runtime.
 */
export default async function handler(req, res) {
  // 1. Handle non-POST requests by returning a JSON error with 200 OK status.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(200).json({ success: false, message: 'Method Not Allowed. Please use POST.' });
  }

  try {
    // 2. Validate the request body for the required 'contact_id'.
    const { contact_id } = req.body;
    if (!contact_id) {
      return res.status(200).json({ success: false, message: 'Missing required parameter: contact_id.' });
    }

    // 3. Verify the existence of all necessary environment variables first.
    const { GOOGLE_SHEET_URL, SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

    // Specific check for Supabase credentials, as requested.
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error('Server Configuration Error: SUPABASE_URL or SUPABASE_ANON_KEY is not set.');
        return res.status(200).json({ success: false, message: 'Missing Supabase credentials' });
    }
    if (!GOOGLE_SHEET_URL) {
        console.error('Server Configuration Error: GOOGLE_SHEET_URL is not set.');
        return res.status(200).json({ success: false, message: 'Server configuration error. Please contact support.' });
    }

    // 4. Verify the user has an active subscription from the Google Sheet.
    let isSubscribedAndActive = false;
    try {
        const sheetResponse = await fetch(GOOGLE_SHEET_URL);
        if (!sheetResponse.ok) {
            console.error(`Failed to fetch Google Sheet. Status: ${sheetResponse.status}`);
            throw new Error('Could not connect to the subscription service.');
        }
        const csvText = await sheetResponse.text();
        const parsedData = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        const userRecord = parsedData.data.find(row => 
            (row['contact id'] || row['contact_id'])?.trim().toLowerCase() === contact_id.trim().toLowerCase()
        );
        if (userRecord && userRecord.status?.trim().toLowerCase() === 'active') {
            isSubscribedAndActive = true;
        }
    } catch (err) {
        console.error('Error during Google Sheet verification:', err.message);
        return res.status(200).json({ success: false, message: 'Could not verify subscription status.' });
    }

    if (!isSubscribedAndActive) {
      return res.status(200).json({ success: false, message: 'Subscription inactive or not found' });
    }

    // 5. Query Supabase for the published app details with dedicated error handling.
    let publishedAppData;
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data, error } = await supabase
            .from('customer_apps')
            .select('published_app_url')
            .eq('contact_id', contact_id)
            .maybeSingle();

        if (error) {
            // Throw the Supabase-specific error to be caught by this block's catch statement.
            throw error;
        }
        publishedAppData = data;

    } catch(err) {
        console.error('Supabase connection or query error:', err.message);
        return res.status(200).json({ success: false, message: 'Failed to connect to the database.' });
    }

    if (!publishedAppData || !publishedAppData.published_app_url) {
        // This case uses the same message as an inactive subscription, per requirements.
        return res.status(200).json({ success: false, message: 'Subscription inactive or not found' });
    }

    // 6. If all checks pass, return the success response.
    return res.status(200).json({
        success: true,
        message: 'App is published',
        url: publishedAppData.published_app_url
    });

  } catch (err) {
    // 7. A generic catch-all for any other unexpected errors during execution.
    console.error('Unhandled error in /api/check-publish:', err.message || err);
    return res.status(200).json({ success: false, message: 'An unexpected server error occurred.' });
  }
}
