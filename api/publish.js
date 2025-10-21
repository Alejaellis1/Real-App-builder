// Vercel Serverless Function: /api/publish.js
import { createClient } from '@supabase/supabase-js';

/**
 * Handles publishing an app by verifying a subscription status directly from Supabase
 * and then saving the app data back to Supabase. This function is designed for the
 * Vercel Node.js 22.x runtime and ensures a JSON response in all cases.
 */
export default async function handler(req, res) {
  // 1. Only accept POST requests.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method Not Allowed. Please use POST.` });
  }

  console.log('Received publish request.');

  // Use a single try...catch block to handle all errors and ensure a JSON response.
  try {
    // 2. Validate required fields from the request body.
    const { contact_id, app_name, html_data } = req.body;
    if (!contact_id || !app_name || !html_data) {
      console.warn('Validation failed: Missing required fields in request body.');
      return res.status(400).json({ success: false, message: 'Missing required fields: contact_id, app_name, and html_data are required.' });
    }
    console.log(`Processing request for contact_id: ${contact_id}`);

    // 3. Verify that all necessary environment variables are set.
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('Server Configuration Error: SUPABASE_URL and/or SUPABASE_SERVICE_KEY are not set.');
      return res.status(500).json({ success: false, message: "Server configuration error." });
    }

    // Initialize the Supabase client.
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    console.log('Supabase client initialized.');

    // 4. Query Supabase to check the subscription status.
    console.log(`Querying Supabase for subscription status for: ${contact_id}`);
    const { data: userRecord, error: queryError } = await supabase
      .from('customer_apps')
      .select('status')
      .eq('contact_id', contact_id)
      .maybeSingle(); // Use maybeSingle() to avoid an error if no record is found.

    if (queryError) {
      console.error('Supabase query error:', queryError.message);
      throw new Error('Failed to query the database for subscription status.');
    }

    // 5. If the record does not exist or its status is not 'active', deny the request.
    if (!userRecord || userRecord.status !== 'active') {
      console.log(`Subscription for ${contact_id} is inactive or not found.`);
      return res.status(403).json({ success: false, message: "Subscription inactive" });
    }

    console.log(`Subscription for ${contact_id} is active. Proceeding with upsert.`);

    // 6. If the subscription is active, upsert the app data.
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
        onConflict: 'contact_id' // Use contact_id as the unique key for upserting.
      });

    if (upsertError) {
      console.error('Supabase upsert error:', upsertError.message);
      throw new Error('Failed to save app data to the database.');
    }
    
    console.log(`Successfully published app for ${contact_id}. URL: ${published_app_url}`);

    // 7. Return the success response with the published URL.
    return res.status(200).json({
      success: true,
      message: 'App published successfully',
      url: published_app_url
    });

  } catch (err) {
    // 8. Robust generic error handler for any unexpected issues.
    console.error('Unhandled error in /api/publish function:', err.message);
    // Return a generic, user-friendly error message.
    return res.status(500).json({ success: false, message: 'An unexpected server error occurred. Please try again later.' });
  }
}