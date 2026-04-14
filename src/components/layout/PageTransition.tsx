import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { pageTransition, subTabTransition } from '@/lib/animations';

type TransitionType = 'page' | 'subTab' | 'fade';

interface PageTransitionProps {
  /** Unique key for the content (triggers animation on change) */
  key: string;
  /** Content to animate */
  children: React.ReactNode;
  /** Type of transition */
  type?: TransitionType;
  /** Custom className for container */
  className?: string;
  /** Enable exit animations */
  enableExit?: boolean;
  /** Delay before animation starts */
  delay?: number;
}

const transitionVariants = {
  page: pageTransition,
  subTab: subTabTransition,
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
};

/**
 * PageTransition - Wrapper for page/sub-tab content transitions
 * 
 * Provides smooth animated transitions when switching between:
 * - Hubs (page transitions)
 * - Sub-tabs (subTab transitions)
 * - Any content with changing keys (fade transitions)
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  key: transitionKey,
  children,
  type = 'page',
  className,
  enableExit = true,
  delay = 0,
}) => {
  const variants = transitionVariants[type];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={transitionKey}
        variants={variants}
        initial="initial"
        animate="animate"
        exit={enableExit ? "exit" : undefined}
        transition={{ delay }}
        className={cn('w-full h-full', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Staggered children animation wrapper
 */
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className, staggerDelay = 0.05 }) => (
  <motion.div
    initial="initial"
    animate="animate"
    variants={{
      animate: {
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: 0.1,
        },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * Staggered child item
 */
export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <motion.div
    variants={{
      initial: { opacity: 0, y: 10 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.25,
          ease: [0, 0, 0.58, 1],
        },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * Animated number component
 */
export const AnimatedNumber: React.FC<{
  value: number;
  className?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
}> = ({ value, className, duration = 0.4, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    if (value !== displayValue) {
      const startTime = Date.now();
      const startValue = displayValue;
      const diff = value - startValue;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        const easeOut = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = startValue + diff * easeOut;

        setDisplayValue(Math.round(current * 100) / 100);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value, duration, displayValue]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

export default PageTransition;
