
import fs from "fs";
import path from "path";
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { subscriptionId, appHTML } = req.body;
    if (!subscriptionId || !appHTML) return res.status(400).json({ error: "Missing subscriptionId or appHTML" });
    const appPath = path.join(process.cwd(), "customer-apps", `${subscriptionId}.html`);
    fs.writeFileSync(appPath, appHTML);
    return res.status(200).json({ success: true, url: `/customer-apps/${subscriptionId}.html` });
  } catch (err) { console.error(err); return res.status(500).json({ error: "Could not save app" }); }
}
