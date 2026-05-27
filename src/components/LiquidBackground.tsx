import React from 'react';

export default function LiquidBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#070708]">
      {/* Background radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,120,120,0.05),transparent_50%)]" />
      
      {/* Liquid Blobs */}
      <div className="absolute top-[10%] left-[5%] md:left-[15%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-zinc-333/10 mix-blend-screen filter blur-[80px] md:blur-[120px] opacity-25 animate-liquid-move pointer-events-none" 
        style={{
          background: 'radial-gradient(circle, rgba(160,160,160,0.12) 0%, rgba(80,80,80,0.02) 60%, transparent 100%)'
        }}
      />
      
      <div className="absolute bottom-[10%] right-[5%] md:right-[15%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full mix-blend-screen filter blur-[90px] md:blur-[140px] opacity-20 animate-liquid-move-slow pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(230,230,230,0.08) 0%, rgba(120,120,120,0) 70%)'
        }}
      />

      <div className="absolute top-[40%] right-[30%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full mix-blend-screen filter blur-[100px] opacity-15 animate-pulse-slow pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(50,50,50,0) 70%)'
        }}
      />

      {/* Grid Pattern overlay with ultra thin lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Ambient noise or fine grain if desired, but minimalist clean is best */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.02),transparent_80%)] pointer-events-none" />
    </div>
  );
}
