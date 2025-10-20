import React, {useState, useRef, useEffect} from 'react';
import AppPreview from './ResultDisplay';
import type { DesignConfig, ContentType, GalleryItemType, NavItem, GalleryItem } from '../App';
import MediaEditorModal from './MediaEditorModal';
import { generateFeaturedServiceImage } from '../services/geminiService';

interface DesignProps {
  config: DesignConfig;
  setConfig: React.Dispatch<React.SetStateAction<DesignConfig>>;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const SparkleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.25 21.75l-.648-1.178a2.625 2.625 0 00-1.7-1.7L12.75 18l1.178-.648a2.625 2.625 0 001.7-1.7L16.25 15l.648 1.178a2.625 2.625 0 001.7 1.7L20.25 18l-1.178.648a2.625 2.625 0 00-1.7 1.7z" />
    </svg>
);

// FIX: Refactored Tooltip to use React.FC, which correctly handles 'children' and 'key' props,
// resolving obscure TypeScript errors.
// FIX: Added 'children' to TooltipProps. In modern versions of React's TypeScript types,
// React.FC no longer implicitly adds 'children' to a component's props. It must be
// declared explicitly to resolve type errors when passing children to the component.
type TooltipProps = {
  text: string;
  className?: string;
  children: React.ReactNode;
};

const Tooltip: React.FC<TooltipProps> = ({ text, children, className }) => (
    <div className={`relative group ${className || ''}`}>
        {children}
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs
                         bg-stone-800 text-white text-xs rounded-md py-1.5 px-3
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 shadow-lg`}>
        {text}
        </div>
    </div>
);


const themes = {
  'Wellness': {
    primaryColor: '#D8A7B1',
    backgroundColor: '#FDF7F5',
    textColor: '#5D5C61',
    accentColor1: '#D8A7B1',
    accentColor2: '#BFA3A8',
    accentColor3: '#F4E9E6',
    fontFamily: 'Poppins',
  },
  'CyberGlow': {
    primaryColor: '#FF00C7',
    backgroundColor: '#0A001A',
    textColor: '#C0B8F0',
    accentColor1: '#00FFFF',
    accentColor2: '#7100FF',
    accentColor3: '#2F0B5A',
    fontFamily: 'VT323',
  },
  'Minimalist': {
    primaryColor: '#1F2937', // Dark Gray
    backgroundColor: '#F9FAFB', // Light Gray
    textColor: '#374151', // Medium Gray
    accentColor1: '#D1D5DB', // Lighter Gray for borders
    accentColor2: '#6B7280', // Medium-light Gray for secondary text
    accentColor3: '#E5E7EB', // Faint Gray for card backgrounds
    fontFamily: 'Montserrat',
  },
  'Vibrant': {
    primaryColor: '#EC4899', // Pink
    backgroundColor: '#FDF2F8', // Light Pink
    textColor: '#831843', // Dark Pink
    accentColor1: '#D946EF', // Fuchsia
    accentColor2: '#F472B6', // Lighter Pink
    accentColor3: '#FCE7F3', // Lightest Pink
    fontFamily: 'Poppins',
  },
  'Oceanic': {
    primaryColor: '#0E7490', // Teal
    backgroundColor: '#F0FDFA', // Light Cyan
    textColor: '#155E75', // Dark Cyan
    accentColor1: '#06B6D4', // Bright Cyan
    accentColor2: '#67E8F9', // Lighter Cyan
    accentColor3: '#CFFAFE', // Lightest Cyan
    fontFamily: 'Comfortaa'
  }
};

const buttonShapeLabels: Record<'rounded-lg' | 'rounded-md' | 'rounded-full', string> = {
    'rounded-lg': 'Square',
    'rounded-md': 'Soft',
    'rounded-full': 'Pill',
};


const Design: React.FC<DesignProps> = ({ config, setConfig }) => {
    const [newGalleryUrl, setNewGalleryUrl] = useState('');
    const [newTestimonial, setNewTestimonial] = useState({ author: '', text: '' });
    const [errors, setErrors] = useState<Partial<Record<keyof DesignConfig, string>>>({});
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [fileToEdit, setFileToEdit] = useState<File | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    const handleConfigChange = (field: keyof Omit<DesignConfig, 'navItems' | 'galleryItems' | 'testimonials'>, value: string) => {
        // Update the config state immediately for a responsive UI
        setConfig(prev => ({ ...prev, [field]: value }));
    
        // Validate the new value and update the errors state
        let error: string | null = null;
        const textLimits: Partial<Record<keyof DesignConfig, number>> = {
            appName: 30,
            heroTitle: 50,
            homeTestimonialsTitle: 50,
            homeGalleryTitle: 50,
            homeBlogTitle: 50,
            servicesPageTitle: 50,
            galleryPageTitle: 50,
            blogPageTitle: 50,
            contactPageTitle: 50,
            featuredServiceTitle: 50,
            featuredServiceName: 50,
            featuredServicePrice: 20,
            featuredServiceDescription: 200,
        };
    
        if (field in textLimits && value.length > textLimits[field]!) {
            error = `Cannot exceed ${textLimits[field]} characters.`;
        } else if (['logoUrl', 'heroImageUrl', 'bookingLink', 'featuredServiceImageUrl'].includes(field)) {
            if (value && !/^(https?:\/\/|data:image)/i.test(value)) {
                try {
                    new URL(value); // This will throw an error if the URL is invalid
                } catch {
                    error = 'Please enter a valid URL (e.g., https://...).';
                }
            }
        } else if (field.toLowerCase().includes('color')) {
            if (value && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(value)) {
                error = 'Must be a valid hex color (e.g., #RRGGBB).';
            }
        }
    
        if (error) {
            setErrors(prev => ({ ...prev, [field]: error }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field as keyof typeof newErrors];
                return newErrors;
            });
        }
    };

    const handleNavItemChange = (index: number, field: keyof NavItem, value: string | boolean) => {
        const newNavItems = [...config.navItems];
        const updatedItem = { ...newNavItems[index], [field]: value };
        newNavItems[index] = updatedItem;
        setConfig(prev => ({ ...prev, navItems: newNavItems }));
    };
    
    const handleFileUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        onUpload: (dataUrl: string, fileType: string) => void,
        allowedTypes: string[],
        maxSizeMB: number
    ) => {
        const file = e.target.files?.[0];

        // Important: clear the file input value to allow re-uploading the same file
        const target = e.target;
        if (target) {
            target.value = '';
        }

        if (!file) return;

        // Validate file type
        if (!allowedTypes.includes(file.type)) {
            alert(`Invalid file type. Please upload one of: ${allowedTypes.join(', ')}`);
            return;
        }

        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
            alert(`File is too large. Maximum size is ${maxSizeMB}MB.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (typeof event.target?.result === 'string') {
                onUpload(event.target.result, file.type);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleGalleryFileUpload = (e: React.ChangeEvent<HTMLInputElement>, allowedTypes: string[], maxSizeMB: number) => {
        const file = e.target.files?.[0];
        // FIX: The `target` variable was not defined, causing a reference error.
        // It has been defined by extracting it from the event object `e`, similar
        // to how it is handled in the `handleFileUpload` function.
        const target = e.target;
        if (target) {
            target.value = '';
        }
        if (!file) return;
        if (!allowedTypes.includes(file.type)) {
            alert(`Invalid file type. Please upload one of: ${allowedTypes.join(', ')}`);
            return;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
            alert(`File is too large. Maximum size is ${maxSizeMB}MB.`);
            return;
        }
        setFileToEdit(file);
        setIsEditorOpen(true);
    };

    const handleSaveEditedMedia = (newItem: GalleryItem) => {
        setConfig(prev => ({ ...prev, galleryItems: [...prev.galleryItems, newItem] }));
        setIsEditorOpen(false);
        setFileToEdit(null);
    };


    const getUrlContentType = (url: string): GalleryItemType => {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.startsWith('data:video')) return 'video';
        if (lowerUrl.match(/\.(mp4|webm|mov|ogg)$/)) return 'video';
        return 'image';
    };

    const handleAddGalleryItem = () => {
        if (!newGalleryUrl) return;
        const type = getUrlContentType(newGalleryUrl);
        const newItem = { src: newGalleryUrl, type };
        setConfig(prev => ({ ...prev, galleryItems: [...prev.galleryItems, newItem] }));
        setNewGalleryUrl('');
    };

    const handleRemoveGalleryItem = (indexToRemove: number) => {
        setConfig(prev => ({
            ...prev,
            galleryItems: prev.galleryItems.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleAddTestimonial = () => {
        if (!newTestimonial.author || !newTestimonial.text) return;
        setConfig(prev => ({
            ...prev,
            testimonials: [...prev.testimonials, newTestimonial]
        }));
        setNewTestimonial({ author: '', text: '' });
    };
    
    const handleRemoveTestimonial = (indexToRemove: number) => {
        setConfig(prev => ({
            ...prev,
            testimonials: prev.testimonials.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleThemeChange = (themeName: keyof typeof themes) => {
        const selectedTheme = themes[themeName];
        if (selectedTheme) {
            setConfig(prev => ({
                ...prev,
                ...selectedTheme,
                theme: themeName,
            }));
            // Clear any color errors when a theme is applied
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.primaryColor;
                delete newErrors.backgroundColor;
                delete newErrors.textColor;
                delete newErrors.accentColor1;
                delete newErrors.accentColor2;
                delete newErrors.accentColor3;
                return newErrors;
            });
        }
    };

    type ToggleField = 'showServices' | 'showGallery' | 'showTestimonials' | 'showBlog' | 'showContact' | 'showBookingLink' | 'showFeaturedService';
    const handleToggleChange = (field: ToggleField, value: boolean) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerateImage = async () => {
        setIsGeneratingImage(true);
        try {
            const prompt = "A luxurious 24k gold facial mask on a woman's face in a serene spa setting.";
            const imageUrl = await generateFeaturedServiceImage(prompt);
            handleConfigChange('featuredServiceImageUrl', imageUrl);
        } catch (error) {
            console.error("Failed to generate image:", error);
            alert("Sorry, the AI couldn't generate an image at the moment. Please try again.");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const title3DStyle = { textShadow: '0 1px 1px rgba(255,255,255,0.7), 0 -1px 1px rgba(0,0,0,0.15)' };

    const Toggle = ({ field, label, description }: { field: ToggleField, label: string, description: string }) => (
        <label className="flex items-center justify-between cursor-pointer">
        <div>
            <p className="text-sm font-medium text-stone-700">{label}</p>
            <p className="text-xs text-stone-500">{description}</p>
        </div>
        <div className="relative">
            <input 
            type="checkbox" 
            checked={config[field]}
            onChange={(e) => handleToggleChange(field, e.target.checked)}
            className="sr-only peer" 
            />
            <div className="relative w-12 h-[26px] bg-stone-300 rounded-full shadow-inner transition-colors duration-300 peer-focus:ring-2 peer-focus:ring-pink-400 peer-checked:bg-pink-500">
                <span className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-[22px] overflow-hidden">
                    <div 
                        className="absolute inset-0"
                        style={{ backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0) 70%)` }}
                    />
                </span>
            </div>
        </div>
        </label>
    );

    const ColorSphere = ({ color }: { color: string }) => (
        <div 
            className="w-5 h-5 rounded-full border border-stone-300/50 relative overflow-hidden shadow-inner" 
            style={{ backgroundColor: color }}
        >
            <div 
                className="absolute inset-0"
                style={{ backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), rgba(255,255,255,0) 70%)` }}
            />
        </div>
    );

    const cardStyle = "bg-white/70 p-6 rounded-xl border border-pink-200 backdrop-blur-sm";
    const labelStyle = "block text-sm font-medium text-stone-600 mb-2";
    const inputStyle = (hasError: boolean) =>
        `w-full bg-white/50 text-stone-900 rounded-lg shadow-[0_1px_3px_rgba(10,186,181,0.3)] transition-colors ${
            hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-stone-300 focus:border-pink-500 focus:ring-pink-500'
        }`;
    const contentTypes: { value: ContentType; label: string }[] = [
        { value: 'home', label: 'Home Page' },
        { value: 'services', label: 'Services List' },
        { value: 'gallery', label: 'Photo Gallery' },
        { value: 'blog', label: 'Blog Page' },
        { value: 'contact', label: 'Contact & Info' },
    ];


  return (
    <>
    <div className="flex flex-col-reverse lg:flex-row gap-8">
        {/* --- Left Column: Customization Panel --- */}
        <div className="lg:w-3/5 space-y-8">
            <div className={cardStyle}>
                <h3 className="font-bold text-xl mb-4 text-stone-800" style={title3DStyle}>Brand Identity</h3>
                <div className="space-y-6">
                    <Tooltip text="The name of your app, displayed in the header.">
                        <div>
                            <div className="flex justify-between items-baseline">
                                <label htmlFor="appName" className={labelStyle}>App Name</label>
                                <span className={`text-xs ${config.appName.length > 30 ? 'text-red-600' : 'text-stone-500'}`}>{config.appName.length} / 30</span>
                            </div>
                            <input
                              type="text"
                              id="appName"
                              value={config.appName}
                              onChange={(e) => handleConfigChange('appName', e.target.value)}
                              maxLength={30}
                              className={inputStyle(!!errors.appName)}
                            />
                            {errors.appName && <p className="text-xs text-red-600 mt-1">{errors.appName}</p>}
                        </div>
                    </Tooltip>
                    <Tooltip text="Provide a URL or upload a file for your business logo.">
                         <div>
                            <label htmlFor="logoUrl" className={labelStyle}>Logo (URL or Upload)</label>
                             <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    id="logoUrl"
                                    value={config.logoUrl}
                                    onChange={(e) => handleConfigChange('logoUrl', e.target.value)}
                                    className={inputStyle(!!errors.logoUrl)}
                                />
                                 <label htmlFor="logo-upload" className="flex-shrink-0 cursor-pointer flex items-center text-sm font-semibold text-pink-600 bg-white/80 border border-pink-200 px-3 py-2 rounded-lg hover:bg-pink-50 transition-colors">
                                    Upload
                                </label>
                                <input
                                    id="logo-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/png,image/jpeg"
                                    onChange={(e) => handleFileUpload(
                                        e, 
                                        (dataUrl) => handleConfigChange('logoUrl', dataUrl),
                                        ['image/png', 'image/jpeg'],
                                        5
                                    )}
                                />
                            </div>
                            {errors.logoUrl && <p className="text-xs text-red-600 mt-1">{errors.logoUrl}</p>}
                        </div>
                    </Tooltip>
                </div>
            </div>

            <div className={cardStyle}>
                <h3 className="font-bold text-xl mb-4 text-stone-800" style={title3DStyle}>Booking Link</h3>
                <Tooltip text="The URL to your external booking page (e.g., Calendly, Square).">
                    <div>
                        <label htmlFor="bookingLink" className={labelStyle}>External Booking Page URL</label>
                        <input
                            type="text"
                            id="bookingLink"
                            value={config.bookingLink}
                            onChange={(e) => handleConfigChange('bookingLink', e.target.value)}
                            className={inputStyle(!!errors.bookingLink)}
                            placeholder="e.g., https://calendly.com/your-name"
                        />
                        {errors.bookingLink && <p className="text-xs text-red-600 mt-1">{errors.bookingLink}</p>}
                    </div>
                </Tooltip>
            </div>
            
            <div className={cardStyle}>
                <h3 className="font-bold text-xl mb-4 text-stone-800" style={title3DStyle}>Theme Selector</h3>
                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(themes).map(([name, theme]) => (
                        <button
                            key={name}
                            onClick={() => handleThemeChange(name as keyof typeof themes)}
                            className={`p-3 rounded-lg border-2 transition-colors ${config.theme === name ? 'border-pink-500 bg-pink-50' : 'border-stone-200 hover:border-pink-300'}`}
                        >
                            <div className="flex items-center gap-1.5">
                               <ColorSphere color={theme.primaryColor} />
                               <ColorSphere color={theme.backgroundColor} />
                               <ColorSphere color={theme.textColor} />
                               <ColorSphere color={theme.accentColor1} />
                            </div>
                            <p className="text-sm font-semibold mt-2 text-left text-stone-700">{name}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className={cardStyle}>
                <h3 className="font-bold text-xl mb-4 text-stone-800" style={title3DStyle}>Color Palette</h3>
                <p className="text-xs text-stone-500 mb-4 -mt-2">Customize the colors from your selected theme.</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <Tooltip text="Controls the main brand color for buttons, links, and highlights.">
                        <div>
                            <label htmlFor="primaryColor" className="block text-sm font-medium text-stone-600 mb-1">Primary</label>
                            <div className="flex items-center gap-2">
                               <div className="relative w-10 h-10 flex-shrink-0">
                                    <label 
                                        htmlFor="primaryColor-picker"
                                        className="block w-full h-full rounded-full cursor-pointer border border-stone-300/50 shadow-inner overflow-hidden" 
                                        style={{ backgroundColor: config.primaryColor }}
                                    >
                                        <div 
                                            className="w-full h-full"
                                            style={{ backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), rgba(255,255,255,0) 70%)` }}
                                        />
                                    </label>
                                    <input
                                        type="color"
                                        id="primaryColor-picker"
                                        value={config.primaryColor}
                                        onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                                <input
                                    type="text"
                                    id="primaryColor"
                                    value={config.primaryColor}
                                    onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                                    className={inputStyle(!!errors.primaryColor)}
                                    placeholder="#FF00C7"
                                />
                            </div>
                             {errors.primaryColor && <p className="text-xs text-red-600 mt-1">{errors.primaryColor}</p>}
                        </div>
                    </Tooltip>
                    <Tooltip text="The main background color for all pages in your app.">
                        <div>
                            <label htmlFor="backgroundColor" className="block text-sm font-medium text-stone-600 mb-1">Background</label>
                             <div className="flex items-center gap-2">
                                <div className="relative w-10 h-10 flex-shrink-0">
                                    <label 
                                        htmlFor="backgroundColor-picker"
                                        className="block w-full h-full rounded-full cursor-pointer border border-stone-300/50 shadow-inner overflow-hidden" 
                                        style={{ backgroundColor: config.backgroundColor }}
                                    >
                                        <div 
                                            className="w-full h-full"
                                            style={{ backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), rgba(255,255,255,0) 70%)` }}
                                        />
                                    </label>
                                    <input
                                        type="color"
                                        id="backgroundColor-picker"
                                        value={config.backgroundColor}
                                        onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                                 <input
                                    type="text"
                                    id="backgroundColor"
                                    value={config.backgroundColor}
                                    onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                                    className={inputStyle(!!errors.backgroundColor)}
                                    placeholder="#0A001A"
                                 />
                            </div>
                            {errors.backgroundColor && <p className="text-xs text-red-600 mt-1">{errors.backgroundColor}</p>}
                        </div>
                    </Tooltip>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5 mt-6">
                    {([1, 2, 3] as const).map(i => {
                        // FIX: Narrow the type of `field` to the specific keys used in this loop.
                        // This ensures that `config[field]` is correctly inferred as a string and that `field`
                        // is assignable to the `handleConfigChange` function's parameter, resolving all related type errors.
                        const field = `accentColor${i}` as 'accentColor1' | 'accentColor2' | 'accentColor3';
                        return (
                        <Tooltip key={i} text={`An additional color for backgrounds, borders, or decorative elements.`}>
                            <div>
                                <label htmlFor={field} className="block text-sm font-medium text-stone-600 mb-1">{`Accent ${i}`}</label>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-10 h-10 flex-shrink-0">
                                        <label 
                                            htmlFor={`${field}-picker`}
                                            className="block w-full h-full rounded-full cursor-pointer border border-stone-300/50 shadow-inner overflow-hidden" 
                                            style={{ backgroundColor: config[field] }}
                                        >
                                            <div 
                                                className="w-full h-full"
                                                style={{ backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), rgba(255,255,255,0) 70%)` }}
                                            />
                                        </label>
                                        <input
                                            type="color"
                                            id={`${field}-picker`}
                                            value={config[field]}
                                            onChange={(e) => handleConfigChange(field, e.target.value)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        id={field}
                                        value={config[field]}
                                        onChange={(e) => handleConfigChange(field, e.target.value)}
                                        className={`${inputStyle(!!errors[field])} text-xs`}
                                    />
                                </div>
                                {errors[field] && <p className="text-xs text-red-600 mt-1">{errors[field]}</p>}
                            </div>
                        </Tooltip>
                    )})}
                </div>
            </div>

             <div className={cardStyle}>
                <h3 className="font-bold text-xl mb-4 text-stone-800" style={title3DStyle}>Typography & Style</h3>
                <div className="space-y-6">
                    <Tooltip text="Select the primary font for all text in your app.">
                        <div>
                            <label htmlFor="fontFamily" className={labelStyle}>Font Family</label>
                            <select
                              id="fontFamily"
                              value={config.fontFamily}
                              onChange={(e) => handleConfigChange('fontFamily', e.target.value)}
                              className={inputStyle(false)} // No validation needed for select
                            >
                              <option value="Poppins">Poppins (Modern)</option>
                              <option value="Montserrat">Montserrat (Modern)</option>
                              <option value="Comfortaa">Comfortaa (Rounded)</option>
                              <option value="VT323">VT323 (Pixel)</option>
                              <option value="Chakra Petch">Chakra Petch (Tech)</option>
                              <option value="Caveat">Caveat (Cute Script)</option>
                            </select>
                        </div>
                    </Tooltip>
                    <Tooltip text="Choose the style for all main buttons in your app.">
                         <div>
                            <label className={labelStyle}>Button Shape</label>
                            <div className="flex gap-3">
                                {(['rounded-lg', 'rounded-md', 'rounded-full'] as const).map(shape => (
                                     <button
                                        key={shape}
                                        onClick={() => handleConfigChange('buttonShape', shape)}
                                        className={`flex-1 py-2 text-sm border ${config.buttonShape === shape ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white/50 border-stone-300 text-stone-600'} ${shape}`}
                                    >
                                        {buttonShapeLabels[shape]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Tooltip>
                </div>
            </div>

            <div className={cardStyle}>
                <h3 className="font-bold text-xl mb-4 text-stone-800" style={title3DStyle}>Hero Image</h3>
                <Tooltip text="The main banner image on your app's home screen.">
                    <div>
                        <label htmlFor="heroImageUrl" className={labelStyle}>Image (URL or Upload)</label>
                        <div className="flex items-center gap-2">
                            <input
                              type="text"
                              id="heroImageUrl"
                              value={config.heroImageUrl}
                              onChange={(e) => handleConfigChange('heroImageUrl', e.target.value)}
                              className={inputStyle(!!errors.heroImageUrl)}
                            />
                            <label htmlFor="hero-image-upload" className="flex-shrink-0 cursor-pointer flex items-center text-sm font-semibold text-pink-600 bg-white/80 border border-pink-200 px-3 py-2 rounded-lg hover:bg-pink-50 transition-colors">
                                Upload
                            </label>
                            <input
                                id="hero-image-upload"
                                type="file"
                                className="hidden"
                                accept="image/png,image/jpeg"
                                onChange={(e) => handleFileUpload(
                                    e,
                                    (dataUrl) => handleConfigChange('heroImageUrl', dataUrl),
                                    ['image/png', 'image/jpeg'],
                                    5
                                )}
                            />
                        </div>
                        {errors.heroImageUrl && <p className="text-xs text-red-600 mt-1">{errors.heroImageUrl}</p>}
                    </div>
                </Tooltip>
            </div>

            {config.showFeaturedService && (
                <div className={cardStyle}>
                    <h3 className="font-bold text-xl mb-4 text-stone-800" style={title3DStyle}>Featured Service Card</h3>
                    <div className="space-y-6">
                        <Tooltip text="The main image for your featured service.">
                            <div>
                                <label htmlFor="featuredServiceImageUrl" className={labelStyle}>Image (URL or Upload)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      id="featuredServiceImageUrl"
                                      value={config.featuredServiceImageUrl}
                                      onChange={(e) => handleConfigChange('featuredServiceImageUrl', e.target.value)}
                                      className={inputStyle(!!errors.featuredServiceImageUrl)}
                                    />
                                    <button 
                                        onClick={handleGenerateImage} 
                                        disabled={isGeneratingImage}
                                        className="flex-shrink-0 cursor-pointer flex items-center gap-1.5 text-sm font-semibold text-pink-600 bg-white/80 border border-pink-200 px-3 py-2 rounded-lg hover:bg-pink-50 transition-colors disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {isGeneratingImage ? 'Generating...' : <><SparkleIcon /> AI</>}
                                    </button>
                                    <label htmlFor="featured-service-image-upload" className="flex-shrink-0 cursor-pointer flex items-center text-sm font-semibold text-pink-600 bg-white/80 border border-pink-200 px-3 py-2 rounded-lg hover:bg-pink-50 transition-colors">
                                        Upload
                                    </label>
                                    <input
                                        id="featured-service-image-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/png,image/jpeg"
                                        onChange={(e) => handleFileUpload(
                                            e,
                                            (dataUrl) => handleConfigChange('featuredServiceImageUrl', dataUrl),
                                            ['image/png', 'image/jpeg'],
                                            5
                                        )}
                                    />
                                </div>
                                {errors.featuredServiceImageUrl && <p className="text-xs text-red-600 mt-1">{errors.featuredServiceImageUrl}</p>}
                            </div>
                        </Tooltip>

                        <Tooltip text="The name of your featured service.">
                             <div>
                                <div className="flex justify-between items-baseline">
                                    <label htmlFor="featuredServiceName" className={labelStyle}>Service Name</label>
                                    <span className={`text-xs ${config.featuredServiceName.length > 50 ? 'text-red-600' : 'text-stone-500'}`}>{config.featuredServiceName.length} / 50</span>
                                </div>
                                <input
                                    type="text"
                                    id="featuredServiceName"
                                    value={config.featuredServiceName}
                                    onChange={(e) => handleConfigChange('featuredServiceName', e.target.value)}
                                    maxLength={50}
                                    className={inputStyle(!!errors.featuredServiceName)}
                                />
                                {errors.featuredServiceName && <p className="text-xs text-red-600 mt-1">{errors.featuredServiceName}</p>}
                            </div>
                        </Tooltip>

                        <Tooltip text="The price for this service.">
                             <div>
                                <div className="flex justify-between items-baseline">
                                    <label htmlFor="featuredServicePrice" className={labelStyle}>Price</label>
                                    <span className={`text-xs ${config.featuredServicePrice.length > 20 ? 'text-red-600' : 'text-stone-500'}`}>{config.featuredServicePrice.length} / 20</span>
                                </div>
                                <input
                                    type="text"
                                    id="featuredServicePrice"
                                    value={config.featuredServicePrice}
                                    onChange={(e) => handleConfigChange('featuredServicePrice', e.target.value)}
                                    maxLength={20}
                                    className={inputStyle(!!errors.featuredServicePrice)}
                                    placeholder="e.g., $150 or Starting at $99"
                                />
                                {errors.featuredServicePrice && <p className="text-xs text-red-600 mt-1">{errors.featuredServicePrice}</p>}
                            </div>
                        </Tooltip>

                        <Tooltip text="A short, compelling description of the featured service.">
                             <div>
                                <div className="flex justify-between items-baseline">
                                    <label htmlFor="featuredServiceDescription" className={labelStyle}>Description</label>
                                    <span className={`text-xs ${config.featuredServiceDescription.length > 200 ? 'text-red-600' : 'text-stone-500'}`}>{config.featuredServiceDescription.length} / 200</span>
                                </div>
                                <textarea
                                    id="featuredServiceDescription"
                                    rows={3}
                                    value={config.featuredServiceDescription}
                                    onChange={(e) => handleConfigChange('featuredServiceDescription', e.target.value)}
                                    maxLength={200}
                                    className={inputStyle(!!errors.featuredServiceDescription)}
                                />
                                {errors.featuredServiceDescription && <p className="text-xs text-red-600 mt-1">{errors.featuredServiceDescription}</p>}
                            </div>
                        </Tooltip>
                    </div>
                </div>
            )}
            
            <div className={cardStyle}>
                <h3 className="font-bold text-xl mb-4 text-stone-800" style={title3DStyle}>Section Titles</h3>
                <p className="text-xs text-stone-500 mb-4 -mt-2">Customize the titles for different sections of your app.</p>
                <div className="space-y-6">
                {(['heroTitle', 'featuredServiceTitle', 'homeTestimonialsTitle', 'homeGalleryTitle', 'homeBlogTitle', 'servicesPageTitle', 'galleryPageTitle', 'blogPageTitle', 'contactPageTitle'] as const).map(field => {
                    const labels: Record<typeof field, string> = {
                        heroTitle: 'Hero Title',
                        featuredServiceTitle: 'Featured Service Title',
                        homeTestimonialsTitle: 'Home - Testimonials Title',
                        homeGalleryTitle: 'Home - Gallery Title',
                        homeBlogTitle: 'Home - Blog Title',
                        servicesPageTitle: 'Services Page Title',
                        galleryPageTitle: 'Gallery Page Title',
                        blogPageTitle: 'Blog Page Title',
                        contactPageTitle: 'Contact Page Title',
                    };
                    return (
                        <Tooltip key={field} text={`Set the main title for the '${labels[field]}' section.`}>
                            <div>
                                <div className="flex justify-between items-baseline">
                                    <label htmlFor={field} className={labelStyle}>{labels[field]}</label>
                                    <span className={`text-xs ${config[field].length > 50 ? 'text-red-600' : 'text-stone-500'}`}>{config[field].length} / 50</span>
                                </div>
                                <input
                                    type="text"
                                    id={field}
                                    value={config[field]}
                                    onChange={(e) => handleConfigChange(field, e.target.value)}
                                    maxLength={50}
                                    className={inputStyle(!!errors[field])}
                                />
                                {errors[field] && <p className="text-xs text-red-600 mt-1">{errors[field]}</p>}
                            </div>
                        </Tooltip>
                    );
                })}
                </div>
            </div>
            
            {config.showGallery && (
                <div className={cardStyle}>
                    <h3 className="font-bold text-xl mb-4 text-stone-800" style={title3DStyle}>Gallery Content</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mb-4">
                        {config.galleryItems.length === 0 && (
                            <p className="text-sm text-stone-500 text-center py-4">Your gallery is empty.</p>
                        )}
                        {config.galleryItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 border rounded-lg border-stone-200 bg-white/50">
                                {item.type === 'image' ? (
                                    <img src={item.src} alt="gallery item" className="w-10 h-10 object-cover rounded flex-shrink-0" />
                                ) : (
                                    <video src={item.src} className="w-10 h-10 object-cover rounded bg-black flex-shrink-0"></video>
                                )}
                                <p className="text-xs text-stone-600 truncate flex-1" title={item.src}>{item.src}</p>
                                <button onClick={() => handleRemoveGalleryItem(index)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors flex-shrink-0">
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6">
                        <Tooltip text="Add a new image or video by pasting a URL or uploading a file.">
                            <div>
                                <label htmlFor="newGalleryUrl" className="block text-sm font-medium text-stone-600 mb-2">Add New Item</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        id="newGalleryUrl"
                                        value={newGalleryUrl}
                                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                                        className={inputStyle(false)}
                                        placeholder="Paste URL..."
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddGalleryItem()}
                                    />
                                    <button onClick={handleAddGalleryItem} className="flex-shrink-0 text-sm font-semibold text-pink-600 bg-white/80 border border-pink-200 px-3 py-2 rounded-md hover:bg-pink-50 transition-colors">
                                        Add
                                    </button>
                                     <label htmlFor="gallery-upload" className="flex-shrink-0 cursor-pointer flex items-center text-sm font-semibold text-pink-600 bg-white/80 border border-pink-200 px-3 py-2 rounded-lg hover:bg-pink-50 transition-colors">
                                        Upload
                                    </label>
                                    <input
                                        id="gallery-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/png,image/jpeg,video/mp4,video/webm,video/quicktime"
                                        onChange={(e) => handleGalleryFileUpload(
                                            e,
                                            ['image/png', 'image/jpeg', 'video/mp4', 'video/webm', 'video/quicktime'],
                                            10
                                        )}
                                    />
                                </div>
                            </div>
                        </Tooltip>
                    </div>
                </div>
            )}

            {config.showTestimonials && (
                <div className={cardStyle}>
                    <h3 className="font-bold text-xl mb-4 text-stone-800" style={title3DStyle}>Client Testimonials</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mb-4">
                        {config.testimonials.length === 0 && (
                            <p className="text-sm text-stone-500 text-center py-4">No testimonials yet.</p>
                        )}
                        {config.testimonials.map((item, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg border-stone-200 bg-white/50">
                                <div className="flex-1">
                                    <p className="text-sm text-stone-800">"{item.text}"</p>
                                    <p className="text-xs font-semibold text-stone-500 mt-1">- {item.author}</p>
                                </div>
                                <button onClick={() => handleRemoveTestimonial(index)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors flex-shrink-0">
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        <Tooltip text="The main text of the client's testimonial.">
                            <div>
                                <label htmlFor="newTestimonialText" className={labelStyle}>Quote</label>
                                <textarea
                                    id="newTestimonialText"
                                    rows={2}
                                    value={newTestimonial.text}
                                    onChange={(e) => setNewTestimonial(prev => ({ ...prev, text: e.target.value }))}
                                    className={inputStyle(false)}
                                    placeholder="Client's feedback..."
                                />
                            </div>
                        </Tooltip>
                        <Tooltip text="The name of the client who provided the testimonial.">
                            <div>
                                <label htmlFor="newTestimonialAuthor" className={labelStyle}>Author</label>
                                <input
                                    type="text"
                                    id="newTestimonialAuthor"
                                    value={newTestimonial.author}
                                    onChange={(e) => setNewTestimonial(prev => ({ ...prev, author: e.target.value }))}
                                    className={inputStyle(false)}
                                    placeholder="Client's name..."
                                />
                            </div>
                        </Tooltip>
                        <button onClick={handleAddTestimonial} className="w-full text-sm font-semibold text-pink-600 bg-white/80 border border-pink-200 px-3 py-2 rounded-md hover:bg-pink-50 transition-colors">
                            Add Testimonial
                        </button>
                    </div>
                </div>
            )}

             <div className={cardStyle}>
                <h3 className="font-bold text-xl mb-4 text-stone-800" style={title3DStyle}>App Sections Visibility</h3>
                <div className="space-y-5">
                    <Toggle 
                        field="showBookingLink"
                        label="Show 'Book Now' Button"
                        description="Display a booking button on the home and services pages."
                    />
                     <Toggle 
                        field="showFeaturedService"
                        label="Show Featured Service"
                        description="Display a special featured service on the home page."
                    />
                    <Toggle 
                        field="showServices"
                        label="Show 'Our Services' Section"
                        description="Display a button to the services page on the home screen."
                    />
                    <Toggle 
                        field="showGallery"
                        label="Show Gallery"
                        description="Display the gallery page and home page preview."
                    />
                    <Toggle 
                        field="showTestimonials"
                        label="Show Testimonials"
                        description="Display client testimonials on the home page."
                    />
                    <Toggle 
                        field="showBlog"
                        label="Show Blog Page"
                        description="Enable the blog section and its navigation tab."
                    />
                    <Toggle 
                        field="showContact"
                        label="Show Contact Page"
                        description="Enable the contact & info page and its navigation tab."
                    />
                </div>
            </div>

            <div className={cardStyle}>
                <h3 className="font-bold text-xl mb-4 text-stone-800" style={title3DStyle}>Navigation Bar</h3>
                <div className="space-y-4">
                    {config.navItems.map((item, index) => (
                        <div key={index} className="p-3 border rounded-lg border-stone-200 bg-white/50 space-y-3">
                            <div className="flex flex-wrap items-end gap-3">
                                {/* Label */}
                                <Tooltip text="The text displayed for this navigation tab." className="flex-grow min-w-[100px]">
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">Label</label>
                                        <input
                                            type="text"
                                            value={item.label}
                                            onChange={(e) => handleNavItemChange(index, 'label', e.target.value)}
                                            className="w-full text-sm bg-white/50 text-stone-900 rounded-md border-stone-300 focus:ring-pink-500 focus:border-pink-500 h-[38px] shadow-[0_1px_3px_rgba(10,186,181,0.3)]"
                                        />
                                    </div>
                                </Tooltip>
                                {/* Icon */}
                                <Tooltip text="The icon for this tab. Paste a URL or upload an SVG/PNG." className="flex-grow min-w-[100px]">
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">Icon</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={item.icon}
                                                onChange={(e) => handleNavItemChange(index, 'icon', e.target.value)}
                                                className="w-full text-sm bg-white/50 text-stone-900 rounded-lg border-stone-300 focus:ring-pink-500 focus:border-pink-500 h-[38px] shadow-[0_1px_3px_rgba(10,186,181,0.3)] px-3"
                                            />
                                            <label htmlFor={`nav-icon-upload-${index}`} className="flex-shrink-0 cursor-pointer flex items-center justify-center text-sm font-semibold text-pink-600 bg-white/50 border border-l-0 border-stone-300 px-3 rounded-r-md hover:bg-pink-50 transition-colors h-[38px]">
                                                Upload
                                            </label>
                                            <input
                                                id={`nav-icon-upload-${index}`}
                                                type="file"
                                                className="hidden"
                                                accept="image/png,image/jpeg"
                                                onChange={(e) => handleFileUpload(
                                                    e,
                                                    (dataUrl) => handleNavItemChange(index, 'icon', dataUrl),
                                                    ['image/png', 'image/jpeg'],
                                                    2
                                                )}
                                            />
                                        </div>
                                    </div>
                                </Tooltip>
                                 {/* Tab Content */}
                                <Tooltip text="Choose which page this tab will open in the app." className="flex-grow min-w-[120px]">
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">Tab Content</label>
                                        <select
                                            value={item.content}
                                            onChange={(e) => handleNavItemChange(index, 'content', e.target.value)}
                                            className="w-full text-sm bg-white/50 text-stone-900 rounded-md border-stone-300 focus:ring-pink-500 focus:border-pink-500 h-[38px] shadow-[0_1px_3px_rgba(10,186,181,0.3)]"
                                        >
                                            {contentTypes.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </Tooltip>
                                {/* Visibility Toggle */}
                                <div className="flex-shrink-0">
                                    <label className="flex items-center gap-2 cursor-pointer h-[38px]">
                                        <div className="relative">
                                            <input 
                                              type="checkbox" 
                                              checked={item.visible}
                                              onChange={(e) => handleNavItemChange(index, 'visible', e.target.checked)}
                                              className="sr-only peer" 
                                            />
                                            <div className="relative w-12 h-[26px] bg-stone-300 rounded-full shadow-inner transition-colors duration-300 peer-focus:ring-2 peer-focus:ring-pink-400 peer-checked:bg-pink-500">
                                                <span className="absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-[22px] overflow-hidden">
                                                    <div 
                                                        className="absolute inset-0"
                                                        style={{ backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0) 70%)` }}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-stone-700">Visible</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* --- Right Column: App Preview --- */}
        <div className="lg:w-2/5">
            <div className="lg:sticky lg:top-8 flex flex-col items-center">
                <h2 className="font-bold text-xl mb-4 text-stone-800" style={title3DStyle}>
                    What Your Clients See
                </h2>
                <AppPreview config={config} />
            </div>
        </div>
    </div>
    {isEditorOpen && fileToEdit && (
        <MediaEditorModal 
            file={fileToEdit}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSaveEditedMedia}
        />
    )}
    </>
  );
};

export default Design;