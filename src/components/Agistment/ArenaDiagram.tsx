interface ArenaDiagramProps {
  length: number;
  width: number;
}

export const ArenaDiagram: React.FC<ArenaDiagramProps> = ({ length, width }) => {
  // If either dimension is 0, use default values but don't show dimensions
  const isDefault = length === 0 || width === 0;
  const actualLength = isDefault ? 60 : length;
  const actualWidth = isDefault ? 30 : width;

  // Calculate dimensions while maintaining aspect ratio
  const maxWidth = 200; // Maximum width in pixels
  const maxHeight = 150; // Maximum height in pixels
  
  // Calculate scale based on the larger dimension
  const scale = Math.min(maxWidth / actualLength, maxHeight / actualWidth);
  
  // Calculate actual display dimensions
  const displayLength = Math.round(actualLength * scale);
  const displayWidth = Math.round(actualWidth * scale);

  if (isDefault) {
    return (
      <div className="relative inline-flex flex-col items-center">
        {/* Arena rectangle only */}
        <div 
          className="border-2 border-neutral-300 rounded-sm bg-neutral-50"
          style={{ 
            width: displayLength,
            height: displayWidth
          }}
        ></div>
      </div>
    );
  }

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* Width dimension */}
      <div className="flex items-center mb-2 ml-5" style={{ width: displayLength }}>
        <div className="w-1 h-3 bg-neutral-300"></div>
        <div className="flex-1 h-[1px] bg-neutral-300"></div>
        <span className="text-xs text-neutral-600 absolute left-[55%] -translate-x-1/2 -translate-y-2">
          {`${length}m`}
        </span>
        <div className="w-1 h-3 bg-neutral-300"></div>
      </div>
      <div className="flex items-start">
        {/* Length dimension */}
        <div className="flex flex-col items-center mr-2" style={{ height: displayWidth }}>
          <div className="h-1 w-3 bg-neutral-300"></div>
          <div className="flex-1 w-[1px] bg-neutral-300"></div>
          <span className="text-xs text-neutral-600 absolute -translate-x-2 top-[60%] -translate-y-1/2 rotate-180 [writing-mode:vertical-lr]">
            {`${width}m`}
          </span>
          <div className="h-1 w-3 bg-neutral-300"></div>
        </div>
        {/* Arena rectangle */}
        <div 
          className="border-2 border-neutral-300 rounded-sm bg-neutral-50"
          style={{ 
            width: displayLength,
            height: displayWidth
          }}
        ></div>
      </div>
    </div>
  );
};
