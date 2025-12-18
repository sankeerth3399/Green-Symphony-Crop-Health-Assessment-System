
import React from 'react';
import { HistoryItem } from '../types';

interface Props {
  items: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryList: React.FC<Props> = ({ items, onSelectItem, onClear }) => {
  if (items.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Recent Scans</h2>
        <button 
          onClick={onClear}
          className="text-sm text-slate-400 hover:text-red-500 transition"
        >
          Clear History
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-md transition"
            onClick={() => onSelectItem(item)}
          >
            <div className="aspect-square relative overflow-hidden bg-slate-100">
              <img src={item.image} alt={item.result.crop} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="text-white text-xs font-bold px-2 py-1 border border-white rounded">View</span>
              </div>
            </div>
            <div className="p-3">
              <p className="font-bold text-slate-800 text-sm truncate">{item.result.disease}</p>
              <p className="text-slate-500 text-xs truncate">{item.result.crop}</p>
              <p className="text-slate-400 text-[10px] mt-1">{new Date(item.timestamp).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
