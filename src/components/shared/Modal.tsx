import { Fragment, ReactNode, useEffect } from 'react';
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react';
import { X, Loader2, Search, Save, Sparkles } from 'lucide-react';

export type ActionIconType = 'SEARCH' | 'SAVE' | 'AI' | 'CUSTOM';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  headerContent?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'wide' | 'full';
  slideFrom?: 'left' | 'right' | 'top' | 'bottom';
  isUpdating: boolean;
  actionIconType?: ActionIconType;
  actionIcon?: ReactNode;
  onAction?: () => void;
  disableAction?: boolean;
  actionLabel?: string;
  cancelLabel?: string;
}

const sizeClasses = {
  sm: 'md:max-w-sm',
  md: 'md:max-w-md',
  lg: 'md:max-w-lg',
  xl: 'md:max-w-xl',
  wide: 'md:max-w-3xl',
  full: 'md:max-w-full'
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  headerContent,
  size = 'md',
  slideFrom = 'right',
  isUpdating = false,
  actionIconType,
  actionIcon,
  onAction,
  disableAction,
  actionLabel,
  cancelLabel,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Check if content will cause overflow
      const modalContent = document.querySelector('[role="dialog"]');
      const hasScrollbar = modalContent && modalContent.scrollHeight > window.innerHeight;
      
      if (hasScrollbar) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
          document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
      }
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('overflow-hidden');
    } else {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('overflow-hidden');
      document.body.style.paddingRight = '';
      document.documentElement.style.setProperty('--scrollbar-width', '0px');
    }

    return () => {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('overflow-hidden');
      document.body.style.paddingRight = '';
      document.documentElement.style.setProperty('--scrollbar-width', '0px');
    };
  }, [isOpen]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500/25" />
        </TransitionChild>
  
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-gray-500/25">
          <div className="flex min-h-full items-end sm:items-center justify-center p-0">
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-out duration-300"
              enterFrom={
                slideFrom === 'right'
                  ? 'translate-x-full'
                  : slideFrom === 'left'
                  ? '-translate-x-full'
                  : slideFrom === 'bottom'
                  ? 'translate-y-full'
                  : '-translate-y-full'
              }
              enterTo="translate-x-0 translate-y-0"
              leave="transform transition ease-in duration-200"
              leaveFrom="translate-x-0 translate-y-0"
              leaveTo={
                slideFrom === 'right'
                  ? 'translate-x-full'
                  : slideFrom === 'left'
                  ? '-translate-x-full'
                  : slideFrom === 'bottom'
                  ? 'translate-y-full'
                  : '-translate-y-full'
              }
            >
              <DialogPanel 
                className={`w-full transform overflow-hidden h-[100dvh] md:h-auto md:max-h-[95vh] ${sizeClasses[size]} rounded-none md:rounded-2xl bg-white shadow-xl flex flex-col`}
              >
                <div className="flex flex-col h-full flex-grow">
                  {/* Header */}
                  {title && (
                    <div className="flex items-center px-4 py-2.5 sm:px-6 bg-primary-500 border-b border-primary-600 rounded-none md:rounded-t-2xl">
                      <h2 className="text-base font-medium text-white">
                        {title}
                      </h2>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                      {children}
                    </div>
                  </div>

                  {/* Sticky Footer */}
                  <div className="border-t border-neutral-200 bg-white px-4 py-3 sm:px-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="flex-1 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 border border-neutral-300 rounded-lg"
                      onClick={onClose}
                    >
                      {cancelLabel || 'Cancel'}
                    </button>
                    {onAction && (
                      <button
                        type="button"
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onAction}
                        disabled={disableAction || isUpdating}
                      >
                        {isUpdating ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          actionLabel || 'Save'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
