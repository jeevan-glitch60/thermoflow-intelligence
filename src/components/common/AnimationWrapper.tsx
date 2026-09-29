import React, { useEffect, useRef, useState } from 'react';
import { motion, MotionConfig, useReducedMotion } from 'framer-motion';

/**
 * Standard industrial SCADA / enterprise easing curve:
 * Snappy entry with smooth deceleration (cubic-bezier(0.16, 1, 0.3, 1)).
 */
export const INDUSTRIAL_EASE = [0.16, 1, 0.3, 1] as const;

export const industrialTransition = {
  duration: 0.35,
  ease: INDUSTRIAL_EASE,
};

/**
 * AnimationProvider ensures reducedMotion="user" is globally respected across all motion components.
 */
export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
};

/**
 * StaggeredContainer orchestrates clean sequential cascade of child elements (50-70ms interval).
 */
export const StaggeredContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}> = ({ children, className = '', staggerDelay = 0.06, delayChildren = 0.04 }) => {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * AnimatedCard / AnimatedItem:
 * Subtle fade-in and slide-up (10px) with optional hover elevation and tap feedback.
 */
export interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverLift?: boolean;
  interactive?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  hoverLift = false,
  interactive = false,
  onClick,
  ...props
}) => {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <div onClick={onClick} className={className} {...props}>
        {children}
      </div>
    );
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: INDUSTRIAL_EASE,
      },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={
        hoverLift || interactive
          ? {
              y: -2,
              transition: { duration: 0.15, ease: 'easeOut' },
            }
          : undefined
      }
      whileTap={interactive || onClick ? { scale: 0.985 } : undefined}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * AnimatedNumber:
 * High-performance 60fps count-up for telemetry metrics without main-thread blocking.
 */
export const AnimatedNumber: React.FC<{
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}> = ({ value, duration = 650, decimals = 0, prefix = '', suffix = '', className = '' }) => {
  const prefersReduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(prefersReduced ? value : 0);
  const startTimestampRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(prefersReduced ? value : 0);

  useEffect(() => {
    if (prefersReduced) {
      setDisplayValue(value);
      return;
    }

    const startVal = displayValue;
    startValueRef.current = startVal;
    let animFrame: number;

    const step = (timestamp: number) => {
      if (!startTimestampRef.current) startTimestampRef.current = timestamp;
      const progress = Math.min((timestamp - startTimestampRef.current) / duration, 1);

      // Ease-out cubic calculation
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (value - startVal) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animFrame = requestAnimationFrame(step);
      } else {
        startTimestampRef.current = null;
      }
    };

    animFrame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animFrame);
      startTimestampRef.current = null;
    };
  }, [value, duration, prefersReduced]);

  const formattedNumber =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString();

  return (
    <span className={className}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
};

/**
 * PulsingAlertBadge:
 * Calm, subtle industrial pulsing glow for critical alerts (red/orange box-shadow breath).
 */
export const PulsingAlertBadge: React.FC<{
  children: React.ReactNode;
  className?: string;
  severity?: 'critical' | 'warning';
}> = ({ children, className = '', severity = 'critical' }) => {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const glowColors =
    severity === 'critical'
      ? [
          '0 0 0 0 rgba(244, 63, 94, 0)',
          '0 0 0 4px rgba(244, 63, 94, 0.22)',
          '0 0 0 0 rgba(244, 63, 94, 0)',
        ]
      : [
          '0 0 0 0 rgba(245, 158, 11, 0)',
          '0 0 0 4px rgba(245, 158, 11, 0.2)',
          '0 0 0 0 rgba(245, 158, 11, 0)',
        ];

  return (
    <motion.div
      animate={{
        boxShadow: glowColors,
      }}
      transition={{
        duration: 2.8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
