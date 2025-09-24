import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ProductInput, GeneratedContent } from './types';
import { generateProductContent } from './services/geminiService';
import InputForm from './components/InputForm';
import OutputDisplay from './components/OutputDisplay';
import Header from './components/Header';
import Spinner from './components/Spinner';

const initialProductData: ProductInput = {
  oemImage: null,
  oem_label_data: {
    model_name: "",
    brand: "",
    mtm: "",
    cpu: "",
    ram: "",
    storage: "",
    display: "",
    os: "",
    gpu: "",
    webcam: "",
  },
  condition: "Refurbished",
  target_audience: "Professionals, Students, Small Business Owners",
  usp: "Dependable performance, Durable build, Affordable price, Local South African warranty",
  price: "",
  location: "Benoni, Gauteng",
  local_seo_tags: "Benoni laptop deals, Gauteng refurbished laptops, South Africa tech store",
  competitor_pricing_data: "",
};

const loadingMessages = [
  "Initializing AI...",
  "Analyzing product data...",
  "Performing OCR on label image...",
  "Conducting market analysis...",
  "Crafting compelling descriptions...",
  "Optimizing for SEO...",
  "Finalizing content package...",
];

const App: React.FC = () => {
  const [productInput, setProductInput] = useState<ProductInput>(initialProductData);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  
  // Fix: Use ReturnType<typeof setInterval> for browser compatibility instead of NodeJS.Timeout
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isLoading) {
      let messageIndex = 0;
      setLoadingMessage(loadingMessages[0]); // Reset to the first message
      intervalRef.current = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 2500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLoading]);


  const handleGenerateContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);
    try {
      let imageBase64: string | null = null;
      let imageMimeType: string | null = null;

      if (productInput.oemImage) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(productInput.oemImage as File);
        });
        imageMimeType = dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
        imageBase64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
      }

      const result = await generateProductContent(productInput, imageBase64, imageMimeType);
      setGeneratedContent(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? `An error occurred: ${err.message}` : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [productInput]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InputForm
            productInput={productInput}
            setProductInput={setProductInput}
            onGenerate={handleGenerateContent}
            isLoading={isLoading}
          />
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-slate-800 bg-opacity-75 flex flex-col items-center justify-center rounded-lg z-10">
                <Spinner />
                <p className="text-lg text-slate-300 mt-4 transition-opacity duration-500">{loadingMessage}</p>
              </div>
            )}
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline ml-2">{error}</span>
              </div>
            )}
            {generatedContent ? (
              <OutputDisplay content={generatedContent} />
            ) : (
              !isLoading && (
                <div className="h-full flex items-center justify-center bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg p-8">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-slate-400">Generated content will appear here</h3>
                    <p className="mt-1 text-sm text-slate-500">Fill in the details and click "Generate".</p>
                  </div>
                </div>
              )
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;