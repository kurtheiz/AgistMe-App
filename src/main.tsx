import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App';
import { StrictMode } from 'react';

// Get the container element
const container = document.getElementById('root');

// Ensure the container exists
if (!container) {
  throw new Error('Root element not found');
}

// Create root only if it hasn't been created before
const root = ReactDOM.createRoot(container);

// Initial render
root.render(
  <StrictMode>
      <App />
  </StrictMode>
);

// Handle HMR
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    // Clean up if needed
  });
}
