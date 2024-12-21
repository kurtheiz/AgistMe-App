import { MinusIcon, PlusIcon } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  formatValue?: (value: number) => string;
}

export default function NumberStepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  label,
  disabled = false,
  formatValue = (value) => value.toString()
}: NumberStepperProps) {
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const longPressRef = useRef(false);
  const valueRef = useRef(value);
  const lastTriggerRef = useRef(0);

  // Keep valueRef in sync with value prop
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const startCounting = useCallback((increment: boolean) => {
    const now = Date.now();
    if (intervalRef.current || disabled || now - lastTriggerRef.current < 200) return;
    lastTriggerRef.current = now;
    
    // Initial change
    const newValue = valueRef.current + (increment ? step : -step);
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
    
    // Start accelerating after holding
    let holdTime = 0;
    intervalRef.current = setInterval(() => {
      holdTime += 250;
      
      // Increase speed based on hold duration
      if (holdTime > 1500) {
        setSpeed(prev => Math.min(prev + 1, 10));
      }
      
      const nextValue = valueRef.current + (increment ? step * speed : -step * speed);
      if (nextValue >= min && nextValue <= max) {
        onChange(nextValue);
      }
    }, 250);
    
    longPressRef.current = true;
  }, [step, speed, min, max, onChange, disabled]);

  const stopCounting = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSpeed(1);
    longPressRef.current = false;
  }, []);

  const handleInteractionStart = useCallback((increment: boolean) => {
    startCounting(increment);
  }, [startCounting]);

  const handleInteractionEnd = useCallback(() => {
    stopCounting();
  }, [stopCounting]);

  const handleMouseDown = useCallback((increment: boolean) => {
    if (!disabled) {
      handleInteractionStart(increment);
    }
  }, [handleInteractionStart, disabled]);

  const handleMouseUp = useCallback(() => {
    handleInteractionEnd();
  }, [handleInteractionEnd]);

  const handleTouchStart = useCallback((_: React.TouchEvent, increment: boolean) => {
    if (!disabled) {
      handleInteractionStart(increment);
    }
  }, [handleInteractionStart, disabled]);

  const handleTouchEnd = useCallback(() => {
    handleInteractionEnd();
  }, [handleInteractionEnd]);

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(formatValue(value));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const newValue = parseInt(inputValue);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    } else {
      setInputValue(formatValue(value));
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(formatValue(value));
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}
      <div className="flex items-center justify-center space-x-4">
        <button
          type="button"
          className={`w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 touch-none select-none
            ${disabled || value <= min ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={disabled || value <= min}
          onMouseDown={() => !disabled && value > min && handleMouseDown(false)}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={() => !disabled && value > min && handleTouchStart({} as React.TouchEvent, false)}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          style={{ touchAction: 'manipulation' }}
        >
          <MinusIcon className="h-5 w-5" />
        </button>
        {isEditing ? (
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="text-3xl font-semibold text-neutral-900 w-[3ch] text-center bg-transparent border-b-2 border-primary-500 focus:outline-none"
            autoFocus
          />
        ) : (
          <div 
            className="text-3xl font-semibold text-neutral-900 w-[3ch] text-center cursor-text"
            onClick={() => !disabled && setIsEditing(true)}
          >
            {formatValue(value)}
          </div>
        )}
        <button
          type="button"
          className={`w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 touch-none select-none
            ${disabled || value >= max ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={disabled || value >= max}
          onMouseDown={() => !disabled && value < max && handleMouseDown(true)}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={() => !disabled && value < max && handleTouchStart({} as React.TouchEvent, true)}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          style={{ touchAction: 'manipulation' }}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
