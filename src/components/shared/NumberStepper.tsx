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
  
  // Keep valueRef in sync with value prop
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  
  const startCounting = useCallback((increment: boolean) => {
    if (intervalRef.current || disabled) return;
    
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
  
  const handleMouseDown = useCallback((increment: boolean) => {
    startCounting(increment);
  }, [startCounting]);
  
  const handleMouseUp = useCallback(() => {
    stopCounting();
  }, [stopCounting]);
  
  const handleTouchStart = useCallback((e: React.TouchEvent, increment: boolean) => {
    e.preventDefault(); // Prevent mouse events from firing
    startCounting(increment);
  }, [startCounting]);
  
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent mouse events from firing
    stopCounting();
  }, [stopCounting]);

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
          className={`w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 touch-none
            ${disabled || value <= min ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={disabled || value <= min}
          onMouseDown={() => !disabled && value > min && handleMouseDown(false)}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={(e) => !disabled && value > min && handleTouchStart(e, false)}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <MinusIcon className="h-5 w-5" />
        </button>
        <div className="text-3xl font-semibold text-neutral-900 min-w-[3ch] text-center">
          {formatValue(value)}
        </div>
        <button
          type="button"
          className={`w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 touch-none
            ${disabled || value >= max ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={disabled || value >= max}
          onMouseDown={() => !disabled && value < max && handleMouseDown(true)}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={(e) => !disabled && value < max && handleTouchStart(e, true)}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
