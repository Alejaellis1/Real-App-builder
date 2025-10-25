import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import FormData from 'form-data';

// Initialize Supabase with your private service key
const supabase = createClient(
  process.env.SUPABASE_URL,          // Supabase project URL
  process.env.SUPABASE_SERVICE_KEY   // Supabase service role key
);

export default async function handler(req, res) {
  try {
    // 1️⃣ Get Stripe customer ID from request body
    const { stripeCustomerId } = req.body;
    if (!stripeCustomerId) return res.status(400).json({ error: 'Missing stripeCustomerId' });

    // 2️⃣ Look up the customer's folder in Supabase table
    const { data: appData, error: tableError } = await supabase
      .from('published_apps')
      .select('folder_name')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();

    if (tableError || !appData) return res.status(404).json({ error: 'Customer app not found' });

    const folderName = appData.folder_name;

    // 3️⃣ List all files in the bucket folder
    const { data: filesList, error: listError } = await supabase.storage
      .from('customer-apps')       // Your bucket name
      .list(folderName, { limit: 100 });

    if (listError) throw listError;

    // 4️⃣ Download each file and prepare for Vercel deployment
    const files = await Promise.all(
      filesList.map(async (file) => {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('customer-apps')
          .download(`${folderName}/${file.name}`);
        if (downloadError) throw downloadError;

        const arrayBuffer = await fileData.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        return {
          file: `apps/${folderName}/${file.name}`,
          data: base64
        };
      })
    );

    // 5️⃣ Deploy to Vercel
    const form = new FormData();
    form.append('name', process.env.VERCEL_PROJECT_ID); // Vercel project ID
    form.append('target', 'production');
    form.append('files', JSON.stringify(files));

    const vercelResponse = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
      body: form
    });

    const deployment = await vercelResponse.json();
    if (!deployment.url) throw new Error('Deployment failed');

    // 6️⃣ Update Supabase table with live URL & timestamp
    await supabase
      .from('published_apps')
      .update({
        vercel_url: `https://${deployment.url}`,
        status: 'published',
        last_deploy: new Date()
      })
      .eq('stripe_customer_id', stripeCustomerId);

    // 7️⃣ Return the live URL
    res.status(200).json({ url: `https://${deployment.url}` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Deployment failed', details: err.message });
  }
}
