import { MinusIcon, PlusIcon } from 'lucide-react';

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

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          {label}
        </label>
      )}
      <div className="flex items-center justify-center space-x-4">
        <button
          type="button"
          className={`w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 touch-none
            ${disabled || value <= min ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={decrement}
          disabled={disabled || value <= min}
        >
          <MinusIcon className="h-5 w-5" />
        </button>
        <div className="text-3xl font-semibold text-neutral-900 dark:text-white min-w-[3ch] text-center">
          {formatValue(value)}
        </div>
        <button
          type="button"
          className={`w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 touch-none
            ${disabled || value >= max ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={increment}
          disabled={disabled || value >= max}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
