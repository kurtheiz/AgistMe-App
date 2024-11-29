import { Fragment, ReactNode, useEffect } from 'react';
import { Dialog, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon } from '../Icons';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  slideFrom?: 'left' | 'right' | 'top' | 'bottom';
}

const sizeClasses = {
  sm: 'md:max-w-sm',
  md: 'md:max-w-md',
  lg: 'md:max-w-lg',
  xl: 'md:max-w-xl',
  full: 'md:max-w-full'
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  headerContent,
  footerContent,
  showCloseButton = true,
  size = 'md',
  slideFrom = 'right'
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
          <div className="fixed inset-0 bg-black/25 dark:bg-black/50" />
        </TransitionChild>
  
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center">
            {/* Modal panel */}
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
              <Dialog.Panel 
                className={`modal-panel w-full ${sizeClasses[size]} h-[100dvh] md:h-auto md:max-h-[85vh] md:rounded-lg overflow-hidden bg-white dark:bg-neutral-900 shadow-xl`}
              >
                <div className="flex flex-col h-full">
                  {/* Header */}
                  {(title || headerContent || showCloseButton) && (
                    <div className="flex-none sticky top-0 z-50 bg-primary-500 dark:bg-primary-600 border-b border-primary-600 dark:border-primary-700">
                      <div className="flex items-center justify-between px-4 py-4">
                        {title && (
                          <Dialog.Title as="h3" className="text-lg font-medium text-white">
                            {title}
                          </Dialog.Title>
                        )}
                        {headerContent}
                        {showCloseButton && (
                          <button
                            onClick={onClose}
                            className="rounded-md p-2 text-primary-100 hover:text-white dark:text-primary-200 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-primary-500"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
  
                  {/* Content */}
                  <div className="flex-1 overflow-y-auto">
                    {children}
                  </div>
  
                  {/* Footer */}
                  {footerContent && (
                    <div className="flex-none sticky bottom-0 z-50 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 px-4 py-3">
                      {footerContent}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
