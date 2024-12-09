interface AgistmentMapProps {
  address: string;
}

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
  overflow: 'hidden'
};

export function AgistmentMap({ address }: AgistmentMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const encodedAddress = encodeURIComponent(address);
  
  return (
    <div style={containerStyle}>
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}`}
      />
    </div>
  );
}
