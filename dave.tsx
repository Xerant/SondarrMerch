import React, { useState } from 'react';
import { ShieldAlert, Zap, Play, LayoutGrid, Music, ShoppingCart, Share2 } from 'lucide-react';

const MayhemPlatform = () => {
  const [isWalletConnected, setWalletConnected] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0510] text-[#e0def4] selection:bg-[#ebbcba] selection:text-[#191724]">
      {/* 1. EPIC NAVIGATION (Purple Glassmorphism) */}
      <nav className="fixed w-full z-50 border-b border-[#31748f]/30 bg-[#191724]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#eb6f92] p-1 shadow-[0_0_15px_#eb6f92]">
              <img src="/skull-logo.png" alt="Mayhem Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-[#eb6f92] uppercase italic">
              Five Minutes To Mayhem
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-bold text-sm uppercase tracking-widest">
            <a href="#" className="hover:text-[#eb6f92] transition">Live</a>
            <a href="#" className="hover:text-[#f6c177] transition">On-Demand</a>
            <a href="#" className="hover:text-[#9ccfd8] transition">Merch</a>
            <button 
              onClick={() => setWalletConnected(!isWalletConnected)}
              className="bg-[#c4a7e7] text-[#191724] px-6 py-2 rounded-full hover:shadow-[0_0_20px_#c4a7e7] transition duration-300 flex items-center gap-2"
            >
              <Zap size={16} fill="currentColor" />
              {isWalletConnected ? 'Connected: XRP' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION (Mayhem Visualizer) */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(49,116,143,0.15),_transparent)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#eb6f92]/10 border border-[#eb6f92]/30 rounded text-[#eb6f92] text-xs font-bold uppercase mb-6 tracking-widest">
              <ShieldAlert size={14} /> 100% Human Content Verified
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase italic leading-[0.9] text-transparent bg-clip-text bg-gradient-to-r from-[#eb6f92] via-[#f6c177] to-[#ebbcba] drop-shadow-2xl">
              Unleash <br /> The Mayhem
            </h1>
            <p className="mt-6 text-lg text-[#908caa] max-w-lg font-medium leading-relaxed">
              The world's first Human-Only high-fidelity streaming platform. No AI. No Algorithms. Just original noise from Five Minutes to Mayhem.
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <button className="bg-[#eb6f92] text-white px-10 py-4 rounded font-black uppercase tracking-tighter hover:scale-105 transition-transform flex items-center gap-3">
                <Play fill="white" /> Start Streaming
              </button>
              <a href="https://www.tiktok.com/@fiveminutestomayhem" target="_blank" className="border border-[#31748f] px-10 py-4 rounded font-black uppercase tracking-tighter hover:bg-[#31748f]/20 transition flex items-center gap-3">
                <Share2 size={18} /> TikTok Feed
              </a>
            </div>
          </div>

          {/* Featured Content Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#eb6f92] to-[#c4a7e7] rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-[#1f1d2e] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              <img src="/stage-shot-lasers.png" alt="Featured" className="w-full aspect-video object-cover opacity-80 group-hover:opacity-100 transition" />
              <div className="p-6">
                <h3 className="text-xl font-bold italic text-[#f6c177]">LIVE FROM THE PIT</h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm font-mono text-[#9ccfd8]">2.5K Viewers</span>
                  <div className="flex gap-2">
                    <span className="bg-[#ebbcba]/10 text-[#ebbcba] px-2 py-1 text-[10px] font-bold rounded border border-[#ebbcba]/30">4K ULTRA HD</span>
                    <span className="bg-[#31748f]/10 text-[#31748f] px-2 py-1 text-[10px] font-bold rounded border border-[#31748f]/30">XRP PAYABLE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. XRP MONETIZATION / TIPPING BAR */}
      <section className="bg-[#191724] border-y border-[#31748f]/20 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#c4a7e7]/10 rounded-full text-[#c4a7e7]">
              <Zap size={32} />
            </div>
            <div>
              <h4 className="font-bold text-xl">Artist Direct Monetization</h4>
              <p className="text-sm text-[#6e6a86]">Powered by XRP Ledger. 0% Platform Fees on Tips.</p>
            </div>
          </div>
          <div className="flex gap-3">
            {[1, 5, 10, 50].map((amount) => (
              <button key={amount} className="w-20 h-12 border border-[#c4a7e7]/40 rounded font-mono hover:bg-[#c4a7e7] hover:text-[#191724] transition font-bold">
                {amount} XRP
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CONTENT GRID (The "Veeps" Layout) */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">On-Demand Mayhem</h2>
          <div className="flex gap-2">
            <button className="p-2 bg-[#26233a] rounded hover:text-[#eb6f92]"><LayoutGrid /></button>
            <button className="p-2 bg-[#26233a] rounded hover:text-[#eb6f92]"><Music /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1f1d2e] rounded-lg overflow-hidden border border-white/5 group hover:border-[#eb6f92]/50 transition duration-500">
              <div className="relative aspect-video">
                <img src={/thumbnail-${i}.png} alt="Video" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Play size={48} className="text-[#eb6f92]" fill="currentColor" />
                </div>
              </div>
              <div className="p-5">
                <p className="text-[#ebbcba] text-xs font-bold mb-1 tracking-widest uppercase">Official Video</p>
                <h3 className="text-lg font-bold">Five Minutes to Mayhem: Episode {i}</h3>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 5. FOOTER */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-[#6e6a86]">© 2024 FIVEMINUTESTOMAYHEM.COM | NO AI GENERATED MEDIA PERMITTED</p>
        </div>
      </footer>
    </div>
  );
};

export default MayhemPlatform;