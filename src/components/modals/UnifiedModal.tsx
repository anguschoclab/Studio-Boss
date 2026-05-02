import React from 'react';
import { cn } from '@/lib/utils';
import { X, LucideIcon } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface UnifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  preventClose?: boolean;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] h-[90vh]',
};

export const UnifiedModal: React.FC<UnifiedModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  size = 'md',
  children,
  footer,
  showCloseButton = true,
  preventClose = false,
  className,
}) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, preventClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => !preventClose && onClose()}
          />

          {/* Modal */}
          <m.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
            className={cn(
              'relative z-10 w-full bg-black/95 border border-white/10 rounded-none shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col',
              sizeClasses[size],
              size === 'full' && 'flex flex-col h-[90vh]',
              className
            )}
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0" />
            
            {/* Header */}
            <div className={cn('flex items-center p-8 border-b border-white/5 bg-white/[0.01]', showCloseButton && !preventClose ? 'justify-between' : '')}>
              <div className="flex items-center gap-5 flex-1">
                {Icon && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-none shadow-[0_0_20px_rgba(var(--primary),0.1)]">
                    <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                )}
                <div className="space-y-1">
                  <h2 className="font-display font-black text-2xl tracking-tighter uppercase italic text-foreground drop-shadow-2xl">
                    {title.toUpperCase()}
                  </h2>
                  {subtitle && (
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">
                      {subtitle.toUpperCase()}
                    </p>
                  )}
                </div>
              </div>

              {showCloseButton && !preventClose && (
                <button
                  onClick={onClose}
                  className="h-10 w-10 border border-white/5 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground/40 hover:text-primary transition-all duration-700 flex items-center justify-center group"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-700" strokeWidth={1} />
                </button>
              )}
            </div>

            {/* Content */}
            <div className={cn('flex-1 overflow-auto p-8 custom-scrollbar', size === 'full' && 'flex-1')}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-8 border-t border-white/5 bg-black/40">
                {footer}
              </div>
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UnifiedModal;
