
import React, { useState, useEffect } from 'react';
import { getBusinessInsights } from '../services/geminiService';
import Loader from './Loader';

// --- NEW TYPE DEFINITION ---
interface CoachingSession {
  greeting: string;
  celebration: string;
  opportunity: string;
  action_plan: { title: string; description: string; }[];
  motivation: string;
}

// --- NEW ICONS ---
const CelebrationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688 0-1.25-.562-1.25-1.25s.562-1.25 1.25-1.25m4.32 0c.688 0 1.25.562 1.25 1.25s-.562 1.25-1.25 1.25m-2.16-4.32a.375.375 0 0 1 .375-.375h1.08a.375.375 0 0 1 .375.375v1.08a.375.375 0 0 1-.375.375h-1.08a.375.375 0 0 1-.375-.375V11.52zM12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z" /></svg>;
const OpportunityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v.01M8.465 6.31A9 9 0 1 0 15.532 17.69A9 9 0 0 0 8.468 6.31zM11.25 9.75A.75.75 0 0 1 12 9h.008a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9.75z" /></svg>;
const MotivationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>;
const ActionCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;

const BusinessCoach: React.FC = () => {
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
    const [insights, setInsights] = useState<CoachingSession | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateInsights = async () => {
        setIsGeneratingInsights(true);
        setInsights(null);
        setError(null);
        
        try {
            const generatedInsights = await getBusinessInsights();
            setInsights(generatedInsights);
        } catch(e) {
            console.error(e);
            setError("Couldn't connect to the AI to generate insights. Please try again later.");
        } finally {
            setIsGeneratingInsights(false);
        }
    };
    
    useEffect(() => {
        generateInsights();
    }, []); 

    const cardStyle = "bg-white/70 p-6 rounded-xl border border-pink-200 backdrop-blur-sm";
    const title3DStyle = { textShadow: '0 1px 1px rgba(255,255,255,0.7), 0 -1px 1px rgba(0,0,0,0.15)' };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* AI Coaching Session */}
            <div className="space-y-6">
                 <h3 className="font-bold text-xl text-stone-800 text-center" style={title3DStyle}>Your Weekly Coaching Session</h3>
                 {isGeneratingInsights && <Loader message="Your AI coach is analyzing your business data..." />}
                 {error && <div className="text-center p-4 text-orange-600 bg-orange-50 border border-orange-200 rounded-lg text-sm">{error}</div>}
                 {insights && (
                     <div className="space-y-6 animate-fade-in">
                        {/* Greeting */}
                        <p className="text-center text-lg text-stone-700">{insights.greeting}</p>

                        {/* Celebration */}
                        <div className={`${cardStyle} flex items-start gap-4 bg-green-50/70 border-green-200`}>
                            <CelebrationIcon />
                            <div>
                                <h4 className="font-bold text-lg text-green-800">Let's Celebrate This!</h4>
                                <p className="text-stone-700 mt-1">{insights.celebration}</p>
                            </div>
                        </div>

                        {/* Opportunity */}
                        <div className={`${cardStyle} flex items-start gap-4 bg-yellow-50/70 border-yellow-200`}>
                            <OpportunityIcon />
                            <div>
                                <h4 className="font-bold text-lg text-yellow-800">Here's an Opportunity</h4>
                                <p className="text-stone-700 mt-1">{insights.opportunity}</p>
                            </div>
                        </div>
                        
                        {/* Action Plan */}
                        <div className={cardStyle}>
                            <h4 className="font-bold text-lg text-stone-800 mb-4">Your Action Plan for This Week</h4>
                            <div className="space-y-4">
                                {insights.action_plan.map((item, index) => (
                                    <div key={index} className="flex items-start gap-4 bg-pink-50/50 p-4 rounded-lg border border-pink-200">
                                        <ActionCheckIcon />
                                        <div>
                                            <h5 className="font-bold text-md text-pink-700">{item.title}</h5>
                                            <p className="text-sm text-stone-600 mt-1">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Motivation */}
                        <div className={`${cardStyle} flex items-start gap-4 bg-rose-50/70 border-rose-200`}>
                            <MotivationIcon />
                            <div>
                                <h4 className="font-bold text-lg text-rose-800">A Quick Reminder...</h4>
                                <p className="text-stone-700 mt-1 italic">{insights.motivation}</p>
                            </div>
                        </div>
                     </div>
                 )}
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default BusinessCoach;
