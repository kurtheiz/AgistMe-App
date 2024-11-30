import { MinusIcon, PlusIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
  formatValue?: (value: number) => string;
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  label,
  disabled = false,
  formatValue = (value) => value.toString()
}: NumberStepperProps) {
  const [isIncrementing, setIsIncrementing] = useState(false);
  const [isDecrementing, setIsDecrementing] = useState(false);
  const incrementInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const decrementInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedUpTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [intervalDelay, setIntervalDelay] = useState(200); // Start with slower speed

  const increment = () => {
    if (value + step <= max) {
      onChange(value + step);
    }
  };

  const decrement = () => {
    if (value - step >= min) {
      onChange(value - step);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    if ((isIncrementing && value < max) || (isDecrementing && value > min)) {
      timer = setInterval(
        isIncrementing ? increment : decrement,
        intervalDelay
      );
      
      if (isIncrementing) {
        incrementInterval.current = timer;
      } else {
        decrementInterval.current = timer;
      }

      // Gradually speed up after 2 seconds of holding
      if (intervalDelay > 50) {
        speedUpTimeout.current = setTimeout(() => {
          setIntervalDelay(prev => Math.max(50, prev - 50));
        }, 500);
      }
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
      if (speedUpTimeout.current) {
        clearTimeout(speedUpTimeout.current);
      }
    };
  }, [isIncrementing, isDecrementing, value, max, min, step, intervalDelay]);

  const startIncrement = () => {
    if (!disabled && value < max) {
      increment(); // Immediate single increment
      setIntervalDelay(200); // Reset to initial speed
      holdTimeout.current = setTimeout(() => {
        setIsIncrementing(true);
      }, 750); // Longer initial delay before rapid increment
    }
  };

  const startDecrement = () => {
    if (!disabled && value > min) {
      decrement(); // Immediate single decrement
      setIntervalDelay(200); // Reset to initial speed
      holdTimeout.current = setTimeout(() => {
        setIsDecrementing(true);
      }, 750); // Longer initial delay before rapid decrement
    }
  };

  const stopIncrement = () => {
    setIsIncrementing(false);
    setIntervalDelay(200); // Reset speed
    if (incrementInterval.current) {
      clearInterval(incrementInterval.current);
      incrementInterval.current = null;
    }
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
    if (speedUpTimeout.current) {
      clearTimeout(speedUpTimeout.current);
      speedUpTimeout.current = null;
    }
  };

  const stopDecrement = () => {
    setIsDecrementing(false);
    setIntervalDelay(200); // Reset speed
    if (decrementInterval.current) {
      clearInterval(decrementInterval.current);
      decrementInterval.current = null;
    }
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
    if (speedUpTimeout.current) {
      clearTimeout(speedUpTimeout.current);
      speedUpTimeout.current = null;
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onMouseDown={startDecrement}
          onMouseUp={stopDecrement}
          onMouseLeave={stopDecrement}
          onTouchStart={startDecrement}
          onTouchEnd={stopDecrement}
          disabled={disabled || value <= min}
          className={`h-8 w-8 flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200
            ${disabled || value <= min
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
        >
          <MinusIcon className="w-4 h-4" />
        </button>
        <div className="w-12 text-center font-medium text-neutral-700 dark:text-neutral-200">
          {formatValue(value)}
        </div>
        <button
          type="button"
          onMouseDown={startIncrement}
          onMouseUp={stopIncrement}
          onMouseLeave={stopIncrement}
          onTouchStart={startIncrement}
          onTouchEnd={stopIncrement}
          disabled={disabled || value >= max}
          className={`h-8 w-8 flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200
            ${disabled || value >= max
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
