import { Fragment, ReactNode, useEffect, useState } from 'react';
import { Dialog, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon } from '../Icons';
import { Loader2 } from 'lucide-react';

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
  isUpdating: boolean;
  actionIcon?: ReactNode;
  onAction?: () => void;
  disableAction?: boolean;
  isDirty?: boolean;
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
  isUpdating = false,
  actionIcon,
  onAction,
  disableAction,
  isDirty = false
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
          <div className="flex min-h-full items-center justify-center p-0">
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
                className={`w-full transform h-[100dvh] md:h-auto md:max-h-[85vh] ${sizeClasses[size]} rounded-none md:rounded-2xl bg-white shadow-xl flex flex-col`}
              >
                <div className="flex flex-col h-full flex-grow">
                  {/* Header */}
                  {(title || headerContent || showCloseButton || actionIcon) && (
                    <div className="flex items-center justify-between px-4 py-4 sm:px-6 bg-primary-500 border-b border-primary-600 rounded-none md:rounded-t-2xl">
                      <div className="flex items-center space-x-2">
                        {actionIcon && onAction && (
                          <button
                            onClick={onAction}
                            className="rounded-md p-2 text-primary-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!isDirty || isUpdating || disableAction}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              actionIcon
                            )}
                          </button>
                        )}
                      </div>
                      <h2 className="text-lg font-medium text-white flex-1 text-center">
                        {title}
                      </h2>
                      <div className="flex items-center space-x-2">
                        {showCloseButton && (
                          <button
                            type="button"
                            className="rounded-md p-2 text-primary-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={onClose}
                          >
                            <span className="sr-only">Close</span>
                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-8">
                      {children}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
