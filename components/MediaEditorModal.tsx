import React, { useState, useEffect, useRef } from 'react';
import type { GalleryItem, GalleryItemType } from './AppBuilder';

interface MediaEditorModalProps {
  file: File;
  onClose: () => void;
  onSave: (item: GalleryItem) => void;
}

const MediaEditorModal: React.FC<MediaEditorModalProps> = ({ file, onClose, onSave }) => {
  const [mediaSrc, setMediaSrc] = useState<string | null>(null);
  const mediaType: GalleryItemType = file.type.startsWith('image/') ? 'image' : 'video';

  const imageRef = useRef<HTMLImageElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState({ x: 10, y: 10, size: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const videoRef = useRef<HTMLVideoElement>(null);
  const [trim, setTrim] = useState({ start: 0, end: 0 });
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => setMediaSrc(e.target?.result as string);
    reader.readAsDataURL(file);
  }, [file]);

  useEffect(() => {
    if (mediaType === 'video' && videoRef.current) {
      const video = videoRef.current;
      const handleMetadata = () => {
        const videoDuration = video.duration || 0;
        setDuration(videoDuration);
        setTrim({ start: 0, end: videoDuration });
      };
      video.addEventListener('loadedmetadata', handleMetadata);
      return () => video.removeEventListener('loadedmetadata', handleMetadata);
    }
  }, [mediaSrc, mediaType]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - crop.x,
      y: e.clientY - crop.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !imageContainerRef.current) return;
    const containerRect = imageContainerRef.current.getBoundingClientRect();
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;
    newX = Math.max(0, Math.min(newX, containerRect.width - crop.size));
    newY = Math.max(0, Math.min(newY, containerRect.height - crop.size));
    setCrop(c => ({ ...c, x: newX, y: newY }));
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleSaveImage = () => {
    const image = imageRef.current;
    if (!image) return;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.size * scaleX;
    canvas.height = crop.size * scaleY;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.size * scaleX,
      crop.size * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    onSave({ src: canvas.toDataURL(file.type), type: 'image' });
  };

  const handleSaveVideo = () => {
    onSave({ src: mediaSrc!, type: 'video', startTime: trim.start, endTime: trim.end });
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-violet-50 w-full max-w-xl max-h-[90vh] rounded-2xl shadow-2xl p-6 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-stone-900">Edit Media</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-800">&times;</button>
        </div>
        
        <div className="flex-1 bg-black/20 rounded-lg flex items-center justify-center overflow-hidden">
          {mediaSrc && mediaType === 'image' && (
            <div ref={imageContainerRef} className="relative select-none max-w-full max-h-full" style={{ aspectRatio: `${imageRef.current?.naturalWidth || 1}/${imageRef.current?.naturalHeight || 1}` }}>
              <img ref={imageRef} src={mediaSrc} className="max-w-full max-h-[60vh] object-contain" alt="Preview" />
              <div className="absolute top-0 left-0 w-full h-full cursor-move" style={{ boxShadow: `0 0 0 9999px rgba(0,0,0,0.5)` }}>
                <div onMouseDown={handleMouseDown} style={{ top: crop.y, left: crop.x, width: crop.size, height: crop.size, position: 'absolute', boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)', border: '2px dashed white' }}></div>
              </div>
            </div>
          )}
          {mediaSrc && mediaType === 'video' && <video ref={videoRef} src={mediaSrc} controls className="max-w-full max-h-[60vh]" />}
        </div>
        
        {mediaType === 'video' && duration > 0 && (
          <div className="bg-white/70 p-4 rounded-xl border border-pink-200">
            <h3 className="text-sm font-semibold text-stone-700 mb-2">Trim Video</h3>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-xs font-medium text-stone-600">
                        <label htmlFor="start-trim">Start Time</label>
                        <span>{formatTime(trim.start)}</span>
                    </div>
                    <input type="range" id="start-trim" min="0" max={duration} value={trim.start} step="0.1" onChange={e => setTrim(t => ({...t, start: Math.min(parseFloat(e.target.value), t.end)}))} className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                    <div className="flex justify-between text-xs font-medium text-stone-600">
                        <label htmlFor="end-trim">End Time</label>
                        <span>{formatTime(trim.end)}</span>
                    </div>
                    <input type="range" id="end-trim" min="0" max={duration} value={trim.end} step="0.1" onChange={e => setTrim(t => ({...t, end: Math.max(parseFloat(e.target.value), t.start)}))} className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer" />
                </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="text-sm font-semibold text-stone-700 bg-white/80 border border-stone-300 px-5 py-2 rounded-lg hover:bg-stone-100 transition-colors">Cancel</button>
          <button onClick={mediaType === 'image' ? handleSaveImage : handleSaveVideo} className="text-sm font-semibold text-white bg-pink-500 px-5 py-2 rounded-lg hover:bg-pink-600 transition-colors shadow-md shadow-pink-500/30">Save</button>
        </div>
      </div>
    </div>
  );
};

export default MediaEditorModal;
