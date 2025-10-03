import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/MediaIcons';

interface ImageInputFormProps {
  onSubmit: (image: File, prompt: string) => void;
  isLoading: boolean;
}

const ImageInputForm: React.FC<ImageInputFormProps> = ({ onSubmit, isLoading }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileValidation = (file: File): boolean => {
    if (!file) return false;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a JPEG, PNG, or WebP file.');
      return false;
    }

    if (file.size > maxSize) {
      setError('File is too large. Maximum size is 5MB.');
      return false;
    }
    
    return true;
  };

  const handleFileChange = useCallback((file: File | null) => {
    if (file && handleFileValidation(file)) {
      setImageFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    } else {
        // Clear old file if new one is invalid
        setImageFile(null);
        setPreviewUrl(null);
    }
  }, [previewUrl]);

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); }; // Necessary for onDrop
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          handleFileChange(e.target.files[0]);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Please upload an image file.');
      return;
    }
    setError('');
    onSubmit(imageFile, prompt);
  };
  
  const removeImage = () => {
      setImageFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
        {!previewUrl ? (
            <div
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-light-cyan dark:border-cyber-cyan bg-light-cyan/10 dark:bg-cyber-cyan/10' : 'border-light-border dark:border-cyber-border/50 hover:bg-black/5 dark:hover:border-cyber-cyan/80 dark:hover:bg-cyber-surface'}`}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadIcon className="w-10 h-10 mb-3 text-light-text-secondary dark:text-cyber-text-secondary" />
                    <p className="mb-2 text-sm text-light-text-secondary dark:text-cyber-text-secondary"><span className="font-semibold text-light-text dark:text-cyber-text">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-light-text-secondary/70 dark:text-cyber-text-secondary/70">JPEG, PNG, or WebP (MAX. 5MB)</p>
                </div>
                <input ref={fileInputRef} type="file" id="file-upload" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={onFileInputChange} />
            </div>
        ) : (
            <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-light-border dark:border-cyber-border/50 bg-light-bg dark:bg-cyber-bg">
                <img src={previewUrl} alt="Image preview" className="w-full h-full object-contain" />
                <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-light-surface/70 dark:bg-cyber-bg/70 text-light-text dark:text-white rounded-full p-1.5 hover:bg-light-red dark:hover:bg-cyber-red hover:text-white dark:hover:text-white transition-colors backdrop-blur-sm">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        )}
      
        {error && <p className="text-red-500 dark:text-cyber-red text-sm mt-2 text-center">{error}</p>}
        
        <div className="mt-4">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Optional: Add context or ask a question about the image (e.g., 'Is this real?')"
                className="w-full h-24 p-4 bg-light-surface dark:bg-cyber-surface/70 border-2 border-light-border dark:border-cyber-border/50 rounded-lg text-light-text-secondary dark:text-cyber-text-secondary focus:outline-none focus:ring-2 focus:ring-light-cyan dark:focus:ring-cyber-cyan dark:focus:border-cyber-cyan/0 transition-all resize-none placeholder:text-light-text-secondary/60 dark:placeholder:text-cyber-text-secondary/50 dark:backdrop-blur-sm"
                disabled={isLoading}
                aria-label="Image context or question"
            />
        </div>
      
        <div className="mt-6 flex justify-center">
            <button
                type="submit"
                className="hologram-button px-8 py-3 font-bold text-white dark:text-cyber-bg bg-light-cyan dark:bg-cyber-cyan rounded-md transition-all duration-300 dark:shadow-cyber-glow-cyan hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                disabled={isLoading || !imageFile}
            >
            {isLoading ? 'Analyzing...' : 'Analyze Image'}
            </button>
      </div>
    </form>
  );
};

export default ImageInputForm;