import { GoogleGenAI, Type } from "@google/genai";

// --- PRODUCTION SECURITY NOTE ---
// In a real-world application, you MUST NOT call the Gemini API directly from the frontend.
// Your API key would be exposed in the browser.
//
// THE CORRECT ARCHITECTURE:
// Route all API calls through a secure backend proxy (e.g., a serverless function) that adds your
// API key on the server-side. For this demo, we are calling the API directly from the client for simplicity.

/**
 * Safely parses a JSON string.
 * @param jsonString The raw string from the API, which may contain JSON.
 * @returns The parsed JSON object.
 * @throws An error if parsing fails.
 */
const safeJsonParse = (jsonString: string): any => {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse JSON response from backend:", jsonString);
        throw new Error("The API returned a response that was not valid JSON.");
    }
};

/**
 * Generates upsells and recommendations based on client form data.
 */
export async function getClientRecommendations(formData: any): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
        You are an expert ${formData.profession}. A client named ${formData.clientName} is coming in for a "${formData.currentService}".
        - Their concerns are: ${formData.concerns}
        - Their past services include: ${formData.pastServices}
        - Their feedback is: ${formData.feedback}
        Based on this, generate:
        1. Three "Smart Upsells" as an array of objects for their current session.
        2. Three "Personalized Recommendations" as an array of objects for the future.
        Each object in the arrays should have a 'title' and a 'description'. Add a 'type' field (e.g., 'upgrade', 'service', 'product').
    `;
    const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash", contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { upsells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING } } } }, recommendations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING } } } } } } }
    });
    return safeJsonParse(aiResponse.text);
}


/**
 * Analyzes a client photo and profile to generate insights.
 */
export async function analyzeClient(profile: any, imageFile: File): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const reader = new FileReader();
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
    });
    const imagePart = { inlineData: { data: base64EncodedData, mimeType: imageFile.type } };
    const textPart = { text: `You are an expert ${profile.provider_type}. Analyze the attached photo and profile: Name: ${profile.client_name}, Concerns: ${profile.skin_hair_fitness}, Current Service: ${profile.current_service}. Provide JSON with 'observations' (array of strings), 'recommendations' (array of objects), 'upsells' (array of objects), and 'booking_suggestions' (array of objects).` };
    
    const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash', contents: { parts: [imagePart, textPart] },
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { observations: { type: Type.ARRAY, items: { type: Type.STRING } }, recommendations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING }, } } }, upsells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING }, } } }, booking_suggestions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { service: { type: Type.STRING }, date_time: { type: Type.STRING }, notes: { type: Type.STRING }, } } } } } }
    });
    return { analysis: safeJsonParse(aiResponse.text) };
}


/**
 * Generates marketing content based on a prompt and content type.
 */
export async function generateMarketingContent(prompt: string, contentType: string): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const fullPrompt = `You are a marketing expert for a solo service provider. Generate marketing content for: "${prompt}". The format is a "${contentType}". Provide a JSON response with an array of objects, each containing 'type', 'headline', and 'body'.`;
    const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash", contents: fullPrompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, headline: { type: Type.STRING }, body: { type: Type.STRING }, } } }, thinkingConfig: { thinkingBudget: 0 }, }
    });
    return safeJsonParse(aiResponse.text);
}


/**
 * Generates business insights based on performance data.
 */
export async function getBusinessInsights(data: any): Promise<string[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `You are a business coach. Analyze this data: Weekly Bookings: ${data.weekly_bookings.value} (trend: ${data.weekly_bookings.trend * 100}%), Monthly Revenue: $${data.monthly_revenue.value} (trend: ${data.monthly_revenue.trend * 100}%), Retention: ${data.client_retention.value * 100}%, Top Service: ${data.top_services[0]}. Provide an array of 3 actionable, concise insights.`;
    const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash", contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
    });
    return safeJsonParse(aiResponse.text);
}


/**
 * Generates B2B partnership leads for a service provider.
 */
export async function generateLeads(providerInfo: any): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `You are a business development expert. My profile: Service: ${providerInfo.service_type}, Location: ${providerInfo.location}, Ideal Client: ${providerInfo.lead_preferences}. Find 5 fictional but realistic B2B leads in a ${providerInfo.target_radius}-mile radius. For each, provide: name, phone, email, social_media (array of objects), profile_description, rationale, interest_score (70-100), and source.`;
    const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash", contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, phone: { type: Type.STRING }, email: { type: Type.STRING }, social_media: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { platform: { type: Type.STRING }, handle: { type: Type.STRING } } } }, profile_description: { type: Type.STRING }, rationale: { type: Type.STRING }, interest_score: { type: Type.INTEGER }, source: { type: Type.STRING } }, required: ["name", "phone", "email", "social_media", "profile_description", "rationale", "interest_score", "source"] } } }
    });
    return safeJsonParse(aiResponse.text);
}
