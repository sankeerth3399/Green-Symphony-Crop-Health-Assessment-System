
import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-emerald-700 p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-3xl font-black tracking-tight mb-2">How the System Works</h2>
          <p className="text-emerald-100 font-medium">Revolutionizing crop health with Gemini Vision AI.</p>
        </div>

        <div className="p-8 md:p-12 overflow-y-auto max-h-[70vh]">
          <section className="mb-12">
            <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-emerald-100"></span>
              Instruction Manual
            </h3>
            <div className="grid gap-6">
              {[
                { step: '01', title: 'Capture', desc: 'Take a clear, high-resolution photo of the affected leaf or stem. Natural lighting works best.' },
                { step: '02', title: 'Analyze', desc: 'Our neural network processes cellular patterns against millions of agricultural signatures.' },
                { step: '03', title: 'Diagnose', desc: 'Receive a structured report detailing the disease, severity, and observational symptoms.' },
                { step: '04', title: 'Resolve', desc: 'Apply recommended treatments or use our grounded search to research specific applications.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start group">
                  <span className="text-2xl font-black text-emerald-100 group-hover:text-emerald-200 transition-colors leading-none">{item.step}</span>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">{item.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-emerald-100"></span>
              Key Benefits
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'Early Detection', desc: 'Identify pathogens before they devastate entire harvest yields.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                { title: 'Grounded Advice', desc: 'All treatments are validated against current agricultural research.', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                { title: 'Sustainable Farming', desc: 'Prioritizes organic and biological control methods for soil health.', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
                { title: 'Expert Access', desc: 'Instantly bridge the gap between farmers and agronomists.', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' }
              ].map((benefit, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600 mb-4 border border-slate-100">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={benefit.icon} />
                    </svg>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{benefit.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
          <button 
            onClick={onClose}
            className="bg-emerald-700 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-800 transition shadow-xl shadow-emerald-900/10"
          >
            Got it, Let's Farm
          </button>
        </div>
      </div>
    </div>
  );
};
