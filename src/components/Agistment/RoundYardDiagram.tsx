interface RoundYardDiagramProps {
  diameter: number;
}

export const RoundYardDiagram: React.FC<RoundYardDiagramProps> = ({ diameter }) => {
  // If diameter is 0 or null/undefined, use default value but don't show dimensions
  const isDefault = !diameter || diameter === 0;
  const actualDiameter = isDefault ? 20 : diameter;

  // Calculate dimensions based on 30m reference
  const maxDiameter = 150; // Maximum diameter in pixels
  const referenceSize = 30; // Reference size in meters
  
  // Calculate scale based on reference size, but cap the visual size at 30m
  const scale = maxDiameter / referenceSize;
  
  // Calculate display size, capped at 30m for visual representation
  const displaySize = Math.round(Math.min(30, actualDiameter) * scale);

  if (isDefault) {
    return (
      <div className="flex justify-center">
        <div className="relative" style={{ width: displaySize, height: displaySize }}>
          {/* Circle */}
          <div className="absolute inset-0 border-2 border-neutral-300 rounded-full bg-neutral-50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="relative" style={{ width: displaySize, height: displaySize }}>
        {/* Circle */}
        <div className="absolute inset-0 border-2 border-neutral-300 rounded-full bg-neutral-50"></div>
        {/* Horizontal diameter line */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-neutral-300"></div>
        {/* Diameter text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-neutral-600 bg-neutral-50 px-1">
            {`${diameter}m`}
          </span>
        </div>
      </div>
    </div>
  );
};
