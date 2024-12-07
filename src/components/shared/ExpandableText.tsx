import React, { useState, useRef, useEffect } from 'react';

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

interface ExpandableTextProps {
  text: string;
  mobileThreshold?: number;
  desktopThreshold?: number;
  className?: string;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({ 
  text,
  mobileThreshold = 150,
  desktopThreshold = 300,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery('(min-width: 640px)');
  const shouldShowMore = isDesktop ? text.length > desktopThreshold : text.length > mobileThreshold;

  useEffect(() => {
    if (!shouldShowMore && isExpanded) {
      setIsExpanded(false);
    }
  }, [isDesktop, shouldShowMore]);

  return (
    <div className="relative">
      <div 
        ref={contentRef}
        className={`whitespace-pre-wrap ${
          !isExpanded ? 'max-h-[4.5em] sm:max-h-[6em] overflow-hidden' : ''
        } ${className}`}
      >
        {text}
      </div>
      {!isExpanded && shouldShowMore && (
        <div className="relative">
          <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          <div className="relative z-10">
            <button
              onClick={() => setIsExpanded(true)}
              className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              Show More
            </button>
          </div>
        </div>
      )}
      {isExpanded && shouldShowMore && (
        <div className="relative z-10">
          <button
            onClick={() => setIsExpanded(false)}
            className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            Show Less
          </button>
        </div>
      )}
    </div>
  );
};
