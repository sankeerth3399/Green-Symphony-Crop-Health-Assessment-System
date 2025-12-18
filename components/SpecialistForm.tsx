
import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    result: AnalysisResult;
    imageUrl: string;
  };
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const SpecialistForm: React.FC<Props> = ({ isOpen, onClose, context }) => {
  const [activeTab, setActiveTab] = useState<'form' | 'chat'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatLoading]);

  // Initial greeting when switching to chat
  useEffect(() => {
    if (activeTab === 'chat' && messages.length === 0) {
      const greeting = context 
        ? `Hello! I see you're dealing with ${context.result.disease} on your ${context.result.crop}. How can I help you manage this specific condition today?`
        : "Hello! I'm your AI Agricultural Assistant. Feel free to ask me anything about crop health, pest management, or sustainable farming.";
      
      setMessages([{ role: 'model', text: greeting }]);
    }
  }, [activeTab, context]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call to specialist database
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Close after delay
      setTimeout(() => {
        handleClose();
      }, 4000);
    }, 1500);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsChatLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const contextPrompt = context 
        ? `Current Context: The user is analyzing a ${context.result.crop} showing signs of ${context.result.disease}. Severity is ${context.result.severity}. Symptoms include: ${context.result.symptoms.join(', ')}.`
        : "Context: General agricultural inquiry.";

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: `You are an expert Agronomist. ${contextPrompt} Answer the user's question concisely and scientifically.` }] },
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: "You are a professional, friendly, and highly knowledgeable Agricultural AI. You provide evidence-based advice on crop protection, organic alternatives, and integrated pest management (IPM). Keep responses structured and practical.",
        }
      });

      const botResponse = response.text || "I'm sorry, I'm having trouble processing that right now. Could you please rephrase?";
      setMessages(prev => [...prev, { role: 'model', text: botResponse }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Connection error. Please check your network and try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setIsSubmitting(false);
    setActiveTab('form');
    setMessages([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />
      <div className="relative h-full w-full max-w-lg bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-700 text-white shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Support Center</h2>
              <p className="text-emerald-100 text-xs font-medium">Expert agricultural assistance</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Tabs */}
        {!isSuccess && (
          <div className="flex border-b border-slate-100 bg-slate-50 p-1.5">
            <button 
              onClick={() => setActiveTab('form')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'form' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Contact Specialist
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Ask AI Assistant
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isSuccess ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Request Sent</h3>
              <p className="text-slate-500 text-lg leading-relaxed mb-8 font-medium">
                Your report has been securely transmitted to our specialist network. You will receive a notification via your preferred contact method shortly.
              </p>
              <button 
                onClick={handleClose}
                className="bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-800 transition shadow-xl shadow-emerald-900/10"
              >
                Return to Dashboard
              </button>
            </div>
          ) : activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col h-full bg-slate-50">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-br-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white px-5 py-3.5 rounded-2xl text-sm font-medium border border-slate-100 flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 shadow-2xl">
                <div className="relative">
                  <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your question..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-14 py-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition font-semibold"
                  />
                  <button 
                    type="submit"
                    disabled={isChatLoading || !chatInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 bg-white">
              {context ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
                  <img src={context.imageUrl} className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-md" alt="Case context" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Attached Diagnosis</p>
                    <h4 className="font-bold text-slate-800 text-sm">{context.result.crop} &bull; {context.result.disease}</h4>
                    <p className="text-xs text-slate-500 font-medium">Severity: {context.result.severity}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs text-amber-700 font-bold uppercase tracking-tight">
                    General Inquiry (No Scan Attached)
                  </p>
                </div>
              )}

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Priority Level</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-slate-700">
                      <option>Routine Inquiry</option>
                      <option className="text-red-600">Urgent Outbreak</option>
                      <option>Research / Academic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Crop Stage</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-slate-700">
                      <option>Seedling</option>
                      <option>Vegetative</option>
                      <option>Flowering</option>
                      <option>Fruiting</option>
                      <option>Maturity</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Case Summary</label>
                  <textarea 
                    required
                    rows={4} 
                    placeholder="Please describe environmental factors (humidity, soil type, temperature) and any visible changes over the last 48 hours..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none font-medium text-slate-700"
                  ></textarea>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Contact Information</h4>
                  <div className="space-y-4">
                    <input type="email" placeholder="Email Address" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition font-semibold" />
                    <input type="tel" placeholder="Phone (Optional)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition font-semibold" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-emerald-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-800'}`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Transmit to Specialist
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
