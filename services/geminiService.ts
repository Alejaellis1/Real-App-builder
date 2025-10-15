
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// This is the central Gemini API client.
// IMPORTANT: For this to work, the process.env.API_KEY environment variable must be set.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Safely parses a JSON string, cleaning up markdown code fences if present.
 * @param jsonString The raw string from the AI, which may contain JSON.
 * @returns The parsed JSON object.
 * @throws An error if parsing fails.
 */
const safeJsonParse = (jsonString: string): any => {
    // The AI may wrap the JSON in ```json ... ```. We need to remove this.
    const sanitizedString = jsonString.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    try {
        return JSON.parse(sanitizedString);
    } catch (error) {
        console.error("Failed to parse JSON response from AI:", sanitizedString);
        // Re-throw a more informative error
        throw new Error("The AI returned a response that was not valid JSON.");
    }
};

// Helper function to convert a File object to a base64 GenerativePart
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            reject(new Error('Failed to read file as base64 string.'));
        }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
  const data = await base64EncodedDataPromise;
  return {
    inlineData: { data, mimeType: file.type },
  };
};


/**
 * Generates upsells and recommendations based on client form data.
 */
export async function getClientRecommendations(formData: any): Promise<any> {
  const prompt = `
    You are an expert ${formData.profession}. A client named ${formData.clientName} is coming in for a "${formData.currentService}".
    - Their concerns are: ${formData.concerns}
    - Their past services include: ${formData.pastServices}
    - Their feedback is: ${formData.feedback}

    Based on this, generate:
    1. Three "Smart Upsells" as an array of objects that could be added to their current "${formData.currentService}" session.
    2. Three "Personalized Recommendations" as an array of objects for future services, products, or consultations.

    Each object in the arrays should have a 'title' and a 'description'. The title should be catchy and the description concise and client-friendly. Add a 'type' field to each object (e.g., 'upgrade', 'service', 'product', 'consultation').
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          upsells: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  return safeJsonParse(response.text);
}


/**
 * Analyzes a client photo and profile to generate insights.
 */
export async function analyzeClient(profile: any, imageFile: File): Promise<any> {
    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = {
        text: `
          You are an expert ${profile.provider_type}.
          Analyze the attached client photo and the following client profile:
          - Name: ${profile.client_name}
          - Concerns: ${profile.skin_hair_fitness}
          - Current Service: ${profile.current_service}

          Provide a JSON response with:
          1. 'observations': An array of 3 brief, professional observations from the photo.
          2. 'recommendations': An array of 2 objects, each with a 'type', 'title', and 'description' for future services/products.
          3. 'upsells': An array of 1-2 objects, each with a 'type', 'title', and 'description' for potential upsells for their current service.
          4. 'booking_suggestions': An array of 1 object with 'service', 'date_time', and 'notes' for their next appointment.
        `
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                   observations: { type: Type.ARRAY, items: { type: Type.STRING } },
                   recommendations: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING },
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                            }
                        }
                   },
                   upsells: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING },
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                            }
                        }
                   },
                   booking_suggestions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                service: { type: Type.STRING },
                                date_time: { type: Type.STRING },
                                notes: { type: Type.STRING },
                            }
                        }
                   }
                }
            }
        }
    });

    return { analysis: safeJsonParse(response.text) };
}


/**
 * Generates marketing content based on a prompt and content type.
 */
export async function generateMarketingContent(prompt: string, contentType: string): Promise<any> {
    const fullPrompt = `
        You are a marketing expert for a solo service provider in the beauty/wellness industry.
        Generate marketing content for the following purpose: "${prompt}".
        The specific format I need is a "${contentType}".

        Please provide a JSON response with an array of objects. Each object should represent a different marketing idea and contain:
        1. 'type': A string indicating the content type (e.g., 'Instagram Caption', 'Promotional Email').
        2. 'headline': A catchy headline or subject line.
        3. 'body': The full text content for the marketing piece.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING },
                        headline: { type: Type.STRING },
                        body: { type: Type.STRING },
                    }
                }
            },
            thinkingConfig: { thinkingBudget: 0 },
        }
    });

    return safeJsonParse(response.text);
}


/**
 * Generates business insights based on performance data.
 */
export async function getBusinessInsights(data: any): Promise<string[]> {
    const prompt = `
        You are an expert business coach for a solo service provider in the beauty/wellness industry.
        Analyze the following business data:
        - Weekly Bookings: ${data.weekly_bookings.value} (trend: ${data.weekly_bookings.trend * 100}%)
        - Monthly Revenue: $${data.monthly_revenue.value} (trend: ${data.monthly_revenue.trend * 100}%)
        - Client Retention Rate: ${data.client_retention.value * 100}%
        - Top Selling Service: ${data.top_services[0]}

        Based on this data, provide an array of 3 actionable, concise, and encouraging insights. Each insight should be a string.
        Focus on identifying the biggest opportunity or risk and suggest a specific action the provider can take.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });
    
    return safeJsonParse(response.text);
}


/**
 * Generates B2B partnership leads for a service provider.
 */
export async function generateLeads(providerInfo: any): Promise<any> {
    const prompt = `
        You are a business development expert for a solo service provider.
        My business profile is:
        - Service Type: ${providerInfo.service_type}
        - Location: ${providerInfo.location}
        - Ideal Client Profile: ${providerInfo.lead_preferences}

        Based on this, find 5 potential B2B leads in a ${providerInfo.target_radius}-mile radius of my location. These leads should be complementary businesses that I could partner with for cross-promotion or referrals.

        For each lead, provide:
        - A realistic, but fictional, business name, phone number, and email.
        - One or two social media handles (platform and handle).
        - A brief profile description.
        - A clear rationale for why they are a good lead for me to contact.
        - An interest score from 70-100 indicating the partnership potential.
        - The likely source where you would find this information (e.g., 'Google Maps', 'Yelp', 'Instagram').
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        phone: { type: Type.STRING },
                        email: { type: Type.STRING },
                        social_media: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    platform: { type: Type.STRING },
                                    handle: { type: Type.STRING }
                                }
                            }
                        },
                        profile_description: { type: Type.STRING },
                        rationale: { type: Type.STRING },
                        interest_score: { type: Type.INTEGER },
                        source: { type: Type.STRING }
                    },
                    required: ["name", "phone", "email", "social_media", "profile_description", "rationale", "interest_score", "source"]
                }
            }
        }
    });

    return safeJsonParse(response.text);
}