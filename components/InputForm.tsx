import React, { useState, useEffect } from 'react';
import type { ProductInput, CompetitorInput, OEMLabelData } from '../types';
import SpecPreviewModal from './SpecPreviewModal';

interface InputFormProps {
  productInput: ProductInput;
  setProductInput: React.Dispatch<React.SetStateAction<ProductInput>>;
  onGenerate: () => void;
  isLoading: boolean;
  onAutoFill: (text: string) => void;
  isFetchingSpecs: boolean;
  fetchSpecsError: string | null;
  previewSpecs: Partial<OEMLabelData> | null;
  onApplySpecs: (specs: Partial<OEMLabelData>) => void;
  onCancelPreview: () => void;
}

const InputField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }> = ({ label, id, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
    <input
      type="text"
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition placeholder:text-slate-400/70"
    />
  </div>
);

const TextAreaField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; rows?: number }> = ({ label, id, value, onChange, placeholder, rows = 3 }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition placeholder:text-slate-400/70"
        />
    </div>
);


const InputForm: React.FC<InputFormProps> = ({ productInput, setProductInput, onGenerate, isLoading, onAutoFill, isFetchingSpecs, fetchSpecsError, previewSpecs, onApplySpecs, onCancelPreview }) => {
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isLoadAvailable, setIsLoadAvailable] = useState<boolean>(false);
  const [competitorErrors, setCompetitorErrors] = useState<Map<number, { name?: string; price?: string }>>(new Map());
  const [isManualOemVisible, setManualOemVisible] = useState<boolean>(true);
  const [autoFillText, setAutoFillText] = useState('');

  useEffect(() => {
    // Check if saved data exists on component mount
    if (localStorage.getItem('savedProductData')) {
      setIsLoadAvailable(true);
    }
  }, []);

  useEffect(() => {
    // When a user uploads an image, collapse the manual fields.
    // When they remove it, expand them.
    setManualOemVisible(!productInput.oemImage);
  }, [productInput.oemImage]);

  const validateCompetitors = (): boolean => {
    const errors = new Map<number, { name?: string; price?: string }>();
    let isValid = true;

    productInput.competitors.forEach((competitor, index) => {
      const rowErrors: { name?: string; price?: string } = {};
      if (!competitor.name.trim()) {
        rowErrors.name = 'Name cannot be empty.';
        isValid = false;
      }
      if (!competitor.price.trim()) {
        rowErrors.price = 'Price cannot be empty.';
        isValid = false;
      } else if (isNaN(Number(competitor.price))) {
        rowErrors.price = 'Price must be a valid number.';
        isValid = false;
      }

      if (Object.keys(rowErrors).length > 0) {
        errors.set(index, rowErrors);
      }
    });

    setCompetitorErrors(errors);
    return isValid;
  };

  const handleGenerateClick = () => {
    if (validateCompetitors()) {
      onGenerate();
    }
  };
  
  const handleSaveProduct = () => {
    try {
      // Create a copy of the input, but exclude the File object which cannot be stringified
      const savableProductInput = {
        ...productInput,
        oemImage: null, // Exclude the image File object from localStorage
      };
      localStorage.setItem('savedProductData', JSON.stringify(savableProductInput));
      setIsLoadAvailable(true); // Enable load button if it was disabled
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error("Failed to save product data:", error);
      setSaveStatus('Error!');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const handleLoadProduct = () => {
    const savedDataString = localStorage.getItem('savedProductData');
    if (savedDataString) {
      try {
        const savedData = JSON.parse(savedDataString);
        // Ensure the loaded data has the oemImage property set to null, as it wasn't saved
        savedData.oemImage = null;

        // Backward compatibility for old string format
        if (savedData.competitor_pricing_data && !savedData.competitors) {
          savedData.competitors = savedData.competitor_pricing_data
            .split(',')
            .map((pair: string) => {
              const parts = pair.split(':');
              const name = parts[0]?.trim() || '';
              const price = parts.slice(1).join(':').trim() || '';
              return { name, price };
            })
            .filter((c: CompetitorInput) => c.name);
          delete savedData.competitor_pricing_data;
        }

        // Ensure competitors is an array
        if (!Array.isArray(savedData.competitors)) {
          savedData.competitors = [];
        }

        setProductInput(savedData);
        setCompetitorErrors(new Map()); // Clear errors on load
      } catch (error) {
        console.error("Failed to load or parse product data:", error);
        alert("Could not load product data. It may be corrupted.");
      }
    }
  };

  const handleOemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProductInput(prev => ({
      ...prev,
      oem_label_data: { ...prev.oem_label_data, [id]: value }
    }));
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProductInput(prev => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProductInput(prev => ({ ...prev, oemImage: file }));
    }
  };

  const removeImage = () => {
    setProductInput(prev => ({ ...prev, oemImage: null }));
    const fileInput = document.getElementById('oemImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleCompetitorChange = (index: number, field: keyof CompetitorInput, value: string) => {
    const updatedCompetitors = [...productInput.competitors];
    updatedCompetitors[index] = { ...updatedCompetitors[index], [field]: value };
    setProductInput(prev => ({ ...prev, competitors: updatedCompetitors }));
  };

  const addCompetitor = () => {
    setProductInput(prev => ({
      ...prev,
      competitors: [...prev.competitors, { name: '', price: '' }],
    }));
  };

  const removeCompetitor = (index: number) => {
    const updatedCompetitors = productInput.competitors.filter((_, i) => i !== index);
    setProductInput(prev => ({ ...prev, competitors: updatedCompetitors }));

    const newErrors = new Map(competitorErrors);
    newErrors.delete(index);
    setCompetitorErrors(newErrors);
  };


  return (
    <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg border border-slate-700">
      {previewSpecs && (
        <SpecPreviewModal
            specs={previewSpecs}
            onApply={onApplySpecs}
            onCancel={onCancelPreview}
        />
      )}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-slate-100">Product Details</h2>
        <div className="flex items-center gap-2">
            <button
                onClick={handleSaveProduct}
                className={`bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-brand-accent transition-all duration-150 ease-in-out text-sm ${saveStatus ? 'bg-emerald-600' : ''}`}
                style={{minWidth: '120px'}}
            >
                {saveStatus || 'Save Product'}
            </button>
            <button
                onClick={handleLoadProduct}
                disabled={!isLoadAvailable}
                className="bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-brand-accent disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition duration-150 ease-in-out text-sm"
            >
                Load Product
            </button>
            <button
              onClick={handleGenerateClick}
              disabled={isLoading}
              className="flex justify-center items-center bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-brand-accent disabled:bg-slate-600 disabled:cursor-not-allowed transition duration-150 ease-in-out text-sm"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                'Generate Content'
              )}
            </button>
        </div>
      </div>
      <div className="space-y-6">
        
        <fieldset className="border border-slate-600 p-4 rounded-md">
          <legend className="text-lg font-semibold px-2 text-brand-accent">OEM Label Data</legend>
          
          <div className="mb-4">
            <label htmlFor="autoFill" className="block text-sm font-medium text-slate-300 mb-1">Auto-fill from URL or Model Number</label>
            <div className="flex gap-2">
              <input
                type="text"
                id="autoFill"
                value={autoFillText}
                onChange={(e) => setAutoFillText(e.target.value)}
                placeholder="Paste URL or model number here"
                className="flex-grow w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition placeholder:text-slate-400/70"
              />
              <button
                onClick={() => onAutoFill(autoFillText)}
                disabled={isFetchingSpecs}
                className="flex justify-center items-center bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
              >
                {isFetchingSpecs ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : "Analyze"}
              </button>
            </div>
            {fetchSpecsError && <p className="text-red-400 text-xs mt-1">{fetchSpecsError}</p>}
          </div>

          <div className="grid grid-cols-1 sm:col-span-2 gap-y-4">
              <div className="col-span-1 sm:col-span-2">
                <label htmlFor="oemImage" className="block text-sm font-medium text-slate-300">
                  OEM Label Image (Recommended)
                </label>
                {!productInput.oemImage ? (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-slate-500"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-slate-400 justify-center">
                        <label
                          htmlFor="oemImage"
                          className="relative cursor-pointer bg-slate-700 rounded-md font-medium text-brand-accent hover:text-brand-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 focus-within:ring-brand-accent px-2"
                        >
                          <span>Upload a file</span>
                          <input
                            id="oemImage"
                            name="oemImage"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-slate-500">The AI will extract specs from the image.</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 relative">
                    <img
                      src={URL.createObjectURL(productInput.oemImage)}
                      alt="OEM Label Preview"
                      className="rounded-md max-h-48 mx-auto shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-700 text-white rounded-full p-1 leading-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500"
                      aria-label="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <p className="text-center text-sm text-slate-400 sm:col-span-2">
                {productInput.oemImage ? '' : 'Or fill in the details manually:'}
              </p>
               {productInput.oemImage && (
                <div className="sm:col-span-2 text-center">
                  <button
                    onClick={() => setManualOemVisible(!isManualOemVisible)}
                    className="text-sm text-brand-accent hover:text-blue-400 transition-colors duration-200"
                    aria-expanded={isManualOemVisible}
                  >
                    {isManualOemVisible ? 'Hide Manual Fields' : 'Edit / View Manual Fields'}
                     <svg xmlns="http://www.w3.org/2000/svg" className={`inline-block h-4 w-4 ml-1 transition-transform duration-300 ${isManualOemVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isManualOemVisible ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Brand" id="brand" value={productInput.oem_label_data.brand} onChange={handleOemChange} placeholder="e.g., Lenovo" />
                    <InputField label="Model Name" id="model_name" value={productInput.oem_label_data.model_name} onChange={handleOemChange} placeholder="e.g., E51-80" />
                    <InputField label="MTM (SKU)" id="mtm" value={productInput.oem_label_data.mtm} onChange={handleOemChange} placeholder="e.g., 80QQB006QSA" />
                    <InputField label="CPU" id="cpu" value={productInput.oem_label_data.cpu} onChange={handleOemChange} placeholder="e.g., Intel Core i5-6200U @ 2.30GHz" />
                    <InputField label="RAM" id="ram" value={productInput.oem_label_data.ram} onChange={handleOemChange} placeholder="e.g., 8GB DDR3L" />
                    <InputField label="Storage" id="storage" value={productInput.oem_label_data.storage} onChange={handleOemChange} placeholder="e.g., 256GB SSD" />
                    <InputField label="Display" id="display" value={productInput.oem_label_data.display} onChange={handleOemChange} placeholder="e.g., 15.6-inch" />
                    <InputField label="Resolution" id="resolution" value={productInput.oem_label_data.resolution} onChange={handleOemChange} placeholder="e.g., 1920x1080" />
                    <InputField label="OS" id="os" value={productInput.oem_label_data.os} onChange={handleOemChange} placeholder="e.g., Windows 10 Pro" />
                    <InputField label="GPU" id="gpu" value={productInput.oem_label_data.gpu} onChange={handleOemChange} placeholder="e.g., Intel HD Graphics 520" />
                    <InputField label="Webcam" id="webcam" value={productInput.oem_label_data.webcam} onChange={handleOemChange} placeholder="e.g., 720p HD" />
                    <InputField label="Color" id="color" value={productInput.oem_label_data.color} onChange={handleOemChange} placeholder="e.g., Grey" />
                </div>
            </div>
        </fieldset>

        <fieldset className="border border-slate-600 p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-brand-accent">Marketing & SEO</legend>
            <div className="space-y-4 mt-2">
                <InputField label="Condition" id="condition" value={productInput.condition} onChange={handleChange} />
                <TextAreaField label="Target Audience" id="target_audience" value={productInput.target_audience} onChange={handleChange} placeholder="e.g., Professionals, Students, Small Business Owners" />
                <TextAreaField label="Unique Selling Points (USPs)" id="usp" value={productInput.usp} onChange={handleChange} placeholder="e.g., Dependable performance, Durable build" />
                <TextAreaField label="Local SEO Tags" id="local_seo_tags" value={productInput.local_seo_tags} onChange={handleChange} placeholder="e.g., Benoni laptop deals, Gauteng refurbished laptops" />
            </div>
        </fieldset>
        
        <fieldset className="border border-slate-600 p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-brand-accent">Pricing Intelligence</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <InputField label="Our Price (ZAR)" id="price" value={productInput.price} onChange={handleChange} placeholder="e.g., 4999.00" />
                <InputField label="Cost Price (ZAR)" id="costPrice" value={productInput.costPrice || ''} onChange={handleChange} placeholder="e.g., 3500.00" />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <InputField label="Location" id="location" value={productInput.location} onChange={handleChange} placeholder="e.g., Benoni, Gauteng" />
            </div>
            <div className="mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Competitor Pricing Data</label>
                <div className="space-y-3">
                    {productInput.competitors.map((competitor, index) => {
                        const errors = competitorErrors.get(index);
                        return (
                            <div key={index} className="flex items-start gap-2">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={competitor.name}
                                        onChange={(e) => handleCompetitorChange(index, 'name', e.target.value)}
                                        placeholder="Competitor Name"
                                        className={`w-full bg-slate-700 border rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-accent transition placeholder:text-slate-400/70 ${errors?.name ? 'border-red-500' : 'border-slate-600'}`}
                                        aria-label="Competitor Name"
                                    />
                                    {errors?.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={competitor.price}
                                        onChange={(e) => handleCompetitorChange(index, 'price', e.target.value)}
                                        placeholder="Price (e.g., 5500)"
                                        className={`w-full bg-slate-700 border rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-accent transition placeholder:text-slate-400/70 ${errors?.price ? 'border-red-500' : 'border-slate-600'}`}
                                        aria-label="Competitor Price"
                                    />
                                    {errors?.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeCompetitor(index)}
                                    className="bg-red-600/80 hover:bg-red-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500 h-[42px]"
                                    aria-label={`Remove competitor ${index + 1}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
                <button
                    type="button"
                    onClick={addCompetitor}
                    className="mt-3 bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-brand-accent transition-all duration-150 ease-in-out text-sm"
                >
                    + Add Competitor
                </button>
            </div>
        </fieldset>

        <button
          onClick={handleGenerateClick}
          disabled={isLoading}
          className="w-full flex justify-center items-center bg-brand-primary text-white font-bold py-3 px-4 rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-brand-accent disabled:bg-slate-600 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          {isLoading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
            </>
          ) : (
            'Generate Product Content'
          )}
        </button>
      </div>
    </div>
  );
};

export default InputForm;