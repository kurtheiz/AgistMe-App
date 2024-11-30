interface BadgeProps {
  color: 'blue' | 'emerald' | 'amber' | 'red';
  text: string;
}

const colors = {
  blue: 'bg-blue-100 text-blue-800',
  emerald: 'bg-emerald-100 text-emerald-800',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
};

export const Badge = ({ color, text }: BadgeProps) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors[color]}`}>
      {text}
    </span>
  );
};
