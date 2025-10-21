import React, { useState } from 'react';
import { getClientRecommendations } from '../services/geminiService';
import Loader from './Loader';

// Types for suggestions
type Suggestion = {
  type: string;
  title: string;
  description: string;
};

interface GenerationResult {
  recommendations: Suggestion[];
  upsells: Suggestion[];
}

// --- NEW ICONS ---
const SparklesIcon = () => (
    <div className="w-10 h-10 relative flex-shrink-0">
        <svg className="absolute top-0 left-0 w-8 h-8" viewBox="0 0 32 32" fill="none">
            <path d="M16 0L19.314 12.686L32 16L19.314 19.314L16 32L12.686 19.314L0 16L12.686 12.686L16 0Z" fill="#A855F7"/>
        </svg>
        <svg className="absolute bottom-1 right-1 w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M8 0L9.657 6.343L16 8L9.657 9.657L8 16L6.343 9.657L0 8L6.343 6.343L8 0Z" fill="#C084FC"/>
        </svg>
    </div>
);

const SerumBottleIcon = () => (
    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M22 11V10C22 9.44772 21.5523 9 21 9H11C10.4477 9 10 9.44772 10 10V11H22Z" fill="#EAD9D5"/>
            <path d="M17 9V5H15V9H17Z" fill="#EAD9D5"/>
            <path d="M18 5H14V4C14 3.44772 14.4477 3 15 3H17C17.5523 3 18 3.44772 18 4V5Z" fill="#EAD9D5"/>
            <rect x="9" y="11" width="14" height="18" rx="3" fill="#F3EBE9"/>
        </svg>
    </div>
);

const StarIcon = () => (
    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#A855F7">
            <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"/>
        </svg>
    </div>
);


// Reusable icon logic
const getIconForType = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('product')) return <SerumBottleIcon />;
    if (typeLower.includes('consultation')) return <StarIcon />;
    return <SparklesIcon />;
};

// Reusable card for displaying suggestions
const SuggestionCard: React.FC<{ item: Suggestion }> = ({ item }) => (
    <div className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-pink-200 shadow-sm">
        <div>{getIconForType(item.type)}</div>
        <div className="flex-1">
            <h4 className="font-bold text-md text-pink-600">{item.title}</h4>
            <p className="text-sm text-stone-700 mt-1">{item.description}</p>
        </div>
    </div>
);

// Main Component
const Recommendations: React.FC = () => {
    const [formData, setFormData] = useState({
        clientName: 'Jennifer A.',
        profession: 'Injector',
        concerns: 'Forehead wrinkles and loss of volume in cheeks.',
        currentService: 'Botox Consultation',
        pastServices: 'Has had light chemical peels before, but never injectables.',
        feedback: 'Nervous about looking "frozen", wants a natural result.'
    });

    const [suggestions, setSuggestions] = useState<GenerationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    };
    
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Populate the form with data parsed from a sample intake form
        setFormData({
             clientName: 'Olivia Wilde',
             profession: 'Medspa',
             concerns: "Sun damage and uneven skin tone from living in a sunny climate. Wants to address texture and pigmentation.",
             currentService: 'IPL Photofacial',
             pastServices: "Regular facials, has tried microneedling once.",
             feedback: "Looking for more impactful, long-term results and a comprehensive skincare plan."
        });
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setSuggestions(null);

        try {
            const result = await getClientRecommendations(formData);
            setSuggestions(result);
        } catch(e) {
            console.error(e);
            setError("Sorry, something went wrong while generating suggestions. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const cardStyle = "bg-white/70 p-6 rounded-xl border border-pink-200 backdrop-blur-sm";
    const labelStyle = "block text-sm font-medium text-stone-600 mb-2";
    const inputStyle = "w-full bg-white/50 text-stone-900 rounded-lg border-stone-300 focus:ring-pink-500 focus:border-pink-500 shadow-[0_1px_3px_rgba(10,186,181,0.3)]";
    const title3DStyle = { textShadow: '0 1px 1px rgba(255,255,255,0.7), 0 -1px 1px rgba(0,0,0,0.15)' };
    const providerTypes = ['Esthetician', 'Hairstylist', 'Injector', 'Medspa', 'Barber', 'Gym Instructor'];

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className={cardStyle}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-bold text-xl text-stone-800" style={title3DStyle}>Client Recommendations AI</h3>
                        <p className="text-sm text-stone-600 mt-1">
                          Fill out the form or upload an intake form to generate suggestions.
                        </p>
                    </div>
                </div>

                <label htmlFor="form-upload" className="block w-full cursor-pointer text-center text-pink-600 font-semibold border-2 border-dashed border-pink-300 rounded-lg px-6 py-3 hover:bg-pink-50 hover:border-pink-400 transition-colors mb-6">
                    <span className="flex items-center justify-center gap-2">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Upload Intake Form & Auto-Fill</span>
                    </span>
                    <input id="form-upload" type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.png,.jpg,.jpeg" />
                </label>

                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="clientName" className={labelStyle}>Client Name</label>
                            <input id="clientName" type="text" value={formData.clientName} onChange={handleInputChange} className={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="profession" className={labelStyle}>Your Profession</label>
                            <select id="profession" value={formData.profession} onChange={handleInputChange} className={inputStyle}>
                                {providerTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="concerns" className={labelStyle}>Skin Type & Concerns</label>
                        <textarea id="concerns" value={formData.concerns} onChange={handleInputChange} className={inputStyle} rows={3}></textarea>
                    </div>
                    <div>
                        <label htmlFor="currentService" className={labelStyle}>Current Service Being Booked</label>
                        <input id="currentService" type="text" value={formData.currentService} onChange={handleInputChange} className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="pastServices" className={labelStyle}>Past Services</label>
                        <textarea id="pastServices" value={formData.pastServices} onChange={handleInputChange} className={inputStyle} rows={2}></textarea>
                    </div>
                     <div>
                        <label htmlFor="feedback" className={labelStyle}>Preferences & Feedback</label>
                        <textarea id="feedback" value={formData.feedback} onChange={handleInputChange} className={inputStyle} rows={3}></textarea>
                    </div>
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="mt-6 w-full text-lg font-semibold text-black bg-pink-400 py-3 rounded-lg hover:bg-pink-500 transition-colors shadow-[0_0_10px_0] shadow-pink-400/50 disabled:bg-stone-300 disabled:cursor-not-allowed disabled:shadow-inner"
                >
                    {isLoading ? 'Generating...' : 'Generate Suggestions'}
                </button>
            </div>
            
            <div className="min-h-[120px]">
                {isLoading && <Loader message="Analyzing client profile for opportunities..." />}
                {error && <div className={`${cardStyle} text-center p-10 text-red-600 bg-red-50 border border-red-200`}>{error}</div>}
                {!isLoading && !error && !suggestions && (
                    <div className={`${cardStyle} flex items-center justify-center p-10`}>
                        <p className="text-stone-500">Suggestions will appear here.</p>
                    </div>
                )}
                {suggestions && (
                     <div className="space-y-8">
                        <div className={cardStyle}>
                            <h3 className="text-xl font-bold text-stone-800 mb-4">Smart Upsells for '{formData.currentService}'</h3>
                            <div className="space-y-4">
                                {suggestions.upsells.map((item, i) => <SuggestionCard key={`upsell-${i}`} item={item} />)}
                            </div>
                        </div>
                        <div className={cardStyle}>
                            <h3 className="text-xl font-bold text-stone-800 mb-4">Personalized Recommendations</h3>
                            <div className="space-y-4">
                                {suggestions.recommendations.map((item, i) => <SuggestionCard key={`rec-${i}`} item={item} />)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recommendations;