import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

export type StatusType = 'pending' | 'submitted' | 'failed' | 'approved' | 'rejected' | 'processing';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const STATUS_CONFIG: Record<StatusType, { 
  label: string; 
  icon: React.ReactNode; 
  bgColor: string; 
  textColor: string;
  borderColor: string;
}> = {
  pending: {
    label: 'Under Review',
    icon: <Clock className="w-3.5 h-3.5" />,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  submitted: {
    label: 'Submitted',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  approved: {
    label: 'Approved',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  failed: {
    label: 'Action Required',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  rejected: {
    label: 'Rejected',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  processing: {
    label: 'Processing',
    icon: <Loader2 className="w-3.5 h-3.5" />,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
};

export default function StatusBadge({ status, size = 'md', animate = true }: StatusBadgeProps) {
  const normalizedStatus = (status.toLowerCase() as StatusType) in STATUS_CONFIG 
    ? (status.toLowerCase() as StatusType)
    : 'pending';
  
  const config = STATUS_CONFIG[normalizedStatus];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const content = (
    <span className={`
      inline-flex items-center font-medium rounded-full border
      ${sizeClasses[size]}
      ${config.bgColor}
      ${config.textColor}
      ${config.borderColor}
    `}>
      <span className={iconSizes[size]}>
        {config.icon}
      </span>
      {config.label}
    </span>
  );

  if (!animate) {
    return content;
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {content}
    </motion.span>
  );
}

// Simple dot-only version for compact spaces
export function StatusDot({ status }: { status: StatusType | string }) {
  const colors: Record<StatusType, string> = {
    pending: 'bg-amber-500',
    submitted: 'bg-green-500',
    approved: 'bg-green-500',
    failed: 'bg-red-500',
    rejected: 'bg-red-500',
    processing: 'bg-blue-500',
  };

  const normalizedStatus = (status.toLowerCase() as StatusType) in colors 
    ? (status.toLowerCase() as StatusType)
    : 'pending';

  return (
    <span className={`
      inline-block w-2.5 h-2.5 rounded-full ${colors[normalizedStatus]}
      ${normalizedStatus === 'processing' ? 'animate-pulse' : ''}
    `} />
  );
}
