import React from 'react';
import { Play } from 'lucide-react';

export default function GameCard({ title, image, provider, isLive = false }) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-[#1a2c38] border border-white/5 hover:border-emerald-500/50 transition-all duration-300 shadow-lg cursor-pointer h-56 w-full">
      {/* Background Image */}
      <img 
        src={image} 
        alt={title} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
      />
      
      {/* Dark Overlay on Hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Badges */}
      <div className="absolute top-3 left-3 flex gap-2">
        {isLive && (
          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse shadow-md flex items-center gap-1">
             <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" /> LIVE
          </span>
        )}
        {provider && (
          <span className="bg-black/60 backdrop-blur-md text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded border border-white/10">
            {provider}
          </span>
        )}
      </div>

      {/* Play Button (Centers on hover) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
        <button className="bg-emerald-500 text-white p-3 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:bg-emerald-400">
          <Play fill="currentColor" size={24} />
        </button>
      </div>

      {/* Title Bar */}
      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
        <h3 className="text-white font-bold text-sm truncate">{title}</h3>
      </div>
    </div>
  );
}