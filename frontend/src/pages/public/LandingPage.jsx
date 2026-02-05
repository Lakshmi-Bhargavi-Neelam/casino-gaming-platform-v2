import { Link } from 'react-router-dom';
import { Gamepad2, ShieldCheck, Globe, ChevronRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

// --- CRITICAL: The words "export default" must be here ---
export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="font-bold text-xl">C</span>
              </div>
              <span className="font-bold text-xl tracking-tight">CasinoPlatform</span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Services</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
              
              {/* Login Button (For Admins & Providers) */}
              <Link 
                to="/login" 
                className="text-gray-300 hover:text-white font-medium px-3 py-2 transition-colors border border-transparent hover:border-white/20 rounded-lg"
              >
                Partner Login
              </Link>

              {/* Player Register CTA */}
              <Link
                to="/register-player"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-full font-semibold transition-all shadow-lg hover:shadow-emerald-500/20"
              >
                Start Playing
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900 border-b border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#features" className="block px-3 py-2 text-gray-300 hover:text-white">Services</a>
              <Link to="/login" className="block px-3 py-2 text-gray-300 hover:text-white">Partner Login</Link>
              <Link to="/register-player" className="block px-3 py-2 text-emerald-500 font-bold">Start Playing</Link>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl z-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Online Gaming
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Experience the thrill of next-gen casino games. Secure, fair, and built for winners. Join thousands of players worldwide today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register-player"
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-emerald-500 transition-all shadow-lg hover:shadow-emerald-500/25"
            >
              Register Now <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShieldCheck className="text-emerald-400" size={32} />}
              title="Secure & Fair"
              desc="Licensed tenants and certified RNGs ensure a safe gaming environment for all players."
            />
            <FeatureCard 
              icon={<Gamepad2 className="text-purple-400" size={32} />}
              title="Premium Games"
              desc="Access thousands of top-tier slots and live dealer games from world-class providers."
            />
            <FeatureCard 
              icon={<Globe className="text-blue-400" size={32} />}
              title="Global Access"
              desc="Play from anywhere. We support multiple currencies and languages tailored to your region."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all hover:bg-white/10">
      <div className="mb-4 bg-gray-800 w-14 h-14 rounded-xl flex items-center justify-center border border-white/5">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}