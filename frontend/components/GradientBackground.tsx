import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GradientBackgroundProps {
  children: ReactNode;
  className?: string;
}

export default function GradientBackground({ children, className = '' }: GradientBackgroundProps) {
  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* Base background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-orange-50/30" />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,153,51,0.08) 0%, transparent 70%)',
          top: '10%',
          left: '-20%',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)',
          top: '40%',
          right: '-10%',
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />
      
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(13,148,136,0.05) 0%, transparent 70%)',
          bottom: '10%',
          left: '30%',
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 10,
        }}
      />

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Simpler static version for performance
export function StaticGradientBackground({ children, className = '' }: GradientBackgroundProps) {
  return (
    <div 
      className={`min-h-screen ${className}`}
      style={{
        background: `
          radial-gradient(ellipse at 20% 80%, rgba(255,153,51,0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(14,165,233,0.05) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(13,148,136,0.03) 0%, transparent 70%),
          #f8fafc
        `,
      }}
    >
      {children}
    </div>
  );
}
