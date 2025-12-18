
import React, { useState, useRef } from 'react';
import { AnalysisResult } from '../types';
import { getSearchBasedTreatments } from '../services/geminiService';

interface Props {
  result: AnalysisResult;
  imageUrl: string;
  onNewScan: () => void;
  onContactSpecialist: () => void;
}

export const ResultCard: React.FC<Props> = ({ result, imageUrl, onNewScan, onContactSpecialist }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [extendedTreatments, setExtendedTreatments] = useState<{text: string, sources: any[]} | null>(null);
  const [activeSearchTerm, setActiveSearchTerm] = useState<string | null>(null);
  const treatmentSectionRef = useRef<HTMLElement>(null);

  const handleSpecificSearch = async (rec: string) => {
    setActiveSearchTerm(rec);
    setIsSearching(true);
    try {
      // Use the service to get grounded search results for this specific recommendation
      const data = await getSearchBasedTreatments(result.crop, `${result.disease} treatment: ${rec}`);
      setExtendedTreatments(data);
      treatmentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      console.error("Failed to fetch specific treatment details", e);
    } finally {
      setIsSearching(false);
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'moderate': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'critical': return 'bg-red-50 text-red-700 border-red-200 animate-pulse';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (!result.isPlant) {
    return (
      <div className="bg-white border-2 border-amber-100 rounded-3xl p-10 text-center shadow-xl">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Non-Plant Image Detected</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">Our neural network didn't find any identifiable crops in this photo. Please try again with a clear, well-lit shot of a leaf or stem.</p>
        <button onClick={onNewScan} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition">
          Upload New Image
        </button>
      </div>
    );
  }

  const isHealthy = result.disease.toLowerCase() === 'healthy';

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-900/10 overflow-hidden border border-slate-100">
      <div className="grid lg:grid-cols-12 min-h-[650px]">
        {/* Left Panel: Visual Evidence */}
        <div className="lg:col-span-5 relative group">
          <img src={imageUrl} alt="Diagnosis Input" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border backdrop-blur-md ${getSeverityStyles(result.severity)} shadow-lg`}>
              {result.severity} Severity
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-white shadow-2xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Detection Confidence</span>
                <span className="text-xs font-bold">{(result.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 rounded-full transition-all duration-1000" 
                  style={{ width: `${result.confidence * 100}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel: Diagnostic Report */}
        <div className="lg:col-span-7 flex flex-col h-full max-h-[800px]">
          <div className="p-8 lg:p-12 overflow-y-auto custom-scrollbar flex-1">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-emerald-600 font-bold text-sm uppercase tracking-tighter mb-1">{result.crop} Profile</h3>
                <h2 className={`text-4xl font-black tracking-tight ${isHealthy ? 'text-emerald-700' : 'text-slate-900'}`}>
                  {result.disease}
                </h2>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={onNewScan}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl border border-slate-100 transition shadow-sm"
                  title="New Scan"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="prose prose-slate prose-lg max-w-none mb-10">
              <p className="text-slate-600 leading-relaxed font-medium">
                {result.description}
              </p>
            </div>

            <div className="space-y-10">
              <section>
                <h4 className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                  <span className="w-6 h-px bg-slate-200"></span>
                  Observational Symptoms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.symptoms.map((s, idx) => (
                    <span key={idx} className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-100 text-sm font-semibold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {s}
                    </span>
                  ))}
                </div>
              </section>

              <section ref={treatmentSectionRef}>
                <h4 className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                  <span className="w-6 h-px bg-slate-200"></span>
                  Actionable Treatment Plan
                </h4>
                
                {isSearching ? (
                  <div className="bg-emerald-50 border-2 border-emerald-100 border-dashed rounded-3xl p-12 text-center animate-in fade-in zoom-in-95">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                      <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-emerald-800 font-bold">Scouring Agricultural Databases...</p>
                    <p className="text-emerald-600/60 text-xs mt-1">Grounded in scientific extension records</p>
                  </div>
                ) : extendedTreatments ? (
                  <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100 shadow-inner space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                        <h5 className="font-black text-emerald-900 text-sm">Deep In-Depth Analysis</h5>
                      </div>
                      <button 
                        onClick={() => {setExtendedTreatments(null); setActiveSearchTerm(null);}}
                        className="text-emerald-700/50 hover:text-emerald-900 text-[10px] font-bold uppercase tracking-widest transition"
                      >
                        Reset Results
                      </button>
                    </div>
                    
                    {activeSearchTerm && (
                      <p className="text-[11px] font-bold text-emerald-700/60 uppercase tracking-widest border-l-2 border-emerald-300 pl-3">
                        Specific Subject: "{activeSearchTerm}"
                      </p>
                    )}

                    <div className="prose prose-sm prose-emerald leading-relaxed whitespace-pre-wrap font-medium text-emerald-900/80">
                      {extendedTreatments.text}
                    </div>

                    {extendedTreatments.sources.length > 0 && (
                      <div className="pt-6 border-t border-emerald-200/50">
                        <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest mb-3">Academic & Extension Sources</p>
                        <div className="flex flex-wrap gap-2">
                          {extendedTreatments.sources.map((source: any, i: number) => source.web && (
                            <a 
                              key={i} 
                              href={source.web.uri} 
                              target="_blank" 
                              rel="noreferrer"
                              className="bg-white/80 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 border border-emerald-200 transition-all flex items-center gap-2 shadow-sm"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              {source.web.title?.split('|')[0].trim() || "Source Link"}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {result.recommendations.map((r, idx) => (
                      <div key={idx} className="group flex items-start gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-emerald-300 transition-all hover:shadow-lg hover:shadow-emerald-900/5">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-emerald-600 flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-700 font-semibold mb-2">{r}</p>
                          {!isHealthy && (
                            <button 
                              onClick={() => handleSpecificSearch(r)}
                              className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-700 transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              Learn exactly how to apply this
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={onContactSpecialist}
              className="flex-1 bg-emerald-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-800 transition shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-2"
            >
              Consult an Expert
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button 
              onClick={onNewScan}
              className="px-8 py-4 bg-white text-slate-500 rounded-2xl font-bold border border-slate-200 hover:bg-slate-100 transition"
            >
              New Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
