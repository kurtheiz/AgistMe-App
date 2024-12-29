import { Loader2 } from 'lucide-react';

export function InitializationOverlay() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
      <img src="/amlogo.png" alt="AgistMe Logo" className="w-32 h-32 object-contain mb-4" />
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      <div className="text-lg font-medium text-neutral-800">
        Initializing AgistMe...
      </div>
    </div>
  );
}
