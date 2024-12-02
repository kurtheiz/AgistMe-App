import { Fragment, ReactNode, useEffect, useState } from 'react';
import { Dialog, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon } from '../Icons';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  headerContent?: ReactNode;
  footerContent?: ReactNode | (({ isUpdating }: { isUpdating: boolean }) => ReactNode);
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'wide' | 'full';
  slideFrom?: 'left' | 'right' | 'top' | 'bottom';
  contentHash?: string;
  onDirtyChange?: (isDirty: boolean) => void;
  isUpdating: boolean;
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
  footerContent,
  showCloseButton = true,
  size = 'md',
  slideFrom = 'right',
  contentHash,
  onDirtyChange,
  isUpdating = false
}: ModalProps) {
  const [initialHash, setInitialHash] = useState<string | undefined>();

  // Set initial hash when modal opens
  useEffect(() => {
    if (isOpen && contentHash && !initialHash) {
      setInitialHash(contentHash);
    }
  }, [isOpen, contentHash]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInitialHash(undefined);
    }
  }, [isOpen]);

  // Check for changes when content hash updates
  useEffect(() => {
    if (initialHash && contentHash) {
      const newIsDirty = initialHash !== contentHash;
      onDirtyChange?.(newIsDirty);
    }
  }, [contentHash, initialHash, onDirtyChange]);

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
  
        <div
          className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/25 dark:bg-black/50"
        >
          <div className="flex min-h-full items-center justify-center md:p-4">
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
                className={`modal-panel w-full transform h-[100dvh] md:h-auto md:max-h-[85vh] ${sizeClasses[size]} rounded-none md:rounded-2xl overflow-hidden bg-white shadow-xl p-0`}
              >
                <div className="flex flex-col h-full md:max-h-[85vh]">
                  {/* Header */}
                  {(title || headerContent || showCloseButton) && (
                    <div className="flex-none bg-primary-500 border-b border-primary-600 rounded-none md:rounded-t-2xl">
                      <div className="flex items-center justify-between p-4">
                        {title && (
                          <Dialog.Title as="h3" className="text-lg font-medium text-white">
                            {title}
                          </Dialog.Title>
                        )}
                        {headerContent}
                        {showCloseButton && (
                          <button
                            onClick={onClose}
                            className="rounded-md p-2 text-primary-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                          >
                            <span className="sr-only">Close</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {children}
                  </div>

                  {/* Footer */}
                  {footerContent && (
                    <div className="flex-none border-t border-neutral-200 bg-white">
                      <div className="p-4">
                        {typeof footerContent === 'function' ? 
                          footerContent({ isUpdating }) : 
                          footerContent
                        }
                      </div>
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
