
export default async function handler(req, res) {
  try {
    const subscriptionId = req.query.subscriptionId;
    if (!subscriptionId) return res.status(400).json({ error: "Missing subscription ID" });
    const sheetURL = "https://docs.google.com/spreadsheets/d/e/YOUR_GOOGLE_SHEET_LINK/pub?output=csv";
    const response = await fetch(sheetURL);
    const csv = await response.text();
    const rows = csv.split("\n").map(r => r.split(","));
    const headers = rows[0].map(h => h.trim().toLowerCase());
    const idIndex = headers.indexOf("contact id");
    const statusIndex = headers.indexOf("status");
    const found = rows.find(r => r[idIndex]?.trim() === subscriptionId);
    if (!found || found[statusIndex]?.trim().toLowerCase() !== "active") return res.redirect("/payment-required.html");
    return res.status(200).json({ status: "active" });
  } catch (err) { console.error(err); return res.status(500).json({ error: "Server error" }); }
}
