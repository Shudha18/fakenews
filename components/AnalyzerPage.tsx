import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import InputForm from './InputForm';
import ImageInputForm from './ImageInputForm';
import Loader from './Loader';
import ResultDisplay from './ResultDisplay';
import { analyzeText, analyzeImage } from '../services/geminiService';
import { saveAnalysis } from '../services/historyService';
import { useAuth } from './AuthContext';
import type { AnalysisResult } from '../types';
import { InputType } from '../types';
import { DownloadIcon } from './icons/UtilityIcons';
import { useCredits } from '../services/creditService';


const AnalyzerPage: React.FC<{onRequireSubscription: () => void}> = ({ onRequireSubscription }) => {
  const [inputType, setInputType] = useState<InputType>(InputType.ARTICLE);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analysisInput, setAnalysisInput] = useState<string | File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const resultCardRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  const { credits, consumeCredit, hasCredits, isSubscribed, dailyLimit } = useCredits();
  
  const checkCredits = () => {
      if (!hasCredits()) {
          const message = isSubscribed 
              ? "You've used all your daily credits. Your credits will reset tomorrow."
              : "You've used all your free credits. Please subscribe to continue analyzing.";
          setError(message);
          return false;
      }
      return true;
  }

  const handleTextAnalysis = async (text: string) => {
    if (!checkCredits()) return;

    setIsLoading(true);
    setResult(null);
    setError(null);
    setAnalysisInput(text);
    try {
      const analysisResult = await analyzeText(text);
      setResult(analysisResult);
      consumeCredit();

      if (currentUser) {
        const historyItemPayload = {
          ...analysisResult,
          inputType: InputType.ARTICLE,
          input: text.substring(0, 150) + (text.length > 150 ? '...' : ''), // Store a snippet
        };
        await saveAnalysis(historyItemPayload);
      }

    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageAnalysis = async (image: File, prompt: string) => {
    if (!checkCredits()) return;
      
    setIsLoading(true);
    setResult(null);
    setError(null);
    setAnalysisInput(image);
    try {
      const analysisResult = await analyzeImage(image, prompt);
      setResult(analysisResult);
      consumeCredit();
      
      if (currentUser) {
        const historyItemPayload = {
          ...analysisResult,
          inputType: InputType.IMAGE,
          input: image.name, // Store filename
        };
        await saveAnalysis(historyItemPayload);
      }

    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setAnalysisInput(null);
  };
  
  const switchInputType = (type: InputType) => {
      if (isLoading) return;
      handleReset();
      setInputType(type);
  };

  const handleDownloadPdf = async () => {
      if (!result || !resultCardRef.current) return;
      
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDownloading(true);

      try {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const contentWidth = pageWidth - margin * 2;

        // --- Add Header ---
        doc.setFontSize(22);
        doc.setTextColor(isDarkMode ? '#00f6ff' : '#0d9488');
        doc.text('Synthetica Analysis Report', margin, 20);
        doc.setFontSize(10);
        doc.setTextColor(isDarkMode ? '#a19cb0' : '#6c757d');
        doc.text(new Date().toLocaleString(), margin, 26);
        doc.setDrawColor(isDarkMode ? '#2a2049' : '#dee2e6');
        doc.line(margin, 30, pageWidth - margin, 30);

        // --- Add Original Input ---
        doc.setFontSize(14);
        doc.setTextColor(isDarkMode ? '#e6e6e6' : '#212529');
        doc.text('Original Input:', margin, 40);

        if (analysisInput instanceof File) {
            const reader = new FileReader();
            reader.readAsDataURL(analysisInput);
            await new Promise<void>(resolve => {
                reader.onload = (e) => {
                    const imgData = e.target?.result as string;
                    const img = new Image();
                    img.src = imgData;
                    img.onload = () => {
                        const imgWidth = 100;
                        const imgHeight = (img.height * imgWidth) / img.width;
                        doc.addImage(imgData, analysisInput.type.split('/')[1].toUpperCase(), margin, 45, imgWidth, imgHeight);
                        resolve();
                    }
                }
            });
        } else if (typeof analysisInput === 'string') {
            doc.setFontSize(9);
            doc.setTextColor(isDarkMode ? '#a19cb0' : '#6c757d');
            const lines = doc.splitTextToSize(analysisInput, contentWidth);
            doc.text(lines, margin, 45, { lineHeightFactor: 1.5 });
        }

        // --- Add Analysis Result ---
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(isDarkMode ? '#e6e6e6' : '#212529');
        doc.text('Analysis Result:', margin, 20);
        
        const canvas = await html2canvas(resultCardRef.current, {
            backgroundColor: isDarkMode ? '#050816' : '#f8f9fa',
            scale: 2,
            useCORS: true,
        });
        const imgData = canvas.toDataURL('image/png');
        
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 25;

        doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (doc.internal.pageSize.getHeight() - position - margin);

        while (heightLeft > 0) {
            position = -heightLeft - margin;
            doc.addPage();
            doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= doc.internal.pageSize.getHeight();
        }

        doc.save(`synthetica-report-${Date.now()}.pdf`);

      } catch (err) {
          console.error("Failed to generate PDF:", err);
          setError("Sorry, there was an issue generating the PDF report.");
      } finally {
        setIsDownloading(false);
      }
  };

  const tabs = [
    { type: InputType.ARTICLE, label: 'Article / URL' },
    { type: InputType.IMAGE, label: 'Image' },
  ];

  const pageConfig = {
      [InputType.ARTICLE]: {
          title: "Analyze Article Authenticity",
          description: "Paste the full text of a news article or a URL to get an AI-powered analysis of its potential bias and accuracy.",
      },
      [InputType.IMAGE]: {
          title: "Analyze Image Authenticity",
          description: "Upload an image to check for signs of manipulation or AI generation. You can add a question for more specific analysis.",
      }
  }

  return (
    <div className="w-full animate-fade-in-up">
      {!result && !isLoading && (
         <div className="text-center">
            <h2 className="text-3xl font-bold text-light-cyan dark:text-cyber-cyan">{pageConfig[inputType].title}</h2>
            <p className="mt-2 text-light-text-secondary dark:text-cyber-text-secondary max-w-2xl mx-auto">
                {pageConfig[inputType].description}
            </p>
         </div>
      )}
      
      <div className="mt-8">
        {isLoading ? (
          <Loader inputType={inputType} />
        ) : error ? (
          <div className="text-center p-6 bg-red-500/10 border border-red-500/50 rounded-lg max-w-md mx-auto">
            <h3 className="text-xl font-bold text-light-red dark:text-cyber-red">Analysis Blocked</h3>
            <p className="mt-2 text-light-text-secondary dark:text-cyber-text-secondary">{error}</p>
            {error.includes("credits") ? (
                <button
                    onClick={onRequireSubscription}
                    className="mt-4 px-6 py-2 font-bold text-white bg-light-cyan dark:bg-cyber-cyan rounded-md hover:bg-teal-700 dark:hover:bg-cyan-400 transition-colors"
                >
                    View Plans
                </button>
            ) : (
                <button
                    onClick={handleReset}
                    className="mt-4 px-6 py-2 font-bold text-white bg-light-red dark:bg-cyber-red rounded-md hover:bg-red-700 dark:hover:bg-red-500 transition-colors"
                >
                    Try Again
                </button>
            )}
          </div>
        ) : result ? (
           <div>
            <ResultDisplay ref={resultCardRef} result={result} />
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
                <button
                    onClick={handleReset}
                    className="px-6 py-2 w-full sm:w-auto font-bold text-light-cyan dark:text-cyber-cyan border-2 border-light-cyan dark:border-cyber-cyan rounded-md bg-transparent hover:bg-light-cyan dark:hover:bg-cyber-cyan hover:text-white dark:hover:text-cyber-bg transition-all duration-300"
                >
                    Analyze Another
                </button>
                <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="hologram-button px-6 py-2 w-full sm:w-auto flex items-center justify-center gap-2 font-bold text-white dark:text-cyber-bg bg-light-cyan dark:bg-cyber-cyan rounded-md transition-all duration-300 dark:shadow-cyber-glow-cyan hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {isDownloading ? (
                        'Generating...'
                    ) : (
                        <>
                            <DownloadIcon className="w-5 h-5" />
                            Download Report
                        </>
                    )}
                </button>
            </div>
           </div>
        ) : (
          <div className="max-w-2xl mx-auto">
             <div className="flex justify-center mb-4">
                <div className="bg-light-surface dark:bg-cyber-surface/50 border border-light-border dark:border-cyber-border/50 rounded-full p-1 text-xs flex items-baseline">
                    <span className="font-bold text-light-cyan dark:text-cyber-cyan px-2 text-base">{credits}</span>
                    {isSubscribed && dailyLimit && <span className="text-light-text-secondary dark:text-cyber-text-secondary pr-1">/ {dailyLimit}</span>}
                    <span className="text-light-text-secondary dark:text-cyber-text-secondary pr-2">Credits Remaining{isSubscribed ? ' Today' : ''}</span>
                </div>
             </div>
            <div className="mb-6 flex justify-center border-b border-light-border dark:border-cyber-border/30">
                {tabs.map((tab) => (
                    <button
                        key={tab.type}
                        onClick={() => switchInputType(tab.type)}
                        className={`relative px-6 py-3 text-sm font-bold transition-colors duration-300 outline-none ${
                            inputType === tab.type
                            ? 'text-light-cyan dark:text-cyber-cyan'
                            : 'text-light-text-secondary dark:text-cyber-text-secondary hover:text-light-text dark:hover:text-cyber-text'
                        }`}
                        >
                        {tab.label}
                        {inputType === tab.type && (
                             <span className="absolute bottom-0 left-0 w-full h-0.5 bg-light-cyan dark:bg-cyber-cyan rounded-full dark:shadow-cyber-glow-cyan"></span>
                        )}
                    </button>
                ))}
            </div>
            {inputType === InputType.ARTICLE && (
              <InputForm onSubmit={handleTextAnalysis} isLoading={isLoading} />
            )}
            {inputType === InputType.IMAGE && (
              <ImageInputForm onSubmit={handleImageAnalysis} isLoading={isLoading} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzerPage;