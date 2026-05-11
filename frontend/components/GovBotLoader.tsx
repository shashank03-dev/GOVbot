import { motion } from 'framer-motion';

interface GovBotLoaderProps {
  message?: string;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function GovBotLoader({ 
  message = 'Connecting to government systems...', 
  progress,
  size = 'md' 
}: GovBotLoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Animated Spinner */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#ff9933]/20"
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
            <div className={`${dotSizeClasses[size]} bg-[#ff9933] rounded-full`} />
          </div>
        </motion.div>

        {/* Middle ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-[#138808]/20"
          animate={{ rotate: -360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
            <div className={`${dotSizeClasses[size]} bg-[#138808] rounded-full`} />
          </div>
        </motion.div>

        {/* Inner ring */}
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-[#00d4ff]/20"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
            <div className={`${dotSizeClasses[size]} bg-[#00d4ff] rounded-full`} />
          </div>
        </motion.div>

        {/* Center dot */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className={`${dotSizeClasses[size]} bg-[#ff9933] rounded-full`} />
        </motion.div>
      </div>

      {/* Message */}
      <motion.p
        className="mt-6 text-slate-500 text-sm text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="mt-4 w-48">
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#ff9933] via-[#138808] to-[#00d4ff]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">
            {progress}%
          </p>
        </div>
      )}

      {/* Pulsing dots */}
      <div className="flex gap-1 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-[#ff9933] rounded-full"
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Simple inline loader for buttons/compact spaces
export function GovBotSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  
  return (
    <motion.div
      className={`${sizeClass} border-2 border-slate-200 border-t-[#ff9933] rounded-full`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}
