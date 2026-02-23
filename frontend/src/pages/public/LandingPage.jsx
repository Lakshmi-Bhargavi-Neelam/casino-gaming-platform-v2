import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Gamepad2, Users, Flame, ShieldCheck, Globe, Zap } from 'lucide-react';

// --- SWIPER IMPORTS ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

// --- COMPONENT IMPORTS ---
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import GameCard from '../../components/ui/GameCard';

// --- MOCK DATA ---
const HERO_SLIDES = [
  {
    id: 1,
    // Original Roulette/Wheel image
    image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070&auto=format&fit=crop",
    title: "Play Live. Win Big.",
    subtitle: "Join the world's premium casino platform with instant withdrawals.",
    cta: "Start Playing"
  },
  {
    id: 2,
    // NEW IMAGE: Dark Poker Cards/Chips Vibe
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop", 
    title: "Crypto Casino",
    subtitle: "Deposit with Bitcoin, ETH, and USDT. No limits.",
    cta: "Deposit Now"
  }
];

const FEATURED_GAMES = [
  { id: 1, title: "Sweet Bonanza", provider: "Pragmatic", img: "https://images.unsplash.com/photo-1605218427368-35b019b8e643?w=500&auto=format&fit=crop" },
  { id: 2, title: "Aviator", provider: "Spribe", img: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=500&auto=format&fit=crop" },
  { id: 3, title: "Gates of Olympus", provider: "Pragmatic", img: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=500&auto=format&fit=crop" },
  { id: 4, title: "Mines", provider: "CasinoX", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop" },
];

const LIVE_GAMES = [
  { id: 1, title: "Blackjack VIP", type: "Blackjack", img: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=500&auto=format&fit=crop" },
  { id: 2, title: "Roulette Auto", type: "Roulette", img: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=500&auto=format&fit=crop" },
  { id: 3, title: "Crazy Time", type: "Game Show", img: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop" },
  { id: 4, title: "Baccarat Live", type: "Baccarat", img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans selection:bg-emerald-500 selection:text-white">
      
      <Navbar />

      <section className="relative h-[600px] lg:h-[700px] overflow-hidden">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="h-full w-full"
        >
          {HERO_SLIDES.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div 
                className="relative w-full h-full flex items-center bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F1A] via-[#0B0F1A]/70 to-transparent"></div>
                
                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-32">
                  <span className="text-emerald-400 font-bold tracking-widest uppercase mb-4 block animate-fade-in-up">
                    Welcome to CasinoX
                  </span>
                  <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight max-w-3xl">
                    {slide.title}
                  </h1>
                  <p className="text-gray-300 text-xl mb-8 max-w-xl leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <div className="flex gap-4">
                    <Link 
                      to="/register-player" 
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg inline-flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all"
                    >
                      {slide.cta} <ChevronRight />
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* --- PROMOTIONS TICKER --- */}
      <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-4 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#16202c]/90 backdrop-blur-xl p-8 rounded-2xl border border-white/10 flex items-center justify-between hover:border-emerald-500/30 transition-all shadow-2xl group cursor-pointer">
             <div>
                <span className="bg-purple-600 text-xs font-bold px-2 py-1 rounded text-white mb-2 inline-block">BONUS</span>
                <h3 className="text-2xl font-bold mb-2">100% Deposit Match</h3>
                <p className="text-gray-400 text-sm">Double your money up to $1000</p>
             </div>
             <Flame className="text-purple-500 group-hover:scale-110 transition-transform" size={48} />
          </div>
          <div className="bg-[#16202c]/90 backdrop-blur-xl p-8 rounded-2xl border border-white/10 flex items-center justify-between hover:border-emerald-500/30 transition-all shadow-2xl group cursor-pointer">
             <div>
                <span className="bg-emerald-600 text-xs font-bold px-2 py-1 rounded text-white mb-2 inline-block">VIP</span>
                <h3 className="text-2xl font-bold mb-2">Instant Cashouts</h3>
                <p className="text-gray-400 text-sm">Withdraw winnings in under 10 mins</p>
             </div>
             <Zap className="text-emerald-500 group-hover:scale-110 transition-transform" size={48} />
          </div>
        </div>
      </section>

      {/* --- FEATURED GAMES SECTION --- */}
      <section id="games" className="py-12 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Gamepad2 className="text-emerald-400" size={28} />
            </div>
            <h2 className="text-3xl font-bold">Featured Games</h2>
          </div>
          <Link to="/register-player" className="text-emerald-400 text-sm font-bold hover:text-white transition-colors flex items-center gap-1">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURED_GAMES.map((game) => (
            <GameCard key={game.id} title={game.title} provider={game.provider} image={game.img} />
          ))}
        </div>
      </section>

      {/* --- LIVE CASINO SECTION --- */}
      <section id="live" className="py-16 bg-[#0F1422] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Users className="text-red-400" size={28} />
              </div>
              <h2 className="text-3xl font-bold">Live Casino</h2>
            </div>
            <Link to="/register-player" className="text-emerald-400 text-sm font-bold hover:text-white transition-colors flex items-center gap-1">
              View Lobby <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {LIVE_GAMES.map((game) => (
              <GameCard key={game.id} title={game.title} provider={game.type} image={game.img} isLive={true} />
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure & Licensed</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              We hold tier-1 gambling licenses and use SSL encryption to keep your data safe.
            </p>
          </div>
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
              <Globe size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Global Payments</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Deposit via Visa, Mastercard, or 20+ cryptocurrencies from anywhere in the world.
            </p>
          </div>
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-400">
              <Zap size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">24/7 Support</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Our support team is available round the clock via Live Chat to assist you.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}