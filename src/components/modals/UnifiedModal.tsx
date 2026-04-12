import React from 'react';
import { cn } from '@/lib/utils';
import { X, LucideIcon } from 'lucide-react';
import { tokens } from '@/lib/tokens';
import { Button } from '@/components/ui/button';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !preventClose && onClose()}
          />

          {/* Modal */}
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'relative z-10 w-full bg-card rounded-xl shadow-2xl overflow-hidden flex flex-col',
              sizeClasses[size],
              size === 'full' && 'flex flex-col',
              className
            )}
          >
            {/* Header */}
            <div className={cn('flex items-start justify-between p-5 border-b', tokens.border.default)}>
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className={cn('p-2 rounded-lg bg-primary/10', tokens.border.default)}>
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div>
                  <h2 className={cn('font-bold text-lg', tokens.text.heading)}>{title}</h2>
                  {subtitle && <p className={tokens.text.caption}>{subtitle}</p>}
                </div>
              </div>

              {showCloseButton && !preventClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Content */}
            <div className={cn('flex-1 overflow-auto p-5', size === 'full' && 'flex-1')}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className={cn('p-5 border-t', tokens.border.default, 'bg-muted/30')}>
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
