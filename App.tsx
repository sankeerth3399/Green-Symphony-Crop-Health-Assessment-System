
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ImageUploader } from './components/ImageUploader';
import { ResultCard } from './components/ResultCard';
import { HistoryList } from './components/HistoryList';
import { SpecialistForm } from './components/SpecialistForm';
import { AboutModal } from './components/AboutModal';
import { AnalysisResult, HistoryItem, AppStatus } from './types';
import { analyzeCropImage } from './services/geminiService';

const App: React.FC = () => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isSpecialistFormOpen, setIsSpecialistFormOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('crop_health_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('crop_health_history', JSON.stringify(history));
  }, [history]);

  const handleImageAnalysis = async (base64: string) => {
    setCurrentImage(base64);
    setStatus(AppStatus.LOADING);
    setErrorMessage(null);
    setErrorDetails(null);
    setResult(null);

    try {
      const analysisResult = await analyzeCropImage(base64);
      setResult(analysisResult);
      setStatus(AppStatus.SUCCESS);

      if (analysisResult.isPlant) {
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          image: base64,
          result: analysisResult
        };
        setHistory(prev => [newHistoryItem, ...prev].slice(0, 20));
      }
    } catch (error: any) {
      console.error("Analysis failed:", error);
      setStatus(AppStatus.ERROR);
      
      const msg = error.message || "";
      setErrorMessage("Analysis Interrupted");
      setErrorDetails(msg || "An unexpected error occurred during neural network analysis.");
    }
  };

  const handleRunDemo = () => {
    const mockResult: AnalysisResult = {
      crop: "Tomato",
      disease: "Late Blight (Phytophthora infestans)",
      confidence: 0.984,
      isPlant: true,
      severity: "High",
      description: "Late blight is a potentially devastating disease of tomato caused by the oomycete Phytophthora infestans. It thrives in cool, wet weather and can rapidly destroy foliage and fruit.",
      symptoms: [
        "Dark, water-soaked spots on leaves",
        "White fungal growth on leaf undersides",
        "Large brown lesions on stems",
        "Firm, dark brown decay on tomato fruit"
      ],
      recommendations: [
        "Apply copper-based fungicides immediately",
        "Remove and destroy all infected plant material",
        "Improve air circulation between plants",
        "Use drip irrigation to avoid leaf moisture",
        "Monitor nearby potato crops for similar symptoms"
      ]
    };
    
    setCurrentImage("https://images.unsplash.com/photo-1592433051053-431835703f8a?q=80&w=1000&auto=format&fit=crop");
    setResult(mockResult);
    setStatus(AppStatus.SUCCESS);
  };

  const handleRetry = () => {
    if (currentImage) {
      handleImageAnalysis(currentImage);
    } else {
      setStatus(AppStatus.IDLE);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setCurrentImage(item.image);
    setResult(item.result);
    setStatus(AppStatus.SUCCESS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('crop_health_history');
  };

  return (
    <Layout 
      onContactClick={() => setIsSpecialistFormOpen(true)}
      onAboutClick={() => setIsAboutOpen(true)}
    >
      <div className="space-y-10">
        {status === AppStatus.IDLE && (
          <section className="text-center space-y-6 animate-in fade-in duration-700">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              AI-Powered Agriculture
            </div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight lg:text-7xl">
              Precision Crop <br /><span className="text-emerald-600">Diagnostics.</span>
            </h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed">
              Upload leaf imagery to generate real-time health reports, treatment grounding, and direct expert connections.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => document.getElementById('upload-section')?.scrollIntoView({behavior: 'smooth'})}
                className="w-full sm:w-auto bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition shadow-2xl shadow-emerald-900/20"
              >
                Start New Scan
              </button>
              <button 
                onClick={handleRunDemo}
                className="w-full sm:w-auto bg-white text-slate-600 border border-slate-200 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition shadow-xl"
              >
                View Demo Report
              </button>
            </div>
          </section>
        )}

        <section id="upload-section" className="max-w-3xl mx-auto">
          {status !== AppStatus.SUCCESS && (
            <ImageUploader 
              onImageSelected={handleImageAnalysis} 
              isLoading={status === AppStatus.LOADING} 
            />
          )}
        </section>

        {status === AppStatus.LOADING && (
          <div className="flex flex-col items-center justify-center space-y-6 py-20">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-8 border-emerald-100 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-emerald-900 font-black text-xl mb-1">Analyzing Cellular Patterns</p>
              <p className="text-slate-400 font-medium">Matching against 1.2M crop disease signatures...</p>
            </div>
          </div>
        )}

        {status === AppStatus.ERROR && (
          <div className="max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white border-2 border-red-100 rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-red-500 p-6 flex items-center gap-4 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-black text-xl uppercase tracking-tight">{errorMessage}</h3>
              </div>
              <div className="p-10">
                <p className="text-slate-600 text-lg font-medium leading-relaxed italic border-l-4 border-red-100 pl-6 mb-10">
                  "{errorDetails}"
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={handleRetry}
                    className="flex-1 bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition shadow-xl shadow-red-900/10"
                  >
                    Attempt Recovery
                  </button>
                  <button 
                    onClick={() => setStatus(AppStatus.IDLE)}
                    className="px-10 py-5 border border-slate-200 text-slate-400 rounded-2xl font-bold hover:bg-slate-50 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === AppStatus.SUCCESS && result && currentImage && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <ResultCard 
              result={result} 
              imageUrl={currentImage} 
              onNewScan={() => setStatus(AppStatus.IDLE)}
              onContactSpecialist={() => setIsSpecialistFormOpen(true)}
            />
          </section>
        )}

        <HistoryList 
          items={history} 
          onSelectItem={handleSelectHistoryItem} 
          onClear={clearHistory}
        />
        
        {status === AppStatus.IDLE && (
          <div className="grid md:grid-cols-3 gap-8 pt-20">
            {[
              { title: 'Grounding-Search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', desc: 'Real-time scientific search for every treatment recommended.' },
              { title: 'Disease Mapping', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7l5-2 5.553 2.221a1 1 0 01.447.894v10.764a1 1 0 01-1.447.894L14 17l-5 3z', desc: 'Identify symptoms across 1,200+ distinct crop variations.' },
              { title: 'Agronomist Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', desc: 'Directly forward your reports to human specialists for verification.' }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 shadow-inner">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="font-black text-slate-800 text-lg mb-2 uppercase tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <SpecialistForm 
        isOpen={isSpecialistFormOpen} 
        onClose={() => setIsSpecialistFormOpen(false)} 
        context={result && currentImage ? { result, imageUrl: currentImage } : undefined}
      />

      <AboutModal 
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </Layout>
  );
};

export default App;
