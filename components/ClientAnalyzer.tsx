import React, { useState } from 'react';
import { analyzeClient } from '../services/geminiService';
import { PushIcon } from './icons';
import Loader from './Loader';

type Recommendation = { type: string; title: string; description: string; };
type Upsell = { type: string; title: string; description: string; };
type BookingSuggestion = { service: string; date_time: string; notes: string; };

interface AnalysisResult {
    analysis: {
        observations: string[];
        recommendations: Recommendation[];
        upsells: Upsell[];
        booking_suggestions: BookingSuggestion[];
    }
}

const sampleData: Record<string, { profile: any; image: string; }> = {
    'Esthetician': {
        profile: {
            client_name: 'Sarah Miller',
            skin_hair_fitness: "Noticing fine lines around eyes, dull skin, and some hormonal breakouts on chin.",
            current_service: 'Brightening Facial',
            provider_type: 'Esthetician'
        },
        image: 'https://images.unsplash.com/photo-1512290746436-399748a85f95?w=400&q=80',
    },
    'Hairstylist': {
        profile: {
            client_name: 'Sophia R.',
            skin_hair_fitness: "Blonde balayage, hair feels brassy and dry lately.",
            current_service: 'Haircut',
            provider_type: 'Hairstylist'
        },
        image: 'https://images.unsplash.com/photo-1522338140262-f4639b753a54?w=400&q=80',
    },
    'Injector': {
        profile: {
            client_name: 'Michael B.',
            skin_hair_fitness: "Concerned about deep '11' lines between his brows, says people think he looks angry.",
            current_service: 'Botox',
            provider_type: 'Injector'
        },
        image: 'https://images.unsplash.com/photo-1580281658223-9b93f18ae9ae?w=400&q=80',
    },
    'Medspa': {
        profile: {
            client_name: 'Nicole K.',
            skin_hair_fitness: "Concerned with sun spots from years of living in California and overall skin texture.",
            current_service: 'IPL Photofacial Consultation',
            provider_type: 'Medspa'
        },
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80',
    },
     'Barber': {
        profile: {
            client_name: 'Daniel K.',
            skin_hair_fitness: "Wants a sharp skin fade, but has a difficult cowlick on the crown.",
            current_service: 'Haircut',
            provider_type: 'Barber'
        },
        image: 'https://images.unsplash.com/photo-1599329272183-66b96238b9dd?w=400&q=80',
    },
    'Gym Instructor': {
        profile: {
            client_name: 'Emily T.',
            skin_hair_fitness: "Wants to improve squat form and overall lower body strength.",
            current_service: 'Personal Training Session',
            provider_type: 'Gym Instructor'
        },
        image: 'https://images.unsplash.com/photo-1517836357463-d2576926399f?w=400&q=80',
    },
};


const ClientAnalyzer: React.FC = () => {
    const [clientProfile, setClientProfile] = useState(sampleData['Injector'].profile);
    const [analysisData, setAnalysisData] = useState({ photo_type: 'skin' });
    const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(sampleData['Injector'].image);
    const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
    const [results, setResults] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const title3DStyle = { textShadow: '0 1px 1px rgba(255,255,255,0.7), 0 -1px 1px rgba(0,0,0,0.15)' };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        
        if (id in clientProfile) {
             if (id === 'provider_type') {
                const selectedData = sampleData[value as keyof typeof sampleData] || sampleData['Esthetician'];
                setClientProfile(selectedData.profile);
                setUploadedImagePreview(selectedData.image);
                setUploadedImageFile(null);
                setResults(null);
            } else {
                setClientProfile(prev => ({ ...prev, [id]: value }));
            }
        } else {
            setAnalysisData(prev => ({ ...prev, [id]: value }));
        }
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert("File is too large. Please upload an image under 10MB.");
            return;
        }

        setUploadedImageFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedImagePreview(reader.result as string);
            setResults(null);
        };
        reader.readAsDataURL(file);
    };

    const handleIntakeFormUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const injectorData = sampleData['Injector'];
        setClientProfile(injectorData.profile);
        setUploadedImagePreview(injectorData.image);
        setUploadedImageFile(null);
        setResults(null);
    };

    const handleAnalyze = async () => {
        if (!uploadedImageFile && !uploadedImagePreview?.startsWith('https')) {
            setError("Please upload a client photo to analyze.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResults(null);

        try {
            let fileToAnalyze: File;

            if (uploadedImageFile) {
                fileToAnalyze = uploadedImageFile;
            } else {
                const response = await fetch(uploadedImagePreview!);
                const blob = await response.blob();
                fileToAnalyze = new File([blob], "sample-image.jpg", { type: blob.type });
            }

            const analysisResult = await analyzeClient(clientProfile, fileToAnalyze);
            setResults(analysisResult);
        } catch (e) {
            console.error(e);
            setError("Sorry, something went wrong during the analysis. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getIconForType = (type: string) => {
        const typeLower = type.toLowerCase();
        if (typeLower.includes('service') || typeLower.includes('technique') || typeLower.includes('exercise') || typeLower.includes('program')) return '✨';
        if (typeLower.includes('product')) return '🧴';
        if (typeLower.includes('wellness')) return '💖';
        if (typeLower.includes('upgrade')) return '🚀';
        if (typeLower.includes('booking')) return '📅';
        return '⭐';
    };
    
    const getDynamicLabelAndPlaceholder = (providerType: string): { label: string; placeholder: string } => {
        switch (providerType) {
            case 'Hairstylist': return { label: 'Hair Type & Concerns', placeholder: 'e.g., Fine, color-treated hair, wants more volume.' };
            case 'Esthetician': return { label: 'Skin Type & Concerns', placeholder: 'e.g., Combination skin, concerned with fine lines.' };
            case 'Barber': return { label: 'Hair/Beard Type & Style', placeholder: 'e.g., Thick, wavy hair, looking for a clean fade.' };
            case 'Gym Instructor': return { label: 'Fitness Level & Goals', placeholder: 'e.g., Beginner, wants to build strength.' };
            case 'Pilates Instructor': return { label: 'Experience Level & Goals', placeholder: 'e.g., Intermediate, wants to improve core stability.' };
            case 'Medspa': return { label: 'Primary Concerns', placeholder: 'e.g., Concerned with sun spots and skin texture.' };
            case 'Injector': return { label: 'Treatment Goals', placeholder: 'e.g., Wants to soften forehead wrinkles and add lip volume.' };
            default: return { label: 'Client Details (Skin/Hair/Fitness)', placeholder: 'Describe client\'s condition, type, and goals.' };
        }
    };
    
    const { label: dynamicLabel, placeholder: dynamicPlaceholder } = getDynamicLabelAndPlaceholder(clientProfile.provider_type);

    const cardStyle = "bg-white/70 p-6 rounded-xl border border-pink-200 backdrop-blur-sm";
    const labelStyle = "block text-sm font-medium text-stone-600 mb-2";
    const inputStyle = "w-full bg-white/50 text-stone-900 rounded-lg border-stone-300 focus:ring-pink-500 focus:border-pink-500 shadow-[0_1px_3px_rgba(10,186,181,0.3)]";
    const providerTypes = ['Esthetician', 'Hairstylist', 'Injector', 'Medspa', 'Barber', 'Gym Instructor'];
    const photoTypes = [{value: 'skin', label: 'Skin'}, {value: 'hair', label: 'Hair'}, {value: 'posture/fitness', label: 'Posture / Fitness'}];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className={`space-y-6 ${cardStyle}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-xl text-stone-800" style={title3DStyle}>AI Client Analyzer</h3>
                        <p className="text-stone-600 mt-1">Get instant insights from client photos and intake forms.</p>
                    </div>
                </div>
                
                <label htmlFor="intake-form-upload" className="block w-full cursor-pointer text-center text-pink-600 font-semibold border-2 border-dashed border-pink-300 rounded-lg px-6 py-3 hover:bg-pink-50 hover:border-pink-400 transition-colors">
                    <span className="flex items-center justify-center gap-2">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Upload Intake Form & Auto-Fill</span>
                    </span>
                    <input id="intake-form-upload" type="file" className="hidden" onChange={handleIntakeFormUpload} accept=".txt,.png,.jpg,.jpeg" />
                </label>
                
                <div className="space-y-5">
                    {/* Image Upload */}
                    <div>
                        <label className={labelStyle}>Client Photo</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-stone-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {uploadedImagePreview ? (
                                    <img src={uploadedImagePreview} alt="Client preview" className="mx-auto h-32 w-32 object-cover rounded-md" />
                                ) : (
                                    <svg className="mx-auto h-12 w-12 text-stone-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                                <div className="flex text-sm text-stone-600 justify-center">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none">
                                        <span>Upload a photo</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/png, image/jpeg" />
                                    </label>
                                </div>
                                <p className="text-xs text-stone-500">PNG, JPG up to 10MB</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="provider_type" className={labelStyle}>Your Profession</label>
                            <select id="provider_type" value={clientProfile.provider_type} onChange={handleInputChange} className={inputStyle}>
                                {providerTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="photo_type" className={labelStyle}>Photo Type</label>
                            <select id="photo_type" value={analysisData.photo_type} onChange={handleInputChange} className={inputStyle}>
                                {photoTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="client_name" className={labelStyle}>Client Name</label>
                        <input id="client_name" type="text" value={clientProfile.client_name} onChange={handleInputChange} className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="skin_hair_fitness" className={labelStyle}>{dynamicLabel}</label>
                        <textarea id="skin_hair_fitness" value={clientProfile.skin_hair_fitness} onChange={handleInputChange} className={inputStyle} rows={2} placeholder={dynamicPlaceholder}></textarea>
                    </div>
                    <div>
                        <label htmlFor="current_service" className={labelStyle}>Current Service (Optional)</label>
                        <input id="current_service" type="text" value={clientProfile.current_service} onChange={handleInputChange} className={inputStyle} />
                    </div>
                </div>

                <button 
                    onClick={handleAnalyze}
                    disabled={isLoading || !uploadedImagePreview}
                    className="w-full text-sm font-semibold text-black bg-pink-400 px-5 py-3 rounded-lg hover:bg-pink-500 transition-colors shadow-[0_0_10px_0] shadow-pink-400/50 disabled:bg-stone-300 disabled:cursor-not-allowed disabled:shadow-inner"
                >
                    {isLoading ? 'Analyzing...' : 'Analyze Client'}
                </button>
            </div>
            
            <div className="space-y-6">
                 <div className="min-h-[200px]">
                    {isLoading && <Loader message="Analyzing client photo and profile..." />}
                    {error && <div className={`${cardStyle} text-center p-10 text-red-600 bg-red-50 border border-red-200`}>{error}</div>}
                    {!isLoading && !error && !results && (
                        <div className={`${cardStyle} text-center p-10 text-stone-500`}>
                            Analysis results will appear here.
                        </div>
                    )}
                    {results?.analysis && (
                        <div className="space-y-6">
                            <div className={cardStyle}>
                                <h3 className="font-bold text-xl text-stone-800 mb-4" style={title3DStyle}>AI Observations</h3>
                                <ul className="list-disc list-inside space-y-2 text-stone-700 text-sm mb-4">
                                    {results.analysis.observations.map((obs, i) => <li key={i}>{obs}</li>)}
                                </ul>
                            </div>

                            <div className={cardStyle}>
                                <h3 className="font-bold text-xl text-stone-800 mb-4" style={title3DStyle}>Smart Upsells</h3>
                                {results.analysis.upsells.map((item, i) => (
                                    <div key={i} className="flex items-start gap-4 bg-pink-50 p-4 rounded-lg border border-pink-200 mb-3">
                                        <div className="text-3xl mt-1">{getIconForType(item.type)}</div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-md text-pink-800">{item.title}</h4>
                                            <p className="text-sm text-stone-700 mt-1">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className={cardStyle}>
                                <h3 className="font-bold text-xl text-stone-800 mb-4" style={title3DStyle}>Personalized Recommendations</h3>
                                 {results.analysis.recommendations.map((item, i) => (
                                    <div key={i} className="flex items-start gap-4 bg-pink-50 p-4 rounded-lg border border-pink-200 mb-3">
                                        <div className="text-3xl mt-1">{getIconForType(item.type)}</div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-md text-pink-800">{item.title}</h4>
                                            <p className="text-sm text-stone-700 mt-1">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                             <div className={cardStyle}>
                                <h3 className="font-bold text-xl text-stone-800 mb-4" style={title3DStyle}>Booking Suggestions</h3>
                                 {results.analysis.booking_suggestions.map((item, i) => (
                                    <div key={i} className="flex items-start gap-4 bg-pink-50 p-4 rounded-lg border border-pink-200 mb-3">
                                        <div className="text-3xl mt-1">{getIconForType('booking')}</div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-md text-pink-800">{item.service} - <span className="font-medium opacity-80">{item.date_time}</span></h4>
                                            <p className="text-sm text-stone-700 mt-1">{item.notes}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default ClientAnalyzer;