// Vercel Serverless Function: /api/publish.js
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

/**
 * Handles publishing an app by verifying a Stripe subscription and then saving the
 * app data to Supabase. This function is designed for the Vercel Node.js 22.x runtime.
 */
export default async function handler(req, res) {
  // 1. Only accept POST requests.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method Not Allowed. Please use POST.` });
  }

  console.log('Received publish request.');

  try {
    // 2. Validate required fields from the request body.
    const { contact_id, app_name, html_data } = req.body;
    if (!contact_id || !app_name || !html_data) {
      console.warn('Validation failed: Missing required fields in request body.');
      return res.status(400).json({ success: false, message: 'Missing required fields: contact_id, app_name, and html_data are required.' });
    }
    console.log(`Processing request for contact_id: ${contact_id}`);

    // 3. Verify that all necessary environment variables are set.
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY, STRIPE_SECRET_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !STRIPE_SECRET_KEY) {
      console.error('Server Configuration Error: Missing SUPABASE_URL, SUPABASE_SERVICE_KEY, or STRIPE_SECRET_KEY.');
      return res.status(500).json({ success: false, message: "Server configuration error." });
    }

    // 4. Connect to Supabase and fetch stripe_customer_id.
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    console.log('Supabase client initialized.');

    console.log(`Querying Supabase for stripe_customer_id for: ${contact_id}`);
    const { data: userRecord, error: queryError } = await supabase
      .from('customer_apps')
      .select('stripe_customer_id')
      .eq('contact_id', contact_id)
      .maybeSingle();

    if (queryError) {
      console.error('Supabase query error:', queryError.message);
      throw new Error('Failed to query the database for customer details.');
    }

    if (!userRecord || !userRecord.stripe_customer_id) {
      console.log(`Subscription for ${contact_id} not found or missing Stripe customer ID.`);
      return res.status(403).json({ success: false, message: "Subscription inactive" });
    }
    const stripeCustomerId = userRecord.stripe_customer_id;
    console.log(`Found Stripe Customer ID: ${stripeCustomerId}`);

    // 5. Verify that the Stripe customer has an active subscription.
    const stripe = new Stripe(STRIPE_SECRET_KEY);

    console.log(`Checking Stripe for active subscriptions for customer: ${stripeCustomerId}`);
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all',
      limit: 10,
    });

    const hasActiveSubscription = subscriptions.data.some(
      sub => sub.status === 'active' || sub.status === 'trialing'
    );

    if (!hasActiveSubscription) {
      console.log(`No active Stripe subscription found for customer: ${stripeCustomerId}`);
      return res.status(403).json({ success: false, message: "Subscription inactive" });
    }

    console.log(`Active subscription confirmed for customer: ${stripeCustomerId}. Proceeding with upsert.`);

    // 6. If the subscription is active, upsert the app data into Supabase.
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
      throw new Error('Failed to save app data to the database.');
    }

    console.log(`Successfully published app for ${contact_id}. URL: ${published_app_url}`);

    // 7. Return a JSON response with success: true.
    return res.status(200).json({
      success: true,
      message: 'App published successfully',
      url: published_app_url
    });

  } catch (err) {
    // 8. Handle any unexpected server errors.
    console.error('Unhandled error in /api/publish function:', err.message);
    if (err.type) { // Check for a Stripe error object
        return res.status(500).json({ success: false, message: `A payment processing error occurred: ${err.message}` });
    }
    return res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
  }
}
