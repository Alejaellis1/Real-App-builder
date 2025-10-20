
import React, { useState, useEffect, useRef } from 'react';
import { generateMarketingContent } from '../services/geminiService';
import Loader from './Loader';
import BlogGenerator from './BlogGenerator';

type MarketingIdea = {
  type: string;
  headline: string;
  body: string;
};

const Marketing: React.FC = () => {
  const [prompt, setPrompt] = useState("a last-minute opening this Friday");
  const [contentType, setContentType] = useState("Instagram Caption");
  const [results, setResults] = useState<MarketingIdea[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const messageIntervalRef = useRef<number | null>(null);
  
  const loadingMessages = [
    "Brainstorming catchy headlines...",
    "Analyzing your target audience...",
    "Crafting compelling content...",
    "Checking for brand voice consistency...",
    "Finalizing creative ideas...",
  ];

  useEffect(() => {
    if (isLoading) {
      let index = 0;
      setLoadingMessage(loadingMessages[index]);
      messageIntervalRef.current = window.setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[index]);
      }, 1500);
    } else {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
      }
    }
    return () => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
    };
  }, [isLoading]);
  
  const cardStyle = "bg-white/70 p-6 rounded-xl border border-pink-200 backdrop-blur-sm";
  const title3DStyle = { textShadow: '0 1px 1px rgba(255,255,255,0.7), 0 -1px 1px rgba(0,0,0,0.15)' };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    try {
      const generatedResults = await generateMarketingContent(prompt, contentType);
      setResults(generatedResults);
    } catch (e) {
      console.error(e);
      setError("Sorry, something went wrong while generating content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className={cardStyle}>
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-bold text-xl text-stone-800" style={title3DStyle}>AI Content Generator</h3>
                <p className="text-sm text-stone-600 my-2">
                  Generate captions, emails, and more for your business.
                </p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <textarea
            rows={2}
            placeholder="e.g., 'a last-minute opening this Friday'"
            className="w-full bg-white/50 text-stone-900 rounded-lg border-stone-300 focus:ring-pink-500 focus:border-pink-500 md:col-span-2 shadow-[0_1px_3px_rgba(10,186,181,0.3)]"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          ></textarea>
          <select 
            className="w-full bg-white/50 text-stone-900 rounded-lg border-stone-300 focus:ring-pink-500 focus:border-pink-500 h-full shadow-[0_1px_3px_rgba(10,186,181,0.3)]"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
          >
            <option>Instagram Caption</option>
            <option>Promotional Email</option>
            <option>Client Reminder Text</option>
            <option>Email Subject Line</option>
          </select>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isLoading || !prompt}
          className="text-sm font-semibold text-black bg-pink-400 px-5 py-2.5 rounded-lg hover:bg-pink-500 transition-colors shadow-[0_0_10px_0] shadow-pink-400/50 disabled:bg-stone-300 disabled:cursor-not-allowed disabled:shadow-inner"
        >
          {isLoading ? 'Generating...' : 'Generate Content'}
        </button>
      </div>
      
      <div className="min-h-[120px]">
        {isLoading && <Loader message={loadingMessage} />}
        {error && <div className={`${cardStyle} text-center p-10 text-red-600 bg-red-50 border border-red-200`}>{error}</div>}
        {!isLoading && !error && !results && (
            <div className={`${cardStyle} text-center p-10 text-stone-500`}>
                Generated content will appear here.
            </div>
        )}
        {results && (
            <div className={cardStyle}>
                <h3 className="font-bold text-xl mb-4 text-stone-800" style={title3DStyle}>Generated Ideas</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {results.map((idea, index) => (
                    <div key={index} className="bg-pink-50 p-5 rounded-lg border border-pink-200 flex flex-col justify-between">
                        <div>
                        <h4 className="font-bold text-md text-pink-700">{idea.headline}</h4>
                        <p className="text-sm text-stone-600 mt-2 whitespace-pre-wrap">
                            {idea.body}
                        </p>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      <div className="border-t border-pink-200/60 !my-6" />
      
      <BlogGenerator />

    </div>
  );
};

export default Marketing;
