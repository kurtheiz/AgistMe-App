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
  const incrementInterval = useRef<NodeJS.Timer | null>(null);
  const decrementInterval = useRef<NodeJS.Timer | null>(null);
  const holdTimeout = useRef<NodeJS.Timer | null>(null);

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
    let timer: NodeJS.Timer | null = null;

    if (isIncrementing && value < max) {
      timer = setInterval(increment, 50); // Super fast continuous increment (20 changes per second)
      incrementInterval.current = timer;
    } else if (isDecrementing && value > min) {
      timer = setInterval(decrement, 50); // Super fast continuous decrement (20 changes per second)
      decrementInterval.current = timer;
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isIncrementing, isDecrementing, value, max, min, step, increment, decrement]);

  const startIncrement = () => {
    if (!disabled && value < max) {
      increment(); // Immediate single increment
      holdTimeout.current = setTimeout(() => {
        setIsIncrementing(true);
      }, 500); // Start rapid increment after 500ms hold
    }
  };

  const startDecrement = () => {
    if (!disabled && value > min) {
      decrement(); // Immediate single decrement
      holdTimeout.current = setTimeout(() => {
        setIsDecrementing(true);
      }, 500); // Start rapid decrement after 500ms hold
    }
  };

  const stopIncrement = () => {
    setIsIncrementing(false);
    if (incrementInterval.current) {
      clearInterval(incrementInterval.current);
      incrementInterval.current = null;
    }
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
  };

  const stopDecrement = () => {
    setIsDecrementing(false);
    if (decrementInterval.current) {
      clearInterval(decrementInterval.current);
      decrementInterval.current = null;
    }
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
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
