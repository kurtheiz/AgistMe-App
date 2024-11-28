interface BadgeProps {
  color: 'blue' | 'emerald' | 'amber' | 'red';
  text: string;
}

const colors = {
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export const Badge = ({ color, text }: BadgeProps) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors[color]}`}>
      {text}
    </span>
  );
};
