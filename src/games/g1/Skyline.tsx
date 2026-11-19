import React from 'react';

interface SkylineProps {
  wealth: number;
  influence: number;
  welfare: number;
  heat: number;
}

export const Skyline: React.FC<SkylineProps> = ({ welfare, heat }) => {
  const skyColor = welfare > 50 ? '#F5F2EB' : '#E8E3D8';
  const sunOpacity = Math.max(0.1, welfare / 100);
  
  // Calculate how many windows are lit based on welfare (0 to 15)
  const litCount = Math.floor((welfare / 100) * 15);

  // Define building paths
  const backPath = "M0,300 L0,120 L40,120 L40,80 L80,80 L80,140 L120,140 L120,60 L160,60 L160,150 L200,150 L200,90 L240,90 L240,180 L280,180 L280,70 L320,70 L320,130 L360,130 L360,50 L400,50 L400,110 L440,110 L440,160 L480,160 L480,80 L520,80 L520,100 L560,100 L560,40 L600,40 L600,130 L640,130 L640,70 L680,70 L680,150 L720,150 L720,60 L760,60 L760,110 L800,110 L800,180 L840,180 L840,90 L880,90 L880,140 L920,140 L920,60 L960,60 L960,120 L1000,120 L1000,300 Z";
  const midPath = "M0,300 L0,180 L60,180 L60,130 L120,130 L120,200 L180,200 L180,150 L240,150 L240,220 L300,220 L300,140 L360,140 L360,190 L420,190 L420,160 L480,160 L480,210 L540,210 L540,150 L600,150 L600,230 L660,230 L660,170 L720,170 L720,200 L780,200 L780,140 L840,140 L840,190 L900,190 L900,160 L960,160 L960,210 L1000,210 L1000,300 Z";
  const frontPath = "M0,300 L0,240 L80,240 L80,200 L160,200 L160,260 L240,260 L240,220 L320,220 L320,270 L400,270 L400,210 L480,210 L480,250 L560,250 L560,200 L640,200 L640,260 L720,260 L720,220 L800,220 L800,270 L880,270 L880,230 L960,230 L960,250 L1000,250 L1000,300 Z";

  // Window coordinates (x, y) to distribute across the buildings
  const windows = [
    // Back layer windows
    { x: 50, y: 100, layer: 1 }, { x: 100, y: 100, layer: 1 }, { x: 140, y: 80, layer: 1 },
    { x: 220, y: 110, layer: 1 }, { x: 300, y: 90, layer: 1 }, { x: 380, y: 70, layer: 1 },
    { x: 450, y: 130, layer: 1 }, { x: 510, y: 110, layer: 1 }, { x: 580, y: 60, layer: 1 },
    { x: 660, y: 90, layer: 1 }, { x: 740, y: 80, layer: 1 }, { x: 820, y: 130, layer: 1 },
    { x: 900, y: 110, layer: 1 },
    // Front layer windows
    { x: 100, y: 220, layer: 2 }, { x: 260, y: 240, layer: 2 }, { x: 340, y: 240, layer: 2 },
    { x: 440, y: 230, layer: 2 }, { x: 600, y: 220, layer: 2 }, { x: 740, y: 240, layer: 2 },
    { x: 900, y: 250, layer: 2 },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl border border-[var(--line)] shadow-inner">
      {/* Sky */}
      <div className="absolute inset-0 transition-colors duration-1000" style={{ backgroundColor: skyColor }} />
      
      {/* Sun / Moon */}
      <div 
        className="absolute top-8 right-16 w-16 h-16 rounded-full bg-[#FDE047] blur-[2px] transition-opacity duration-1000"
        style={{ opacity: sunOpacity }}
      />

      {/* SVG Skyline */}
      <svg className="absolute bottom-0 w-full h-[90%]" viewBox="0 0 1000 300" preserveAspectRatio="none">
        {/* Back Buildings */}
        <path d={backPath} fill="#E0DCD3" />
        {/* Mid Buildings */}
        <path d={midPath} fill="#C2BCB1" />
        {/* Front Buildings */}
        <path d={frontPath} fill="#8C877B" />

        {/* Windows */}
        {windows.map((w, i) => (
          <rect 
            key={i} 
            x={w.x} 
            y={w.y} 
            width="8" 
            height="12" 
            rx="1"
            fill={i < litCount ? '#FDE047' : '#6B665C'} 
            className="transition-colors duration-1000"
          />
        ))}
      </svg>

      {/* Heat Searchlights */}
      {heat > 30 && (
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-60">
           <div 
            className="absolute bottom-0 left-1/4 w-2 h-[400px] bg-gradient-to-t from-red-600 to-transparent origin-bottom transition-transform duration-1000"
            style={{ 
              transform: `rotate(${Math.sin(Date.now() / 800) * 25}deg)`,
              boxShadow: '0 0 40px 10px rgba(220, 38, 38, 0.4)'
            }}
          />
           <div 
            className="absolute bottom-0 right-1/4 w-2 h-[400px] bg-gradient-to-t from-red-600 to-transparent origin-bottom transition-transform duration-1000"
            style={{ 
              transform: `rotate(${Math.sin(Date.now() / 1000 + 2) * 30}deg)`,
              boxShadow: '0 0 40px 10px rgba(220, 38, 38, 0.4)'
            }}
          />
        </div>
      )}
    </div>
  );
};
