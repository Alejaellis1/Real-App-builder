// Vercel Serverless Function: /api/publish.js
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// --- Pre-flight Check for Environment Variables ---
// This check runs when the function is initialized. If critical variables are missing,
// the function will fail to deploy or start, making the configuration error clear in Vercel logs.
const { SUPABASE_URL, SUPABASE_SERVICE_KEY, STRIPE_SECRET_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !STRIPE_SECRET_KEY) {
    console.error('FATAL_ERROR: Serverless function is missing required environment variables (SUPABASE_URL, SUPABASE_SERVICE_KEY, STRIPE_SECRET_KEY). The function cannot start.');
    throw new Error('Server configuration error: Missing required environment variables.');
}

// Initialize clients once per function instance for efficiency.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10', // Pin the API version for stability
});

/**
 * Handles publishing an app by verifying a Stripe subscription and then saving the
 * app data to Supabase. This function is designed for the Vercel Node.js 22.x runtime.
 */
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method Not Allowed. Please use POST.` });
  }

  console.log('Received publish request.');

  try {
    const { contact_id, app_name, html_data } = req.body;
    if (!contact_id || !app_name || !html_data) {
      console.warn('Validation failed: Missing required fields in request body.');
      return res.status(400).json({ success: false, message: 'Missing required fields: contact_id, app_name, and html_data are required.' });
    }
    console.log(`Processing request for contact_id: ${contact_id}`);

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

    console.log(`Checking Stripe for active subscriptions for customer: ${stripeCustomerId}`);
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all', // Check all statuses and then filter client-side
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

    return res.status(200).json({
      success: true,
      message: 'App published successfully',
      url: published_app_url
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Unhandled error in /api/publish function:', errorMessage);
    
    // Stripe-specific error handling
    if (err && typeof err === 'object' && 'type' in err) {
        if (err.type === 'StripeAuthenticationError') {
            console.error('Stripe Authentication Error: The API key is likely invalid or missing permissions.');
            // This is a server configuration issue. Send a user-friendly, generic message.
            return res.status(500).json({ success: false, message: 'There is a problem with the payment system configuration. Please contact support.' });
        }
        // For other Stripe errors, return a slightly more descriptive but still safe message.
        return res.status(500).json({ success: false, message: `A payment processing error occurred. Please try again or contact support.` });
    }
    
    // Check for custom errors thrown from Supabase operations
    if (errorMessage.includes('database')) {
        return res.status(500).json({ success: false, message: 'A database error occurred. Please contact support if the problem persists.' });
    }
    
    // Generic fallback for any other unexpected errors
    return res.status(500).json({ success: false, message: 'An unexpected server error occurred. Please try again later.' });
  }
}