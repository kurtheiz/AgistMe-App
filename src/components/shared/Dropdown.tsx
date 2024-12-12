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
        <div 
          className={`
            md:absolute fixed md:${align === 'right' ? '-right-32' : 'left-0'} mt-2 
            left-0 right-0 md:left-auto md:right-auto
            md:${width}
            bg-white rounded-md shadow-lg z-50
          `}
          style={{ 
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto'
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
