import { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
  width?: string;
}

export function Dropdown({ 
  trigger, 
  content, 
  className = '',
  align = 'right',
  width = 'w-96'
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <>
          <div className="hidden md:block">
            <div 
              className={`
                absolute mt-2
                ${align === 'right' ? 'right-0' : 'left-0'}
                ${width}
                bg-white rounded-md shadow-lg z-50
              `}
              style={{ 
                maxHeight: 'calc(100vh - 200px)',
                overflowY: 'auto'
              }}
            >
              {content}
            </div>
          </div>
          <div className="md:hidden fixed left-0 right-0 z-50">
            <div 
              className="
                bg-white shadow-lg w-full border-t
                mx-auto px-4
              "
              style={{ 
                maxHeight: 'calc(100vh - 200px)',
                overflowY: 'auto'
              }}
            >
              {content}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
