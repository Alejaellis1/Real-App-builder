
import { GoogleGenAI, Type, Modality } from "@google/genai";

// --- PRODUCTION ARCHITECTURE NOTE ---
// For enhanced security, API calls should be routed through a backend proxy
// that injects the API key server-side. This prevents exposing the key in the browser.

/**
 * Safely parses a JSON string.
 * @param jsonString The raw string from the API, which may contain JSON.
 * @returns The parsed JSON object.
 * @throws An error if parsing fails.
 */
const safeJsonParse = (jsonString: string): any => {
    try {
        // First, trim any whitespace or potential markdown code fences
        const cleanedString = jsonString.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
        return JSON.parse(cleanedString);
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
        config: { 
            responseMimeType: "application/json", 
            responseSchema: { 
                type: Type.OBJECT, 
                properties: { 
                    upsells: { 
                        type: Type.ARRAY,
                        description: "A list of 3 potential upsells for the client's current session.",
                        items: { 
                            type: Type.OBJECT, 
                            properties: { 
                                type: { type: Type.STRING, description: "The type of upsell (e.g., 'upgrade', 'service', 'product')." }, 
                                title: { type: Type.STRING, description: "The name of the upsell." }, 
                                description: { type: Type.STRING, description: "A brief description of the upsell." } 
                            } 
                        } 
                    }, 
                    recommendations: { 
                        type: Type.ARRAY,
                        description: "A list of 3 personalized recommendations for the client's future visits or at-home care.",
                        items: { 
                            type: Type.OBJECT, 
                            properties: { 
                                type: { type: Type.STRING, description: "The type of recommendation (e.g., 'service', 'product', 'consultation')." }, 
                                title: { type: Type.STRING, description: "The name of the recommended item." }, 
                                description: { type: Type.STRING, description: "A brief description of the recommendation." } 
                            } 
                        } 
                    } 
                } 
            } 
        }
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
        config: { 
            responseMimeType: "application/json", 
            responseSchema: { 
                type: Type.OBJECT, 
                properties: { 
                    observations: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: "A list of visual observations from the client's photo."
                    }, 
                    recommendations: { 
                        type: Type.ARRAY,
                        description: "Personalized future recommendations for the client.",
                        items: { 
                            type: Type.OBJECT, 
                            properties: { 
                                type: { type: Type.STRING, description: "The type of recommendation (e.g., 'service', 'product')." }, 
                                title: { type: Type.STRING, description: "The title of the recommendation." }, 
                                description: { type: Type.STRING, description: "A detailed description of the recommendation." }
                            } 
                        } 
                    }, 
                    upsells: { 
                        type: Type.ARRAY, 
                        description: "Potential upsells for the client's current service.",
                        items: { 
                            type: Type.OBJECT, 
                            properties: { 
                                type: { type: Type.STRING, description: "The type of upsell (e.g., 'upgrade', 'add-on')." }, 
                                title: { type: Type.STRING, description: "The title of the upsell for the current session." }, 
                                description: { type: Type.STRING, description: "A detailed description of the upsell." }
                            } 
                        } 
                    }, 
                    booking_suggestions: { 
                        type: Type.ARRAY,
                        description: "Suggestions for the client's next appointment.",
                        items: { 
                            type: Type.OBJECT, 
                            properties: { 
                                service: { type: Type.STRING, description: "The suggested service to book next." }, 
                                date_time: { type: Type.STRING, description: "A suggested time frame for the next booking (e.g., 'in 4-6 weeks')." }, 
                                notes: { type: Type.STRING, description: "Any relevant notes for the next booking." }
                            } 
                        } 
                    } 
                } 
            } 
        }
    });
    return { analysis: safeJsonParse(aiResponse.text) };
}


/**
 * Generates marketing content based on a prompt and content type.
 */
export async function generateMarketingContent(prompt: string, contentType: string): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // FIX: Simplified the prompt to focus on the creative task, relying on the schema for structure.
    // This prevents the AI from getting confused and generating a malformed, long string.
    const fullPrompt = `You are a marketing expert for a solo service provider. Generate 3 distinct marketing content ideas for "${prompt}". The content should be in the style of a "${contentType}".`;
    
    const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: fullPrompt,
        // FIX: Added descriptive text to the schema properties to give the AI clearer instructions
        // on what content belongs in each field, resolving the JSON parsing error and improving speed.
        config: { 
            responseMimeType: "application/json", 
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { 
                            type: Type.STRING,
                            description: `The specific type of content generated, matching the request (e.g., '${contentType}').`
                        },
                        headline: { 
                            type: Type.STRING,
                            description: 'A catchy headline or subject line for the content.'
                        },
                        body: { 
                            type: Type.STRING,
                            description: 'The main body of the marketing content, including hashtags if relevant.'
                        },
                    }
                }
            }
        }
    });
    return safeJsonParse(aiResponse.text);
}

// FIX: Added the missing `generateLeads` function to resolve the import error in `LeadGenerator.tsx`.
/**
 * Generates B2B partnership leads based on provider's profile.
 */
export async function generateLeads(providerInfo: any): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
        You are an expert B2B lead generation specialist.
        Find 5 partnership leads for a ${providerInfo.service_type} professional in ${providerInfo.location} (within a ${providerInfo.target_radius} mile radius).
        Ideal partners are: "${providerInfo.lead_preferences}".
    `;
    const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
        config: { 
            responseMimeType: "application/json", 
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        company_name: { type: Type.STRING, description: "The name of the potential partner company." },
                        website: { type: Type.STRING, description: "The official website URL of the company." },
                        contact_person: { type: Type.STRING, description: "The name of a relevant decision-maker at the company." },
                        role: { type: Type.STRING, description: "The job title or role of the contact person." },
                        email: { type: Type.STRING, description: "The professional email address for the contact person." },
                        phone: { type: Type.STRING, description: "The business phone number for the company or contact." },
                        linkedin_profile: { type: Type.STRING, description: "The URL for the contact person's or company's LinkedIn profile." },
                        rationale: { type: Type.STRING, description: "A brief explanation of why this company is a good partnership fit." },
                        verification_status: { type: Type.STRING, description: "The confidence level of the contact info ('Verified' or 'Likely')." },
                        interest_score: { type: Type.NUMBER, description: "A score from 0-100 indicating the potential partnership value." }
                    },
                    required: ["company_name", "website", "contact_person", "role", "email", "phone", "linkedin_profile", "rationale", "verification_status", "interest_score"]
                }
            }
        }
    });
    return safeJsonParse(aiResponse.text);
}


/**
 * Generates business insights based on performance data.
 */
export async function getBusinessInsights(): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `You are an expert cosmetology business coach with deep knowledge of the beauty industry (including lash, skincare, hair, and aesthetic services) and modern business systems (marketing, automation, client retention, and scaling). Your job is to help beauty professionals achieve their goals by combining beauty industry expertise with business strategy. Always provide advice that is specific, practical, encouraging, and motivational.

Provide a generic but inspiring coaching session for a solo beauty provider. The session should be conversational and encouraging. Structure your response as a JSON object. Don't use any specific numbers or metrics, but focus on common goals and challenges for beauty professionals, like client retention, social media marketing, and pricing strategies.`;

    const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash", contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    greeting: { type: Type.STRING, description: "A warm, personal greeting." },
                    celebration: { type: Type.STRING, description: "A specific point of praise based on a common positive achievement for a beauty pro." },
                    opportunity: { type: Type.STRING, description: "A gentle and constructive observation about a common area for improvement." },
                    action_plan: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: "A catchy title for the action step." },
                                description: { type: Type.STRING, description: "A detailed, practical description of the action step." }
                            },
                            required: ["title", "description"]
                        }
                    },
                    motivation: { type: Type.STRING, description: "A final, encouraging closing statement." }
                },
                required: ["greeting", "celebration", "opportunity", "action_plan", "motivation"]
            }
        }
    });
    return safeJsonParse(aiResponse.text);
}

/**
 * Generates a blog post outline based on a topic.
 */
export async function generateBlogPost(topic: string): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
        You are an expert content writer and SEO specialist for the beauty and wellness industry.
        Generate a comprehensive, engaging, and SEO-friendly blog post outline for the topic: "${topic}".
        The outline should be structured to be easily readable and informative for a typical client.
        Include a catchy title, a brief introduction, three main body sections with bullet points, and a concluding paragraph.
    `;

    const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "A catchy, SEO-friendly title for the blog post."
                    },
                    introduction: {
                        type: Type.STRING,
                        description: "A brief introductory paragraph that hooks the reader and states the post's purpose."
                    },
                    sections: {
                        type: Type.ARRAY,
                        description: "An array of the main sections of the blog post. Should contain 3-4 sections.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                heading: {
                                    type: Type.STRING,
                                    description: "The heading for this section of the blog post."
                                },
                                points: {
                                    type: Type.ARRAY,
                                    description: "An array of bullet points or key ideas to be discussed in this section.",
                                    items: {
                                        type: Type.STRING
                                    }
                                }
                            }
                        }
                    },
                    conclusion: {
                        type: Type.STRING,
                        description: "A concluding paragraph that summarizes the key points and includes a call to action (e.g., 'Book a consultation today!')."
                    }
                },
                required: ["title", "introduction", "sections", "conclusion"]
            }
        }
    });
    return safeJsonParse(aiResponse.text);
}

/**
 * Generates a stock image for a featured service based on a prompt.
 */
export async function generateFeaturedServiceImage(prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: prompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }

    throw new Error("No image was generated by the API.");
}