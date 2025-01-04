import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { agistmentService } from '../services/agistment.service';

export const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [responseMessage, setResponseMessage] = useState<string>('');

  useEffect(() => {
    if (token) {
      try {
        const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
        const paddedBase64 = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
        const decodedStr = atob(paddedBase64);
        const decoded = JSON.parse(decodedStr);
        
        agistmentService.unregisterFromNotifications(decoded.email, decoded.category)
          .then((response) => {
            setResponseMessage(response.message);
            setStatus('success');
          })
          .catch((e) => {
            console.error('Unsubscribe error:', e);
            setError(e.message || 'Failed to unsubscribe. Please try again later.');
            setStatus('error');
          });
      } catch (e) {
        console.error('Token decode error:', e);
        setError(e instanceof Error ? e.message : 'Invalid unsubscribe token');
        setStatus('error');
      }
    }
  }, [token]);

  return (
    <div className="h-[50vh] flex items-center justify-center bg-white">
      <div className="w-full max-w-md mx-4 p-6">
        <h1 className="text-2xl font-semibold text-center mb-4">Unsubscribe</h1>
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Processing your request...</p>
          </div>
        )}
        {error ? (
          <div className="text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : status === 'success' ? (
          <div className="text-center">
            <p className="text-green-600">{responseMessage}</p>
          </div>
        ) : null}
        
        <button
          onClick={() => navigate('/')}
          className="mt-6 w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};
