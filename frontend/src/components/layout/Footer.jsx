import React from 'react';
import { ShieldCheck, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#05070A] py-12 border-t border-white/5 text-center md:text-left">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h4 className="text-white font-bold text-lg">CasinoX</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            Premium crypto casino with instant withdrawals, certified fair RNGs, and 24/7 support.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-4">Platform</h4>
          <ul className="space-y-2 text-gray-500 text-sm">
            <li><a href="#" className="hover:text-emerald-500 transition-colors">Fairness</a></li>
            <li><a href="#" className="hover:text-emerald-500 transition-colors">VIP Club</a></li>
            <li><a href="#" className="hover:text-emerald-500 transition-colors">Promotions</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Legal</h4>
          <ul className="space-y-2 text-gray-500 text-sm">
             <li><a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a></li>
             <li><a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
             <li><a href="#" className="hover:text-emerald-500 transition-colors">Responsible Gaming</a></li>
          </ul>
        </div>

        <div className="col-span-1 md:col-span-1 flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
            <ShieldCheck size={18} className="text-emerald-500"/>
            <span>Licensed & Regulated</span>
          </div>
          <div className="flex gap-4">
             <Facebook size={20} className="text-gray-500 hover:text-white cursor-pointer" />
             <Twitter size={20} className="text-gray-500 hover:text-white cursor-pointer" />
             <Instagram size={20} className="text-gray-500 hover:text-white cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="mt-10 pt-8 border-t border-white/5 text-center text-gray-600 text-xs">
        © 2024 CasinoX Project. All rights reserved. 18+ Play Responsibly.
      </div>
    </footer>
  );
}