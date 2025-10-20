
import React, { useState, useEffect, useRef } from 'react';
import { generateBlogPost } from '../services/geminiService';
import Loader from './Loader';

// Define the structure of the generated blog post outline
interface BlogPostOutline {
  title: string;
  introduction: string;
  sections: {
    heading: string;
    points: string[];
  }[];
  conclusion: string;
}

const BlogGenerator: React.FC = () => {
  const [topic, setTopic] = useState("The Benefits of Regular Facials");
  const [outline, setOutline] = useState<BlogPostOutline | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const messageIntervalRef = useRef<number | null>(null);

  const loadingMessages = [
    "Researching blog post ideas...",
    "Structuring the narrative flow...",
    "Drafting key talking points...",
    "Optimizing for reader engagement...",
    "Finalizing the post outline...",
  ];

  useEffect(() => {
    // Logic for cycling through loading messages (copy from Marketing.tsx)
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
    setOutline(null);
    try {
      const generatedOutline = await generateBlogPost(topic);
      setOutline(generatedOutline);
    } catch (e) {
      console.error(e);
      setError("Sorry, the AI couldn't generate a blog post right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cardStyle}>
      <h3 className="font-bold text-xl text-stone-800" style={title3DStyle}>AI Blog Post Generator</h3>
      <p className="text-sm text-stone-600 my-2">
        Enter a topic to generate a complete blog post outline.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="e.g., 'The Benefits of Regular Facials'"
          className="w-full bg-white/50 text-stone-900 rounded-lg border-stone-300 focus:ring-pink-500 focus:border-pink-500 shadow-[0_1px_3px_rgba(10,186,181,0.3)]"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !topic}
          className="text-sm font-semibold text-black bg-pink-400 px-5 py-2.5 rounded-lg hover:bg-pink-500 transition-colors shadow-[0_0_10px_0] shadow-pink-400/50 disabled:bg-stone-300 disabled:cursor-not-allowed disabled:shadow-inner whitespace-nowrap"
        >
          {isLoading ? 'Generating...' : 'Generate Outline'}
        </button>
      </div>

      <div className="mt-6 min-h-[100px]">
        {isLoading && <Loader message={loadingMessage} />}
        {error && <div className="text-center p-10 text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
        
        {outline && (
          <div className="bg-pink-50/50 p-5 rounded-lg border border-pink-200 animate-fade-in space-y-4">
            <h4 className="text-xl font-bold text-pink-800">{outline.title}</h4>
            
            <div>
              <h5 className="font-semibold text-stone-700 mb-1">Introduction</h5>
              <p className="text-sm text-stone-600 whitespace-pre-wrap">{outline.introduction}</p>
            </div>
            
            {outline.sections.map((section, index) => (
              <div key={index}>
                <h5 className="font-semibold text-stone-700 mb-2">{section.heading}</h5>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  {section.points.map((point, pIndex) => (
                    <li key={pIndex} className="text-sm text-stone-600">{point}</li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h5 className="font-semibold text-stone-700 mb-1">Conclusion</h5>
              <p className="text-sm text-stone-600 whitespace-pre-wrap">{outline.conclusion}</p>
            </div>
          </div>
        )}
      </div>
      <style>{`
          @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
              animation: fadeIn 0.5s ease-out forwards;
          }
      `}</style>
    </div>
  );
};

export default BlogGenerator;
